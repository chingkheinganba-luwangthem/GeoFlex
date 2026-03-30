import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import Navbar from './Navbar';
import { teacherAPI } from '../utils/api';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#6366f1'];

export default function TeacherDashboard() {
    const [activeTab, setActiveTab] = useState('session');
    const [sessionActive, setSessionActive] = useState(false);
    const [todayRecords, setTodayRecords] = useState([]);
    const [allRecords, setAllRecords] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [selectedSecId, setSelectedSecId] = useState('');

    // Session form
    const [subject, setSubject] = useState('');
    const [radius, setRadius] = useState(100);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const teacherId = localStorage.getItem('userId');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [status, today, all, depts] = await Promise.all([
                teacherAPI.getSessionStatus(teacherId),
                teacherAPI.getTodayAttendance(teacherId),
                teacherAPI.getAllAttendance(teacherId),
                teacherAPI.getDepartments(),
            ]);
            setSessionActive(status.data.active);
            setSubject(status.data.subject || '');
            setTodayRecords(today.data);
            setAllRecords(all.data);
            setDepartments(depts.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeptChange = async (e) => {
        const deptId = e.target.value;
        setSelectedDeptId(deptId);
        setSelectedSecId('');
        setSections([]);
        setStudents([]);

        if (deptId) {
            try {
                const res = await teacherAPI.getSections(deptId);
                setSections(res.data);
                const stuRes = await teacherAPI.getStudents(deptId, '');
                setStudents(stuRes.data);
            } catch (err) { console.error(err); }
        }
    };

    const handleSecChange = async (e) => {
        const secId = e.target.value;
        setSelectedSecId(secId);
        try {
            const res = await teacherAPI.getStudents(selectedDeptId, secId);
            setStudents(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                    setSuccess('Location acquired!');
                    setTimeout(() => setSuccess(''), 2000);
                },
                () => setError('Failed to get location')
            );
        } else {
            setError('Geolocation not supported');
        }
    };

    const startSession = async () => {
        if (!location) { setError('Please fetch your location first'); return; }
        if (!subject) { setError('Please enter a subject'); return; }
        if (!selectedDeptId) { setError('Please select a department'); return; }
        if (!selectedSecId) { setError('Please select a section'); return; }
        setLoading(true);
        try {
            await teacherAPI.startSession({
                teacherId, lat: location.lat, lon: location.lon, radius, subject,
                departmentId: selectedDeptId, sectionId: selectedSecId,
            });
            setSessionActive(true);
            setSuccess('Session started!');
            loadData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to start session');
        } finally { setLoading(false); }
    };

    const stopSession = async () => {
        setLoading(true);
        try {
            await teacherAPI.stopSession({ teacherId });
            setSessionActive(false);
            setSuccess('Session stopped');
            loadData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to stop session');
        } finally { setLoading(false); }
    };

    // Stats
    const presentCount = todayRecords.filter(r => r.status === 'PRESENT').length;
    const absentCount = todayRecords.filter(r => r.status === 'ABSENT').length;
    const totalToday = todayRecords.length;
    const attendanceRate = totalToday > 0 ? Math.round((presentCount / totalToday) * 100) : 0;

    const pieData = [
        { name: 'Present', value: presentCount },
        { name: 'Absent', value: absentCount },
    ].filter(d => d.value > 0);

    return (
        <div className="dashboard">
            <Navbar />
            <div className="page-container">
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">Teacher Dashboard</h1>
                        <p className="dashboard-subtitle">Manage attendance sessions and view student records</p>
                    </div>
                    <div>
                        {sessionActive
                            ? <span className="session-badge active">● Session Active</span>
                            : <span className="session-badge inactive">Session Inactive</span>
                        }
                    </div>
                </div>

                {error && <div className="error-msg">{error}</div>}
                {success && <div className="success-msg">{success}</div>}

                <div className="dashboard-tabs">
                    {['session', 'students', 'records'].map(tab => (
                        <button key={tab} className={`dashboard-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}>
                            {tab === 'session' && '📡 '}
                            {tab === 'students' && '🎓 '}
                            {tab === 'records' && '📊 '}
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* ===== SESSION TAB ===== */}
                {activeTab === 'session' && (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card blue">
                                <div className="stat-icon blue">📋</div>
                                <div className="stat-label">Total Today</div>
                                <div className="stat-value">{totalToday}</div>
                            </div>
                            <div className="stat-card green">
                                <div className="stat-icon green">✅</div>
                                <div className="stat-label">Present</div>
                                <div className="stat-value">{presentCount}</div>
                            </div>
                            <div className="stat-card red">
                                <div className="stat-icon red">❌</div>
                                <div className="stat-label">Absent</div>
                                <div className="stat-value">{absentCount}</div>
                            </div>
                            <div className="stat-card purple">
                                <div className="stat-icon purple">📊</div>
                                <div className="stat-label">Attendance Rate</div>
                                <div className="stat-value">{attendanceRate}%</div>
                            </div>
                        </div>

                        <div className="grid-2">
                            <div className="card">
                                <h3 className="section-title">📡 Session Control</h3>
                                {!sessionActive ? (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Subject</label>
                                            <input className="form-input" placeholder="e.g. Mathematics"
                                                value={subject} onChange={e => setSubject(e.target.value)} />
                                        </div>
                                        <div className="auth-form-grid" style={{ marginBottom: 12 }}>
                                            <div className="form-group">
                                                <label className="form-label">Department *</label>
                                                <select className="form-input" value={selectedDeptId} onChange={handleDeptChange}>
                                                    <option value="">Select Department</option>
                                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Section *</label>
                                                <select className="form-input" value={selectedSecId} onChange={handleSecChange} disabled={!selectedDeptId}>
                                                    <option value="">Select Section</option>
                                                    {sections.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Geofence Radius (meters)</label>
                                            <input className="form-input" type="number" value={radius}
                                                onChange={e => setRadius(e.target.value)} />
                                        </div>
                                        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                                            <button className="btn btn-ghost" onClick={fetchLocation}>
                                                📍 Fetch Location
                                            </button>
                                            {location && (
                                                <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', alignSelf: 'center' }}>
                                                    ✅ {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                                                </span>
                                            )}
                                        </div>
                                        <button className="btn btn-success btn-block" onClick={startSession} disabled={loading}>
                                            {loading ? '⏳ Starting...' : '▶️ Start Session'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="live-counter" style={{ marginBottom: 16 }}>
                                            <div className="live-dot"></div>
                                            <span>Live — {subject}</span>
                                        </div>
                                        <button className="btn btn-danger btn-block" onClick={stopSession} disabled={loading}>
                                            {loading ? '⏳ Stopping...' : '⏹️ Stop Session'}
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="chart-card">
                                <div className="chart-title">Today's Attendance</div>
                                {pieData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                                                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="empty-state">No attendance data for today</div>
                                )}
                            </div>
                        </div>

                        {/* Today's Records Table */}
                        {todayRecords.length > 0 && (
                            <div style={{ marginTop: 24 }}>
                                <h3 className="section-title">📋 Today's Records</h3>
                                <div className="table-container">
                                    <table className="table">
                                        <thead><tr><th>Student</th><th>Subject</th><th>Status</th><th>Time</th></tr></thead>
                                        <tbody>
                                            {todayRecords.map(r => (
                                                <tr key={r.id}>
                                                    <td style={{ fontWeight: 600 }}>{r.studentName}</td>
                                                    <td>{r.subject}</td>
                                                    <td>
                                                        <span className={`badge ${r.status === 'PRESENT' ? 'badge-success' : 'badge-danger'}`}>
                                                            {r.status}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(r.timestamp).toLocaleTimeString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ===== STUDENTS TAB (by dept/section) ===== */}
                {activeTab === 'students' && (
                    <>
                        <div className="filter-bar">
                            <select value={selectedDeptId} onChange={handleDeptChange}>
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <select value={selectedSecId} onChange={handleSecChange} disabled={!selectedDeptId}>
                                <option value="">All Sections</option>
                                {sections.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
                            </select>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                {students.length} student(s) found
                            </span>
                        </div>

                        {students.length > 0 ? (
                            <div className="table-container">
                                <table className="table">
                                    <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Dept</th><th>Section</th></tr></thead>
                                    <tbody>
                                        {students.map((s, i) => (
                                            <tr key={s.id}>
                                                <td>{i + 1}</td>
                                                <td style={{ fontWeight: 600 }}>{s.name}</td>
                                                <td>{s.email}</td>
                                                <td>{s.phone || '—'}</td>
                                                <td>{s.departmentName || '—'}</td>
                                                <td>{s.sectionName ? `Section ${s.sectionName}` : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">🎓</div>
                                <p>Select a department to view students</p>
                            </div>
                        )}
                    </>
                )}

                {/* ===== RECORDS TAB ===== */}
                {activeTab === 'records' && (
                    <>
                        <div className="table-container">
                            <table className="table">
                                <thead><tr><th>Student</th><th>Subject</th><th>Date</th><th>Status</th><th>Time</th></tr></thead>
                                <tbody>
                                    {allRecords.map(r => (
                                        <tr key={r.id}>
                                            <td style={{ fontWeight: 600 }}>{r.studentName}</td>
                                            <td>{r.subject}</td>
                                            <td>{r.date}</td>
                                            <td>
                                                <span className={`badge ${r.status === 'PRESENT' ? 'badge-success' : 'badge-danger'}`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td>{new Date(r.timestamp).toLocaleTimeString()}</td>
                                        </tr>
                                    ))}
                                    {allRecords.length === 0 && (
                                        <tr><td colSpan="5" className="empty-state">No attendance records yet</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
