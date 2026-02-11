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
@RequestMapping("/api/student")
public class StudentController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Mark attendance
    @PostMapping("/mark-attendance")
    public ResponseEntity<?> markAttendance(@RequestBody Map<String, Object> request) {
        try {
            Long studentId = Long.parseLong(request.get("studentId").toString());
            Long teacherId = Long.parseLong(request.get("teacherId").toString());
            double lat = Double.parseDouble(request.get("lat").toString());
            double lon = Double.parseDouble(request.get("lon").toString());

            Attendance attendance = attendanceService.markAttendance(studentId, teacherId, lat, lon);

            // Notify teacher via WebSocket
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "ATTENDANCE_MARKED");
            notification.put("studentName", attendance.getStudent().getName());
            notification.put("studentId", studentId);
            notification.put("teacherId", teacherId);
            notification.put("timestamp", attendance.getTimestamp());
            messagingTemplate.convertAndSend("/topic/attendance/" + teacherId, notification);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Attendance marked successfully");
            response.put("subject", attendance.getSubject());
            response.put("timestamp", attendance.getTimestamp());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get student attendance history
    @GetMapping("/attendance/{studentId}")
    public ResponseEntity<?> getAttendance(@PathVariable("studentId") Long studentId) {
        List<Attendance> records = attendanceService.getStudentAttendance(studentId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Attendance a : records) {
            Map<String, Object> r = new HashMap<>();
            r.put("id", a.getId());
            r.put("teacherName", a.getTeacher().getName());
            r.put("subject", a.getSubject());
            r.put("date", a.getDate());
            r.put("status", a.getStatus());
            r.put("timestamp", a.getTimestamp());
            result.add(r);
        }
        return ResponseEntity.ok(result);
    }

    // Get student stats
    @GetMapping("/stats/{studentId}")
    public ResponseEntity<?> getStats(@PathVariable("studentId") Long studentId) {
        return ResponseEntity.ok(attendanceService.getStudentStats(studentId));
    }

    // Get active sessions
    @GetMapping("/active-sessions")
    public ResponseEntity<?> getActiveSessions() {
        return ResponseEntity.ok(attendanceService.getActiveSessions());
    }

    // Get student profile
    @GetMapping("/profile/{studentId}")
    public ResponseEntity<?> getProfile(@PathVariable("studentId") Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", student.getId());
        profile.put("name", student.getName());
        profile.put("email", student.getEmail());
        profile.put("profilePicture", student.getProfilePicture());
        profile.put("createdAt", student.getCreatedAt());
        return ResponseEntity.ok(profile);
    }

    // Update profile
    @PutMapping("/profile/{studentId}")
    public ResponseEntity<?> updateProfile(@PathVariable("studentId") Long studentId,
            @RequestBody Map<String, String> request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        if (request.containsKey("name"))
            student.setName(request.get("name"));
        if (request.containsKey("profilePicture"))
            student.setProfilePicture(request.get("profilePicture"));
        userRepository.save(student);
        return ResponseEntity.ok(Map.of("message", "Profile updated"));
    }
}
