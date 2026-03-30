package com.geofencing.attendance.controller;

import com.geofencing.attendance.entity.*;
import com.geofencing.attendance.repository.*;
import com.geofencing.attendance.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/teacher")
public class TeacherController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private TeacherDetailRepository teacherDetailRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Get all departments
    @GetMapping("/departments")
    public ResponseEntity<?> getDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    // Get sections by department
    @GetMapping("/sections")
    public ResponseEntity<?> getSections(@RequestParam("departmentId") Long departmentId) {
        return ResponseEntity.ok(sectionRepository.findByDepartmentId(departmentId));
    }

    // Get students by department and section
    @GetMapping("/students")
    public ResponseEntity<?> getStudents(
            @RequestParam(value = "departmentId", required = false) Long departmentId,
            @RequestParam(value = "sectionId", required = false) Long sectionId) {

        List<User> students;
        if (departmentId != null && sectionId != null) {
            students = userRepository.findByRoleAndDepartmentIdAndSectionId(Role.STUDENT, departmentId, sectionId);
        } else if (departmentId != null) {
            students = userRepository.findByRoleAndDepartmentId(Role.STUDENT, departmentId);
        } else {
            students = userRepository.findByRole(Role.STUDENT);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (User s : students) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", s.getId());
            m.put("name", s.getName());
            m.put("email", s.getEmail());
            m.put("phone", s.getPhone());
            if (s.getDepartment() != null) {
                m.put("departmentName", s.getDepartment().getName());
            }
            if (s.getSection() != null) {
                m.put("sectionName", s.getSection().getName());
            }
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    // Start session with department + section targeting
    @PostMapping("/start-session")
    public ResponseEntity<?> startSession(@RequestBody Map<String, Object> request) {
        try {
            Long teacherId = Long.parseLong(request.get("teacherId").toString());
            double lat = Double.parseDouble(request.get("lat").toString());
            double lon = Double.parseDouble(request.get("lon").toString());
            double radius = Double.parseDouble(request.get("radius").toString());
            String subject = request.getOrDefault("subject", "General").toString();

            Long departmentId = request.get("departmentId") != null
                    ? Long.parseLong(request.get("departmentId").toString())
                    : null;
            Long sectionId = request.get("sectionId") != null
                    ? Long.parseLong(request.get("sectionId").toString())
                    : null;

            TeacherDetail detail = attendanceService.startSession(
                    teacherId, lat, lon, radius, subject, departmentId, sectionId);

            // Notify students via WebSocket
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "SESSION_STARTED");
            notification.put("teacherId", teacherId);
            notification.put("teacherName", detail.getTeacher().getName());
            notification.put("subject", subject);
            if (departmentId != null)
                notification.put("departmentId", departmentId);
            if (sectionId != null)
                notification.put("sectionId", sectionId);
            messagingTemplate.convertAndSend("/topic/attendance", notification);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Session started");
            response.put("subject", subject);
            response.put("radius", radius);
            response.put("latitude", lat);
            response.put("longitude", lon);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Stop session
    @PostMapping("/stop-session")
    public ResponseEntity<?> stopSession(@RequestBody Map<String, Object> request) {
        try {
            Long teacherId = Long.parseLong(request.get("teacherId").toString());
            attendanceService.stopSession(teacherId);

            // Notify students via WebSocket
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "SESSION_STOPPED");
            notification.put("teacherId", teacherId);
            messagingTemplate.convertAndSend("/topic/attendance", notification);

            return ResponseEntity.ok(Map.of("message", "Session stopped"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get today's attendance
    @GetMapping("/attendance/today/{teacherId}")
    public ResponseEntity<?> getTodayAttendance(@PathVariable("teacherId") Long teacherId) {
        List<Attendance> records = attendanceService.getTodayAttendance(teacherId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Attendance a : records) {
            Map<String, Object> r = new HashMap<>();
            r.put("id", a.getId());
            r.put("studentName", a.getStudent().getName());
            r.put("studentId", a.getStudent().getId());
            r.put("subject", a.getSubject());
            r.put("status", a.getStatus());
            r.put("timestamp", a.getTimestamp());
            result.add(r);
        }
        return ResponseEntity.ok(result);
    }

    // Get all attendance records
    @GetMapping("/attendance/all/{teacherId}")
    public ResponseEntity<?> getAllAttendance(@PathVariable("teacherId") Long teacherId) {
        List<Attendance> records = attendanceService.getAttendanceByTeacher(teacherId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Attendance a : records) {
            Map<String, Object> r = new HashMap<>();
            r.put("id", a.getId());
            r.put("studentName", a.getStudent().getName());
            r.put("studentId", a.getStudent().getId());
            r.put("subject", a.getSubject());
            r.put("date", a.getDate());
            r.put("status", a.getStatus());
            r.put("timestamp", a.getTimestamp());
            result.add(r);
        }
        return ResponseEntity.ok(result);
    }

    // Get session status
    @GetMapping("/session-status/{teacherId}")
    public ResponseEntity<?> getSessionStatus(@PathVariable("teacherId") Long teacherId) {
        TeacherDetail detail = teacherDetailRepository.findByTeacherId(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher details not found"));
        Map<String, Object> status = new HashMap<>();
        status.put("active", detail.isAttendanceActive());
        status.put("subject", detail.getSubject());
        status.put("radius", detail.getRadius());
        status.put("latitude", detail.getLatitude());
        status.put("longitude", detail.getLongitude());
        return ResponseEntity.ok(status);
    }

    // Get teacher profile
    @GetMapping("/profile/{teacherId}")
    public ResponseEntity<?> getProfile(@PathVariable("teacherId") Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        TeacherDetail detail = teacherDetailRepository.findByTeacherId(teacherId).orElse(null);

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", teacher.getId());
        profile.put("name", teacher.getName());
        profile.put("email", teacher.getEmail());
        profile.put("profilePicture", teacher.getProfilePicture());
        if (detail != null) {
            profile.put("subject", detail.getSubject());
        }
        return ResponseEntity.ok(profile);
    }
}
