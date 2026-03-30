# 🧠 GeoFlex - Project Logic & Integration Guide

This document explains **how the code works** and how the different parts (Frontend, Backend, Database) talk to each other. It is designed to be easy to understand for your presentation or documentation.

---

## 1. High-Level Architecture
The system follows a **Full-Stack Client-Server architecture**:
*   **Frontend (React)**: The user interface where Teachers and Students interact.
*   **Backend (Spring Boot)**: The "brain" that handles security, distance calculations, and database storage.
*   **Database (MySQL)**: Stores users, attendance records, and session details.
*   **WebSockets**: A "live pipe" that sends updates (like attendance counts) instantly without refreshing.

---

## 2. Core Feature: Geofencing Logic
The most important part of the code is verifying IF a student is actually in class.

### How it works:
1.  **Teacher's Location**: When a teacher starts a session, their GPS coordinates (Latitude/Longitude) and a radius (e.g., 50 meters) are saved in the `teacher_details` table.
2.  **Student's Location**: When a student clicks "Mark Attendance", the React frontend gets their GPS coordinates using the browser's Geolocation API.
3.  **Distance Calculation**: The frontend sends these coordinates to the backend. The backend uses the **Haversine Formula** (located in `GeofencingService.java`).
    *   *Mathematics:* It calculates the distance between two points on a sphere (the Earth).
4.  **Verification**: 
    *   If `Distance <= Teacher's Radius` → Attendance is marked **PRESENT**.
    *   If `Distance > Teacher's Radius` → The system throws an error: "You are outside the geofence."

---

## 3. Real-Time Integration (WebSockets)
We use **STOMP over WebSockets** to make the app feel "alive."

*   **Integration Point**: `WebSocketConfig.java` on the backend and `@stomp/stompjs` on the frontend.
*   **The Flow**:
    1.  The Teacher's dashboard "subscribes" to a topic: `/topic/attendance/{teacherId}`.
    2.  When any student successfully marks attendance, the backend sends a tiny message through this topic.
    3.  The Teacher’s React component receives this message and updates the "Present Students" count **instantly** without a page reload.

---

## 4. Security Logic (JWT & RBAC)
We don't want Students to access Admin features.

*   **JWT (JSON Web Token)**: When you log in, the server gives you a "digital pass" (the Token). 
*   **Integration**: The frontend saves this token in `localStorage`. Every time the frontend calls an API, it attaches this token in the header.
*   **RBAC (Role-Based Access Control)**:
    *   The `SecurityConfig.java` defines which roles can see which URLs.
    *   `ADMIN` → Can manage all users.
    *   `TEACHER` → Can start/stop sessions.
    *   `STUDENT` → Can mark attendance and view their own stats.

---

## 5. The "Absent" Feature Logic
This was a specialized requirement to ensure everyone is accounted for.

*   **Automatic Marking**: In `AttendanceService.java`, when the `stopSession()` method is called:
    1.  The system finds all students registered in the platform.
    2.  It checks if they already have a record for today's session.
    3.  If **no record** is found, it automatically creates a new record with status **ABSENT**.
*   **Updating Status**: If a teacher restarts a session, the `markAttendance()` logic checks if an `ABSENT` record exists. If it does, it **updates** that record to `PRESENT` instead of creating a duplicate.

---

## 6. Frontend Code Structure (React)
The frontend is organized into logical services:
*   **`api.js`**: The central place for all HTTP calls. It uses "Interceptors" to automatically add the Security Token to every request.
*   **`location.js`**: A helper that handles the messy browser GPS permissions.
*   **Components**: 
    *   `Login.jsx` / `Register.jsx`: Handle the entry.
    *   `Dashboard.jsx`: Large components that use `Recharts` to draw the pie and bar charts based on data from the backend.

---

## 7. Database Integration
We use **Spring Data JPA**. You don't write "SQL queries" manually in the code.
*   **Repositories**: Interfaces like `AttendanceRepository` allow us to find data using simple method names like `findByStudentId()`. Spring Boot converts these into SQL automatically.

---

## Summary for Interviewers:
"This project demonstrates **Full-Stack integration** where the Frontend (React) consumes a Secure REST API (Spring Boot). It highlights complex logic like **Geospatial calculation** and **Asynchronous messaging** (WebSockets) to solve a real-world problem of attendance fraud."
