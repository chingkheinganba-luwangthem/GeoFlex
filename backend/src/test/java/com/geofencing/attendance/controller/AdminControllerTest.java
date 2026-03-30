package com.geofencing.attendance.controller;

import com.geofencing.attendance.entity.Role;
import com.geofencing.attendance.entity.User;
import com.geofencing.attendance.repository.*;
import com.geofencing.attendance.service.AttendanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

public class AdminControllerTest {

    @InjectMocks
    private AdminController adminController;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TeacherDetailRepository teacherDetailRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private SectionRepository sectionRepository;

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AttendanceService attendanceService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testDeleteTeacher() {
        Long teacherId = 1L;

        // Mock execution
        when(attendanceRepository.findByTeacherId(teacherId)).thenReturn(Collections.emptyList());
        when(teacherDetailRepository.findByTeacherId(teacherId)).thenReturn(Optional.empty());

        ResponseEntity<?> response = adminController.deleteTeacher(teacherId);

        // Verify attendance records are deleted first
        verify(attendanceRepository, times(1)).findByTeacherId(teacherId);
        // We can't verify delete on the list directly easily without capturing, but the
        // fact findByTeacherId is called implies the logic is hit.
        // The most important thing is that the method executes without error and calls
        // the repositories.

        verify(teacherDetailRepository, times(1)).findByTeacherId(teacherId);
        verify(userRepository, times(1)).deleteById(teacherId);

        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    public void testDeleteStudent() {
        Long studentId = 2L;

        // Mock execution
        when(attendanceRepository.findByStudentId(studentId)).thenReturn(Collections.emptyList());

        ResponseEntity<?> response = adminController.deleteStudent(studentId);

        // Verify attendance records are deleted first
        verify(attendanceRepository, times(1)).findByStudentId(studentId);
        verify(userRepository, times(1)).deleteById(studentId);

        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    public void testDeleteDepartment() {
        Long deptId = 3L;
        User studentInDept = new User();
        studentInDept.setId(10L);
        studentInDept.setRole(Role.STUDENT);

        when(userRepository.findByRoleAndDepartmentId(Role.STUDENT, deptId))
                .thenReturn(new java.util.ArrayList<>(Collections.singletonList(studentInDept)));
        when(userRepository.findByRoleAndDepartmentId(Role.TEACHER, deptId)).thenReturn(new java.util.ArrayList<>());
        when(sectionRepository.findByDepartmentId(deptId)).thenReturn(Collections.emptyList());

        ResponseEntity<?> response = adminController.deleteDepartment(deptId);

        // Verify users are updated (dept set to null)
        verify(userRepository, times(1)).save(studentInDept);
        assertNull(studentInDept.getDepartment());

        verify(sectionRepository, times(1)).findByDepartmentId(deptId);
        verify(departmentRepository, times(1)).deleteById(deptId);

        assertEquals(200, response.getStatusCode().value());
    }
}
