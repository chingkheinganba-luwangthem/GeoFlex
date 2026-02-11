package com.geofencing.attendance.controller;

import com.geofencing.attendance.entity.*;
import com.geofencing.attendance.repository.*;
import com.geofencing.attendance.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherDetailRepository teacherDetailRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AttendanceService attendanceService;

    // Add teacher
    @PostMapping("/teachers")
    public ResponseEntity<?> addTeacher(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String password = request.get("password");
        String subject = request.getOrDefault("subject", "General");

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        User teacher = new User();
        teacher.setName(name);
        teacher.setEmail(email);
        teacher.setPassword(passwordEncoder.encode(password));
        teacher.setRole(Role.TEACHER);
        userRepository.save(teacher);

        TeacherDetail detail = new TeacherDetail();
        detail.setTeacher(teacher);
        detail.setSubject(subject);
        detail.setRadius(100.0);
        teacherDetailRepository.save(detail);

        Map<String, Object> response = new HashMap<>();
        response.put("id", teacher.getId());
        response.put("name", teacher.getName());
        response.put("email", teacher.getEmail());
        response.put("subject", subject);
        response.put("message", "Teacher added successfully");

        return ResponseEntity.ok(response);
    }

    // Get all teachers
    @GetMapping("/teachers")
    public ResponseEntity<?> getTeachers() {
        List<User> teachers = userRepository.findByRole(Role.TEACHER);
        List<Map<String, Object>> result = new ArrayList<>();

        for (User teacher : teachers) {
            Map<String, Object> t = new HashMap<>();
            t.put("id", teacher.getId());
            t.put("name", teacher.getName());
            t.put("email", teacher.getEmail());
            t.put("profilePicture", teacher.getProfilePicture());

            teacherDetailRepository.findByTeacherId(teacher.getId()).ifPresent(detail -> {
                t.put("subject", detail.getSubject());
                t.put("attendanceActive", detail.isAttendanceActive());
            });
            result.add(t);
        }
        return ResponseEntity.ok(result);
    }

    // Update teacher
    @PutMapping("/teachers/{id}")
    public ResponseEntity<?> updateTeacher(@PathVariable("id") Long id, @RequestBody Map<String, String> request) {
        User teacher = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (request.containsKey("name"))
            teacher.setName(request.get("name"));
        if (request.containsKey("email"))
            teacher.setEmail(request.get("email"));
        if (request.containsKey("password") && !request.get("password").isEmpty()) {
            teacher.setPassword(passwordEncoder.encode(request.get("password")));
        }
        userRepository.save(teacher);

        if (request.containsKey("subject")) {
            TeacherDetail detail = teacherDetailRepository.findByTeacherId(id)
                    .orElse(new TeacherDetail());
            detail.setTeacher(teacher);
            detail.setSubject(request.get("subject"));
            teacherDetailRepository.save(detail);
        }

        return ResponseEntity.ok(Map.of("message", "Teacher updated successfully"));
    }

    // Delete teacher
    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable("id") Long id) {
        teacherDetailRepository.findByTeacherId(id).ifPresent(teacherDetailRepository::delete);
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Teacher deleted successfully"));
    }

    // Get all students
    @GetMapping("/students")
    public ResponseEntity<?> getStudents() {
        List<User> students = userRepository.findByRole(Role.STUDENT);
        List<Map<String, Object>> result = new ArrayList<>();

        for (User student : students) {
            Map<String, Object> s = new HashMap<>();
            s.put("id", student.getId());
            s.put("name", student.getName());
            s.put("email", student.getEmail());
            s.put("profilePicture", student.getProfilePicture());
            s.put("createdAt", student.getCreatedAt());
            result.add(s);
        }
        return ResponseEntity.ok(result);
    }

    // Delete student
    @DeleteMapping("/students/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable("id") Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Student deleted successfully"));
    }

    // Analytics
    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        return ResponseEntity.ok(attendanceService.getAdminAnalytics());
    }
}
