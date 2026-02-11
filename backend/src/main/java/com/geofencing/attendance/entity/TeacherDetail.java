package com.geofencing.attendance.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "teacher_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "teacher_id", unique = true)
    private User teacher;

    @Column(length = 100)
    private String subject;

    private Double latitude;
    private Double longitude;
    private Double radius = 100.0;
    private boolean attendanceActive = false;
}
