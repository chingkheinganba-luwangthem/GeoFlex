package com.geofencing.attendance.service;

import com.geofencing.attendance.entity.*;
import com.geofencing.attendance.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherDetailRepository teacherDetailRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private GeofencingService geofencingService;

    // Teacher starts attendance session with department + section
    public TeacherDetail startSession(Long teacherId, double lat, double lon, double radius, String subject,
            Long departmentId, Long sectionId) {
        TeacherDetail detail = teacherDetailRepository.findByTeacherId(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher details not found"));
        detail.setLatitude(lat);
        detail.setLongitude(lon);
        detail.setRadius(radius);
        detail.setSubject(subject);
        detail.setAttendanceActive(true);

        // Set target department and section
        if (departmentId != null) {
            Department dept = departmentRepository.findById(departmentId)
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            detail.setSessionDepartment(dept);
        }
        if (sectionId != null) {
            Section sec = sectionRepository.findById(sectionId)
                    .orElseThrow(() -> new RuntimeException("Section not found"));
            detail.setSessionSection(sec);
        }

        return teacherDetailRepository.save(detail);
    }

    // Teacher stops attendance session — auto-mark absent only for targeted
    // dept/section
    public TeacherDetail stopSession(Long teacherId) {
        TeacherDetail detail = teacherDetailRepository.findByTeacherId(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher details not found"));

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // Only mark absent for students in the session's target dept/section
        List<User> targetStudents;
        if (detail.getSessionDepartment() != null && detail.getSessionSection() != null) {
            targetStudents = userRepository.findByRoleAndDepartmentIdAndSectionId(
                    Role.STUDENT,
                    detail.getSessionDepartment().getId(),
                    detail.getSessionSection().getId());
        } else if (detail.getSessionDepartment() != null) {
            targetStudents = userRepository.findByRoleAndDepartmentId(
                    Role.STUDENT,
                    detail.getSessionDepartment().getId());
        } else {
            targetStudents = userRepository.findByRole(Role.STUDENT);
        }

        // Mark absent for students who didn't mark attendance today
        for (User student : targetStudents) {
            boolean alreadyMarked = attendanceRepository.existsByStudentIdAndTeacherIdAndDate(
                    student.getId(), teacherId, LocalDate.now());
            if (!alreadyMarked) {
                Attendance absent = new Attendance();
                absent.setStudent(student);
                absent.setTeacher(teacher);
                absent.setSubject(detail.getSubject());
                absent.setDate(LocalDate.now());
                absent.setStatus(AttendanceStatus.ABSENT);
                absent.setLatitude(0.0);
                absent.setLongitude(0.0);
                absent.setTimestamp(LocalDateTime.now());
                attendanceRepository.save(absent);
            }
        }

        detail.setAttendanceActive(false);
        detail.setSessionDepartment(null);
        detail.setSessionSection(null);
        return teacherDetailRepository.save(detail);
    }

    // Student marks attendance (also allows absent→present re-mark)
    public Attendance markAttendance(Long studentId, Long teacherId, double lat, double lon) {
        TeacherDetail detail = teacherDetailRepository.findByTeacherId(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (!detail.isAttendanceActive()) {
            throw new RuntimeException("Attendance session is not active.");
        }

        // Verify student belongs to the session's target dept/section
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (detail.getSessionDepartment() != null) {
            if (student.getDepartment() == null ||
                    !student.getDepartment().getId().equals(detail.getSessionDepartment().getId())) {
                throw new RuntimeException("This session is not for your department.");
            }
        }
        if (detail.getSessionSection() != null) {
            if (student.getSection() == null ||
                    !student.getSection().getId().equals(detail.getSessionSection().getId())) {
                throw new RuntimeException("This session is not for your section.");
            }
        }

        // Check if already has a record for today
        java.util.Optional<Attendance> existing = attendanceRepository.findByStudentIdAndTeacherIdAndDate(
                studentId, teacherId, LocalDate.now());

        if (existing.isPresent()) {
            Attendance record = existing.get();
            if (record.getStatus() == AttendanceStatus.PRESENT) {
                throw new RuntimeException("Attendance already marked as PRESENT for today.");
            }
            // If ABSENT, allow re-marking to PRESENT
            boolean withinRadius = geofencingService.isWithinRadius(
                    detail.getLatitude(), detail.getLongitude(), lat, lon, detail.getRadius());
            if (!withinRadius) {
                double distance = geofencingService.calculateDistance(
                        detail.getLatitude(), detail.getLongitude(), lat, lon);
                throw new RuntimeException("You are outside the geofence. Distance: " +
                        String.format("%.1f", distance) + "m (Radius: " + detail.getRadius() + "m)");
            }
            record.setStatus(AttendanceStatus.PRESENT);
            record.setLatitude(lat);
            record.setLongitude(lon);
            record.setTimestamp(LocalDateTime.now());
            return attendanceRepository.save(record);
        }

        // No existing record — normal flow with geofencing check
        boolean withinRadius = geofencingService.isWithinRadius(
                detail.getLatitude(), detail.getLongitude(), lat, lon, detail.getRadius());

        if (!withinRadius) {
            double distance = geofencingService.calculateDistance(
                    detail.getLatitude(), detail.getLongitude(), lat, lon);
            throw new RuntimeException("You are outside the geofence. Distance: " +
                    String.format("%.1f", distance) + "m (Radius: " + detail.getRadius() + "m)");
        }

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setTeacher(teacher);
        attendance.setSubject(detail.getSubject());
        attendance.setDate(LocalDate.now());
        attendance.setStatus(AttendanceStatus.PRESENT);
        attendance.setLatitude(lat);
        attendance.setLongitude(lon);
        attendance.setTimestamp(LocalDateTime.now());

        return attendanceRepository.save(attendance);
    }

    // Get attendance by teacher (for today)
    public List<Attendance> getTodayAttendance(Long teacherId) {
        return attendanceRepository.findByTeacherIdAndDate(teacherId, LocalDate.now());
    }

    // Get all attendance by teacher
    public List<Attendance> getAttendanceByTeacher(Long teacherId) {
        return attendanceRepository.findByTeacherId(teacherId);
    }

    // Get student attendance records
    public List<Attendance> getStudentAttendance(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    // Get student attendance stats
    public Map<String, Object> getStudentStats(Long studentId) {
        Map<String, Object> stats = new HashMap<>();
        long total = attendanceRepository.countByStudentId(studentId);
        long present = attendanceRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.PRESENT);
        long absent = attendanceRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.ABSENT);
        long leave = attendanceRepository.countByStudentIdAndStatus(studentId, AttendanceStatus.LEAVE);

        stats.put("totalClasses", total);
        stats.put("present", present);
        stats.put("absent", absent);
        stats.put("leave", leave);
        stats.put("presentPercentage", total > 0 ? (present * 100.0 / total) : 0);
        stats.put("absentPercentage", total > 0 ? (absent * 100.0 / total) : 0);
        stats.put("leavePercentage", total > 0 ? (leave * 100.0 / total) : 0);

        // Subject-wise breakdown
        List<Attendance> records = attendanceRepository.findByStudentId(studentId);
        Map<String, Long> subjectWise = records.stream()
                .filter(a -> a.getSubject() != null)
                .collect(Collectors.groupingBy(Attendance::getSubject, Collectors.counting()));
        Map<String, Long> subjectPresent = records.stream()
                .filter(a -> a.getSubject() != null && a.getStatus() == AttendanceStatus.PRESENT)
                .collect(Collectors.groupingBy(Attendance::getSubject, Collectors.counting()));

        List<Map<String, Object>> subjectStats = new ArrayList<>();
        subjectWise.forEach((subject, count) -> {
            Map<String, Object> s = new HashMap<>();
            s.put("subject", subject);
            s.put("total", count);
            s.put("present", subjectPresent.getOrDefault(subject, 0L));
            s.put("percentage", count > 0 ? (subjectPresent.getOrDefault(subject, 0L) * 100.0 / count) : 0);
            subjectStats.add(s);
        });
        stats.put("subjectWise", subjectStats);

        return stats;
    }

    // Get active sessions — all (for backward compat)
    public List<Map<String, Object>> getActiveSessions() {
        return buildSessionList(teacherDetailRepository.findAll().stream()
                .filter(TeacherDetail::isAttendanceActive)
                .collect(Collectors.toList()));
    }

    // Get active sessions filtered for a specific student's dept/section
    public List<Map<String, Object>> getActiveSessionsForStudent(Long studentId) {
        User student = userRepository.findById(studentId).orElse(null);
        if (student == null)
            return Collections.emptyList();

        List<TeacherDetail> activeDetails = teacherDetailRepository.findAll().stream()
                .filter(TeacherDetail::isAttendanceActive)
                .filter(detail -> {
                    // If session has no dept/section set, show to all (backward compat)
                    if (detail.getSessionDepartment() == null)
                        return true;
                    // Match department
                    if (student.getDepartment() == null)
                        return false;
                    if (!student.getDepartment().getId().equals(detail.getSessionDepartment().getId()))
                        return false;
                    // Match section if specified
                    if (detail.getSessionSection() != null) {
                        if (student.getSection() == null)
                            return false;
                        return student.getSection().getId().equals(detail.getSessionSection().getId());
                    }
                    return true;
                })
                .collect(Collectors.toList());

        return buildSessionList(activeDetails);
    }

    private List<Map<String, Object>> buildSessionList(List<TeacherDetail> details) {
        List<Map<String, Object>> sessions = new ArrayList<>();
        for (TeacherDetail detail : details) {
            Map<String, Object> session = new HashMap<>();
            session.put("teacherId", detail.getTeacher().getId());
            session.put("teacherName", detail.getTeacher().getName());
            session.put("subject", detail.getSubject());
            session.put("radius", detail.getRadius());
            if (detail.getSessionDepartment() != null) {
                session.put("departmentName", detail.getSessionDepartment().getName());
            }
            if (detail.getSessionSection() != null) {
                session.put("sectionName", detail.getSessionSection().getName());
            }
            sessions.add(session);
        }
        return sessions;
    }

    // Admin analytics
    public Map<String, Object> getAdminAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalStudents", userRepository.countByRole(Role.STUDENT));
        analytics.put("totalTeachers", userRepository.countByRole(Role.TEACHER));
        analytics.put("totalAttendance", attendanceRepository.count());

        List<Attendance> todayRecords = attendanceRepository.findAll().stream()
                .filter(a -> a.getDate() != null && a.getDate().equals(LocalDate.now()))
                .collect(Collectors.toList());
        analytics.put("todayAttendance", todayRecords.size());

        return analytics;
    }
}
