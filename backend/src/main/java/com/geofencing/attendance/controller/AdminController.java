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
    private DepartmentRepository departmentRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private AttendanceRepository attendanceRepository;

    // ===== DEPARTMENT CRUD =====

    @PostMapping("/departments")
    public ResponseEntity<?> addDepartment(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Department name is required"));
        }
        if (departmentRepository.existsByName(name.trim())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Department already exists"));
        }
        Department dept = new Department();
        dept.setName(name.trim());
        departmentRepository.save(dept);
        return ResponseEntity
                .ok(Map.of("id", dept.getId(), "name", dept.getName(), "message", "Department added successfully"));
    }

    @GetMapping("/departments")
    public ResponseEntity<?> getDepartments() {
        List<Department> depts = departmentRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Department d : depts) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", d.getId());
            m.put("name", d.getName());
            m.put("sections", sectionRepository.findByDepartmentId(d.getId()).size());
            m.put("students", userRepository.findByRoleAndDepartmentId(Role.STUDENT, d.getId()).size());
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<?> updateDepartment(@PathVariable("id") Long id, @RequestBody Map<String, String> request) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        if (request.containsKey("name")) {
            dept.setName(request.get("name").trim());
        }
        departmentRepository.save(dept);
        return ResponseEntity.ok(Map.of("message", "Department updated successfully"));
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable("id") Long id) {
        // Remove FK references: nullify dept/section on users first
        List<User> usersInDept = userRepository.findByRoleAndDepartmentId(Role.STUDENT, id);
        usersInDept.addAll(userRepository.findByRoleAndDepartmentId(Role.TEACHER, id));
        for (User u : usersInDept) {
            u.setDepartment(null);
            u.setSection(null);
            userRepository.save(u);
        }
        sectionRepository.findByDepartmentId(id).forEach(sectionRepository::delete);
        departmentRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Department deleted successfully"));
    }

    // ===== SECTION CRUD =====

    @PostMapping("/sections")
    public ResponseEntity<?> addSection(@RequestBody Map<String, Object> request) {
        String name = request.get("name").toString().trim();
        Long departmentId = Long.parseLong(request.get("departmentId").toString());

        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        if (sectionRepository.existsByNameAndDepartmentId(name, departmentId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Section already exists in this department"));
        }

        Section section = new Section();
        section.setName(name);
        section.setDepartment(dept);
        sectionRepository.save(section);
        return ResponseEntity.ok(Map.of("id", section.getId(), "name", section.getName(),
                "departmentId", dept.getId(), "message", "Section added successfully"));
    }

    @GetMapping("/sections")
    public ResponseEntity<?> getSections(@RequestParam(value = "departmentId", required = false) Long departmentId) {
        List<Section> sections;
        if (departmentId != null) {
            sections = sectionRepository.findByDepartmentId(departmentId);
        } else {
            sections = sectionRepository.findAll();
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (Section s : sections) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", s.getId());
            m.put("name", s.getName());
            m.put("departmentId", s.getDepartment().getId());
            m.put("departmentName", s.getDepartment().getName());
            m.put("students", userRepository
                    .findByRoleAndDepartmentIdAndSectionId(Role.STUDENT, s.getDepartment().getId(), s.getId()).size());
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/sections/{id}")
    public ResponseEntity<?> deleteSection(@PathVariable("id") Long id) {
        sectionRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Section deleted successfully"));
    }

    // ===== TEACHER CRUD =====

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
        if (request.containsKey("phone"))
            teacher.setPhone(request.get("phone"));
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

    @GetMapping("/teachers")
    public ResponseEntity<?> getTeachers() {
        List<User> teachers = userRepository.findByRole(Role.TEACHER);
        List<Map<String, Object>> result = new ArrayList<>();

        for (User teacher : teachers) {
            Map<String, Object> t = new HashMap<>();
            t.put("id", teacher.getId());
            t.put("name", teacher.getName());
            t.put("email", teacher.getEmail());
            t.put("phone", teacher.getPhone());
            t.put("profilePicture", teacher.getProfilePicture());

            teacherDetailRepository.findByTeacherId(teacher.getId()).ifPresent(detail -> {
                t.put("subject", detail.getSubject());
                t.put("attendanceActive", detail.isAttendanceActive());
            });
            result.add(t);
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/teachers/{id}")
    public ResponseEntity<?> updateTeacher(@PathVariable("id") Long id, @RequestBody Map<String, String> request) {
        User teacher = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (request.containsKey("name"))
            teacher.setName(request.get("name"));
        if (request.containsKey("email"))
            teacher.setEmail(request.get("email"));
        if (request.containsKey("phone"))
            teacher.setPhone(request.get("phone"));
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

    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable("id") Long id) {
        // Delete attendance records first to avoid FK constraint
        attendanceRepository.findByTeacherId(id).forEach(attendanceRepository::delete);
        teacherDetailRepository.findByTeacherId(id).ifPresent(teacherDetailRepository::delete);
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Teacher deleted successfully"));
    }

    // ===== STUDENT CRUD =====

    @PostMapping("/students")
    public ResponseEntity<?> addStudent(@RequestBody Map<String, Object> request) {
        String name = request.get("name").toString();
        String email = request.get("email").toString();
        String password = request.get("password").toString();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        User student = new User();
        student.setName(name);
        student.setEmail(email);
        student.setPassword(passwordEncoder.encode(password));
        student.setRole(Role.STUDENT);

        if (request.containsKey("phone"))
            student.setPhone(request.get("phone").toString());

        if (request.containsKey("departmentId")) {
            Long deptId = Long.parseLong(request.get("departmentId").toString());
            departmentRepository.findById(deptId).ifPresent(student::setDepartment);
        }
        if (request.containsKey("sectionId")) {
            Long secId = Long.parseLong(request.get("sectionId").toString());
            sectionRepository.findById(secId).ifPresent(student::setSection);
        }

        userRepository.save(student);

        Map<String, Object> response = new HashMap<>();
        response.put("id", student.getId());
        response.put("name", student.getName());
        response.put("email", student.getEmail());
        response.put("message", "Student added successfully");
        return ResponseEntity.ok(response);
    }

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
        for (User student : students) {
            Map<String, Object> s = new HashMap<>();
            s.put("id", student.getId());
            s.put("name", student.getName());
            s.put("email", student.getEmail());
            s.put("phone", student.getPhone());
            s.put("profilePicture", student.getProfilePicture());
            s.put("createdAt", student.getCreatedAt());
            if (student.getDepartment() != null) {
                s.put("departmentId", student.getDepartment().getId());
                s.put("departmentName", student.getDepartment().getName());
            }
            if (student.getSection() != null) {
                s.put("sectionId", student.getSection().getId());
                s.put("sectionName", student.getSection().getName());
            }
            result.add(s);
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable("id") Long id, @RequestBody Map<String, Object> request) {
        User student = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (request.containsKey("name"))
            student.setName(request.get("name").toString());
        if (request.containsKey("email"))
            student.setEmail(request.get("email").toString());
        if (request.containsKey("phone"))
            student.setPhone(request.get("phone").toString());
        if (request.containsKey("password") && !request.get("password").toString().isEmpty()) {
            student.setPassword(passwordEncoder.encode(request.get("password").toString()));
        }
        if (request.containsKey("departmentId")) {
            Long deptId = Long.parseLong(request.get("departmentId").toString());
            departmentRepository.findById(deptId).ifPresent(student::setDepartment);
        }
        if (request.containsKey("sectionId")) {
            Long secId = Long.parseLong(request.get("sectionId").toString());
            sectionRepository.findById(secId).ifPresent(student::setSection);
        }

        userRepository.save(student);
        return ResponseEntity.ok(Map.of("message", "Student updated successfully"));
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable("id") Long id) {
        // Delete attendance records first to avoid FK constraint
        attendanceRepository.findByStudentId(id).forEach(attendanceRepository::delete);
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Student deleted successfully"));
    }

    // ===== ANALYTICS =====

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        return ResponseEntity.ok(attendanceService.getAdminAnalytics());
    }
}
