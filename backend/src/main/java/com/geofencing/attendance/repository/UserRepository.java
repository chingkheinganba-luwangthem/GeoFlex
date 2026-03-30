package com.geofencing.attendance.repository;

import com.geofencing.attendance.entity.User;
import com.geofencing.attendance.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    long countByRole(Role role);

    List<User> findByRoleAndDepartmentId(Role role, Long departmentId);

    List<User> findByRoleAndDepartmentIdAndSectionId(Role role, Long departmentId, Long sectionId);

    long countByRoleAndDepartmentIdAndSectionId(Role role, Long departmentId, Long sectionId);
}
