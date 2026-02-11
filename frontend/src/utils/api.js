import axios from 'axios';

const API_BASE_URL = 'http://localhost:8088/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// JWT interceptor - attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// ===== Auth =====
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (data) => api.post('/auth/register', data),
};

// ===== Admin =====
export const adminAPI = {
    getTeachers: () => api.get('/admin/teachers'),
    addTeacher: (data) => api.post('/admin/teachers', data),
    updateTeacher: (id, data) => api.put(`/admin/teachers/${id}`, data),
    deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),
    getStudents: () => api.get('/admin/students'),
    deleteStudent: (id) => api.delete(`/admin/students/${id}`),
    getAnalytics: () => api.get('/admin/analytics'),
};

// ===== Teacher =====
export const teacherAPI = {
    startSession: (data) => api.post('/teacher/start-session', data),
    stopSession: (data) => api.post('/teacher/stop-session', data),
    getTodayAttendance: (teacherId) => api.get(`/teacher/attendance/today/${teacherId}`),
    getAllAttendance: (teacherId) => api.get(`/teacher/attendance/all/${teacherId}`),
    getSessionStatus: (teacherId) => api.get(`/teacher/session-status/${teacherId}`),
    getProfile: (teacherId) => api.get(`/teacher/profile/${teacherId}`),
};

// ===== Student =====
export const studentAPI = {
    markAttendance: (data) => api.post('/student/mark-attendance', data),
    getAttendance: (studentId) => api.get(`/student/attendance/${studentId}`),
    getStats: (studentId) => api.get(`/student/stats/${studentId}`),
    getActiveSessions: () => api.get('/student/active-sessions'),
    getProfile: (studentId) => api.get(`/student/profile/${studentId}`),
    updateProfile: (studentId, data) => api.put(`/student/profile/${studentId}`, data),
};

export default api;
