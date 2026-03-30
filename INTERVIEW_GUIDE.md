# 🎙️ Interview Guide: Geofencing Attendance System

## 1. Project Introduction (The "Elevator Pitch")
"For my final year project/portfolio, I built a **Geofencing Attendance System**. It's a full-stack web application that solves the problem of proxy attendance by using GPS geofencing. Students can only mark present if they are physically within a specific radius of the teacher's device."

## 2. Your Role & Tech Stack
**Role:** Full Stack Developer (End-to-End)
**Backend:** Java Spring Boot (REST APIs, Security, WebSocket)
**Frontend:** React.js (Vite, Tailwind/CSS modules)
**Database:** MySQL (Relational data model)
**Real-Time:** STOMP over WebSocket (for live attendance counting)
**Security:** JWT (JSON Web Tokens) with Role-Based Access Control (RBAC)

## 3. Key Features to Highlight
1.  **Geofencing Algorithm:** "I implemented the Haversine formula on the backend to calculate the distance between the student's coordinates and the teacher's set location. If the distance > radius (e.g., 50m), the request is rejected."
2.  **Real-Time Dashboard:** "Teachers see attendance counts update instantly without refreshing the page, using WebSockets."
3.  **Smart Absent Logic:** "The system automatically marks students as 'ABSENT' if they haven't marked attendance when the session ends. It also handles edge cases where a teacher might restart a session to allow latecomers."
4.  **Security:** "I used Spring Security to ensure unauthorized users can't access admin or teacher endpoints."

## 4. Technical Challenges & Solutions (STARR Method)
*   **Challenge:** "Handling real-time updates for the teacher's dashboard was tricky."
*   **Solution:** "I chose WebSockets over polling because polling is resource-intensive. `STOMP` made it easier to route messages to specific topic channels (e.g., `/topic/attendance/{teacherId}`)."

*   **Challenge:** "Preventing GPS spoofing."
*   **Solution:** "I added server-side validation. Even if a student tries to send a fake request, the backend verifies the coordinates against the active session constraints."

## 5. Potential Questions & Answers
**Q: Why SQL and not NoSQL?**
A: "The data is highly structured (Users, Attendance Records, Relations). ACID properties were important for attendance consistency."

**Q: How do you handle scalability?**
A: "The backend is stateless (JWT), so we can horizontally scale Spring Boot instances. For the database, we could implement read replicas or sharding if the user base grows."

**Q: Future improvements?**
A: "I'd add IP address validation as a secondary check, or integrate Face ID for biometric verification."
