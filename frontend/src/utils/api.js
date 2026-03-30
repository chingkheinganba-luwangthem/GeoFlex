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
    getDepartments: () => api.get('/auth/departments'),
    getSections: (departmentId) => api.get(`/auth/sections?departmentId=${departmentId}`),
};

// ===== Admin =====
export const adminAPI = {
    // Teachers
    getTeachers: () => api.get('/admin/teachers'),
    addTeacher: (data) => api.post('/admin/teachers', data),
    updateTeacher: (id, data) => api.put(`/admin/teachers/${id}`, data),
    deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),

    // Students
    getStudents: (departmentId, sectionId) => {
        let url = '/admin/students';
        const params = [];
        if (departmentId) params.push(`departmentId=${departmentId}`);
        if (sectionId) params.push(`sectionId=${sectionId}`);
        if (params.length) url += '?' + params.join('&');
        return api.get(url);
    },
    addStudent: (data) => api.post('/admin/students', data),
    updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
    deleteStudent: (id) => api.delete(`/admin/students/${id}`),

    // Departments
    getDepartments: () => api.get('/admin/departments'),
    addDepartment: (data) => api.post('/admin/departments', data),
    updateDepartment: (id, data) => api.put(`/admin/departments/${id}`, data),
    deleteDepartment: (id) => api.delete(`/admin/departments/${id}`),

    // Sections
    getSections: (departmentId) => {
        let url = '/admin/sections';
        if (departmentId) url += `?departmentId=${departmentId}`;
        return api.get(url);
    },
    addSection: (data) => api.post('/admin/sections', data),
    deleteSection: (id) => api.delete(`/admin/sections/${id}`),

    // Analytics
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
    getDepartments: () => api.get('/teacher/departments'),
    getSections: (departmentId) => api.get(`/teacher/sections?departmentId=${departmentId}`),
    getStudents: (departmentId, sectionId) => {
        let url = '/teacher/students';
        const params = [];
        if (departmentId) params.push(`departmentId=${departmentId}`);
        if (sectionId) params.push(`sectionId=${sectionId}`);
        if (params.length) url += '?' + params.join('&');
        return api.get(url);
    },
};

// ===== Student =====
export const studentAPI = {
    markAttendance: (data) => api.post('/student/mark-attendance', data),
    getAttendance: (studentId) => api.get(`/student/attendance/${studentId}`),
    getStats: (studentId) => api.get(`/student/stats/${studentId}`),
    getActiveSessions: (studentId) => api.get(`/student/active-sessions${studentId ? '?studentId=' + studentId : ''}`),
    getProfile: (studentId) => api.get(`/student/profile/${studentId}`),
    updateProfile: (studentId, data) => api.put(`/student/profile/${studentId}`, data),
};

export default api;
