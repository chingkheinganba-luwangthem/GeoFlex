package com.geofencing.attendance.repository;

import com.geofencing.attendance.entity.TeacherDetail;
import com.geofencing.attendance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TeacherDetailRepository extends JpaRepository<TeacherDetail, Long> {
    Optional<TeacherDetail> findByTeacher(User teacher);

    Optional<TeacherDetail> findByTeacherId(Long teacherId);
}
