import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import Navbar from './Navbar';
import { studentAPI } from '../utils/api';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

export default function StudentDashboard() {
    const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });
    const [records, setRecords] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const studentId = localStorage.getItem('userId');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [s, r, a] = await Promise.all([
                studentAPI.getStats(studentId),
                studentAPI.getAttendance(studentId),
                studentAPI.getActiveSessions(studentId),
            ]);
            setStats(s.data);
            setRecords(r.data);
            setActiveSessions(a.data);
        } catch (err) {
            console.error(err);
        }
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

    const markAttendance = async (session) => {
        if (!location) { setError('Please fetch your location first'); return; }
        setLoading(true);
        try {
            await studentAPI.markAttendance({
                studentId,
                teacherId: session.teacherId,
                lat: location.lat,
                lon: location.lon,
                subject: session.subject || 'General',
            });
            setSuccess('Attendance marked successfully!');
            loadData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to mark attendance');
        } finally { setLoading(false); }
    };

    const attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
    const pieData = [
        { name: 'Present', value: stats.present || 0 },
        { name: 'Absent', value: stats.absent || 0 },
    ].filter(d => d.value > 0);

    return (
        <div className="dashboard">
            <Navbar />
            <div className="page-container">
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">Student Dashboard</h1>
                        <p className="dashboard-subtitle">View your attendance stats and mark attendance</p>
                    </div>
                </div>

                {error && <div className="error-msg">{error}</div>}
                {success && <div className="success-msg">{success}</div>}

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card blue">
                        <div className="stat-icon blue">📋</div>
                        <div className="stat-label">Total Classes</div>
                        <div className="stat-value">{stats.total}</div>
                    </div>
                    <div className="stat-card green">
                        <div className="stat-icon green">✅</div>
                        <div className="stat-label">Present</div>
                        <div className="stat-value">{stats.present}</div>
                    </div>
                    <div className="stat-card red">
                        <div className="stat-icon red">❌</div>
                        <div className="stat-label">Absent</div>
                        <div className="stat-value">{stats.absent}</div>
                    </div>
                    <div className="stat-card purple">
                        <div className="stat-icon purple">📊</div>
                        <div className="stat-label">Attendance Rate</div>
                        <div className="stat-value">{attendanceRate}%</div>
                    </div>
                </div>

                <div className="grid-2">
                    {/* Active Sessions */}
                    <div className="card">
                        <h3 className="section-title">📡 Active Sessions</h3>
                        <div style={{ marginBottom: 16 }}>
                            <button className="btn btn-ghost" onClick={fetchLocation}>
                                📍 Fetch My Location
                            </button>
                            {location && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', marginLeft: 12 }}>
                                    ✅ {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                                </span>
                            )}
                        </div>

                        {activeSessions.length > 0 ? (
                            <div className="student-list">
                                {activeSessions.map((s, i) => (
                                    <div key={i} className="student-list-item">
                                        <div className="student-info">
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{s.teacherName || 'Teacher'}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.subject}</div>
                                            </div>
                                        </div>
                                        <button className="btn btn-success btn-sm" onClick={() => markAttendance(s)} disabled={loading}>
                                            {loading ? '⏳' : 'Take Attendance'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">📡</div>
                                <p>No active sessions right now</p>
                            </div>
                        )}
                    </div>

                    {/* Chart */}
                    <div className="chart-card">
                        <div className="chart-title">Attendance Overview</div>
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
                            <div className="empty-state">No attendance data yet</div>
                        )}
                    </div>
                </div>

                {/* Records */}
                <div style={{ marginTop: 24 }}>
                    <h3 className="section-title">📋 Attendance History</h3>
                    <div className="table-container">
                        <table className="table">
                            <thead><tr><th>Subject</th><th>Date</th><th>Status</th><th>Time</th></tr></thead>
                            <tbody>
                                {records.map(r => (
                                    <tr key={r.id}>
                                        <td style={{ fontWeight: 600 }}>{r.subject}</td>
                                        <td>{r.date}</td>
                                        <td>
                                            <span className={`badge ${r.status === 'PRESENT' ? 'badge-success' : 'badge-danger'}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td>{new Date(r.timestamp).toLocaleTimeString()}</td>
                                    </tr>
                                ))}
                                {records.length === 0 && (
                                    <tr><td colSpan="4" className="empty-state">No attendance records yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}