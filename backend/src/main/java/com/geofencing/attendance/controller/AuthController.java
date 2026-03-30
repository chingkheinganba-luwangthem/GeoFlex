package com.geofencing.attendance.controller;

import com.geofencing.attendance.entity.*;
import com.geofencing.attendance.repository.*;
import com.geofencing.attendance.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // Login for all roles
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole().name());
        response.put("userId", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("profilePicture", user.getProfilePicture());

        return ResponseEntity.ok(response);
    }

    // Student self-registration with department/section
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> request) {
        String name = request.get("name") != null ? request.get("name").toString() : null;
        String email = request.get("email") != null ? request.get("email").toString() : null;
        String password = request.get("password") != null ? request.get("password").toString() : null;
        String phone = request.get("phone") != null ? request.get("phone").toString() : null;

        if (name == null || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, email, and password are required"));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        if (password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }

        User student = new User();
        student.setName(name);
        student.setEmail(email);
        student.setPassword(passwordEncoder.encode(password));
        student.setRole(Role.STUDENT);
        student.setPhone(phone);

        if (request.containsKey("departmentId") && request.get("departmentId") != null) {
            Long deptId = Long.parseLong(request.get("departmentId").toString());
            Department dept = departmentRepository.findById(deptId).orElse(null);
            if (dept == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid department"));
            }
            student.setDepartment(dept);
        }

        if (request.containsKey("sectionId") && request.get("sectionId") != null) {
            Long secId = Long.parseLong(request.get("sectionId").toString());
            Section section = sectionRepository.findById(secId).orElse(null);
            if (section == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid section"));
            }
            student.setSection(section);
        }

        if (request.containsKey("deviceId") && request.get("deviceId") != null) {
            student.setDeviceId(request.get("deviceId").toString());
        }

        userRepository.save(student);

        String token = jwtUtil.generateToken(student.getEmail(), student.getRole().name(), student.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", student.getRole().name());
        response.put("userId", student.getId());
        response.put("name", student.getName());
        response.put("email", student.getEmail());
        response.put("message", "Registration successful");

        return ResponseEntity.ok(response);
    }

    // Public endpoint: get departments for registration dropdown
    @GetMapping("/departments")
    public ResponseEntity<?> getDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    // Public endpoint: get sections by department for registration dropdown
    @GetMapping("/sections")
    public ResponseEntity<?> getSections(@RequestParam("departmentId") Long departmentId) {
        return ResponseEntity.ok(sectionRepository.findByDepartmentId(departmentId));
    }
}
