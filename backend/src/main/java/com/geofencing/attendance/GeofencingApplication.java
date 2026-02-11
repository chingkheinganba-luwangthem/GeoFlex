package com.geofencing.attendance;

import com.geofencing.attendance.entity.*;
import com.geofencing.attendance.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class GeofencingApplication {

	public static void main(String[] args) {
		SpringApplication.run(GeofencingApplication.class, args);
	}

	@Bean
	public CommandLineRunner seedData(UserRepository userRepository,
			TeacherDetailRepository teacherDetailRepository,
			PasswordEncoder passwordEncoder) {
		return args -> {
			// Seed Admin
			if (!userRepository.existsByEmail("admin@geofence.com")) {
				User admin = new User();
				admin.setName("System Admin");
				admin.setEmail("admin@geofence.com");
				admin.setPassword(passwordEncoder.encode("admin123"));
				admin.setRole(Role.ADMIN);
				userRepository.save(admin);
				System.out.println("✅ Seeded Admin: admin@geofence.com / admin123");
			}

			// Seed a demo Teacher
			if (userRepository.findByRole(Role.TEACHER).isEmpty()) {
				User teacher = new User();
				teacher.setName("Dr. Smith");
				teacher.setEmail("teacher@geofence.com");
				teacher.setPassword(passwordEncoder.encode("teacher123"));
				teacher.setRole(Role.TEACHER);
				userRepository.save(teacher);

				TeacherDetail detail = new TeacherDetail();
				detail.setTeacher(teacher);
				detail.setSubject("Mathematics");
				detail.setRadius(100.0);
				teacherDetailRepository.save(detail);
				System.out.println("✅ Seeded Teacher: teacher@geofence.com / teacher123");
			}

			// Seed a demo Student
			if (userRepository.findByRole(Role.STUDENT).isEmpty()) {
				User student = new User();
				student.setName("John Doe");
				student.setEmail("student@geofence.com");
				student.setPassword(passwordEncoder.encode("student123"));
				student.setRole(Role.STUDENT);
				userRepository.save(student);
				System.out.println("✅ Seeded Student: student@geofence.com / student123");
			}
		};
	}
}
