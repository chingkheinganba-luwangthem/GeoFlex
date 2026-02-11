# Geofencing Attendance - Frontend

This is the frontend for the Geofencing Attendance application, built with React + Vite.
It uses **Standard CSS** (no Tailwind) and communicates with a Java Spring Boot backend.

## Prerequisites
- Node.js & npm installed.

## Setup & Run
1. Open this folder in a terminal.
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the link shown in the terminal (usually `http://localhost:5173`).

## Configuration
- **Backend URL**: Configured in `src/utils/api.js`. Currently set to `http://localhost:8088/api`.

## Project Structure
- `src/components`: React components (Login, TeacherDashboard, StudentDashboard).
- `src/utils`: Helper functions for API and Location.
- `src/index.css`: Global styles (Standard CSS).
