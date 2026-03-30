package com.geofencing.attendance.repository;

import com.geofencing.attendance.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findByDepartmentId(Long departmentId);

    boolean existsByNameAndDepartmentId(String name, Long departmentId);
}
