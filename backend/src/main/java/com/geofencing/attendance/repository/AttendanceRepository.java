package com.geofencing.attendance.repository;

import com.geofencing.attendance.entity.Attendance;
import com.geofencing.attendance.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);

    List<Attendance> findByTeacherId(Long teacherId);

    List<Attendance> findByTeacherIdAndDate(Long teacherId, LocalDate date);

    List<Attendance> findByStudentIdAndSubject(Long studentId, String subject);

    long countByStudentId(Long studentId);

    long countByStudentIdAndStatus(Long studentId, AttendanceStatus status);

    boolean existsByStudentIdAndTeacherIdAndDate(Long studentId, Long teacherId, LocalDate date);

    java.util.Optional<Attendance> findByStudentIdAndTeacherIdAndDate(Long studentId, Long teacherId, LocalDate date);

    List<Attendance> findByTeacherIdAndDateAndStatus(Long teacherId, LocalDate date, AttendanceStatus status);
}
