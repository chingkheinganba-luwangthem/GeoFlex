import { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import Navbar from './Navbar';
import { studentAPI } from '../utils/api';
import { getCurrentLocation } from '../utils/location';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#6366f1', '#06b6d4', '#ec4899'];

export default function StudentDashboard() {
    const studentId = localStorage.getItem('userId');
    const [stats, setStats] = useState({});
    const [attendance, setAttendance] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [profile, setProfile] = useState({});
    const [location, setLocation] = useState(null);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadData();
        fetchLocation();
        const interval = setInterval(loadActiveSessions, 5000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const [s, a, sessions, prof] = await Promise.all([
                studentAPI.getStats(studentId),
                studentAPI.getAttendance(studentId),
                studentAPI.getActiveSessions(),
                studentAPI.getProfile(studentId),
            ]);
            setStats(s.data);
            setAttendance(a.data);
            setActiveSessions(sessions.data);
            setProfile(prof.data);
        } catch (err) { console.error(err); }
    };

    const loadActiveSessions = async () => {
        try {
            const res = await studentAPI.getActiveSessions();
            setActiveSessions(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchLocation = async () => {
        try {
            const loc = await getCurrentLocation();
            setLocation(loc);
        } catch (err) { console.error(err); }
    };

    const handleMarkAttendance = async (teacherId) => {
        if (!location) {
            setError('Location not available. Please enable GPS.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await studentAPI.markAttendance({
                studentId, teacherId, lat: location.lat, lon: location.lon
            });
            setMsg(`✅ ${res.data.message} — ${res.data.subject}`);
            loadData();
            setTimeout(() => setMsg(''), 4000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to mark attendance');
        } finally {
            setLoading(false);
        }
    };

    const pieData = [
        { name: 'Present', value: stats.present || 0 },
        { name: 'Absent', value: stats.absent || 0 },
        { name: 'Leave', value: stats.leave || 0 },
    ].filter(d => d.value > 0);

    const subjectData = (stats.subjectWise || []).map(s => ({
        name: s.subject,
        present: s.present,
        total: s.total,
        percentage: Math.round(s.percentage),
    }));

    const getInitials = (n) => n ? n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

    return (
        <div className="dashboard">
            <Navbar />
            <div className="page-container">
                <div className="dashboard-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="profile-pic profile-pic-lg">
                            {profile.profilePicture ? (
                                <img src={profile.profilePicture} alt={profile.name} />
                            ) : getInitials(profile.name)}
                        </div>
                        <div>
                            <h1 className="dashboard-title">Welcome, {profile.name || 'Student'} 👋</h1>
                            <p className="dashboard-subtitle">{profile.email}</p>
                        </div>
                    </div>
                    {activeSessions.length > 0 && (
                        <div className="live-counter">
                            <div className="live-dot"></div>
                            {activeSessions.length} Active Session{activeSessions.length > 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                {msg && <div className="success-msg">{msg}</div>}
                {error && <div className="error-msg">{error}</div>}

                {/* Tabs */}
                <div className="auth-tabs" style={{ maxWidth: '500px', marginBottom: '24px' }}>
                    <button className={`auth-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Overview</button>
                    <button className={`auth-tab ${activeTab === 'attend' ? 'active' : ''}`} onClick={() => setActiveTab('attend')}>✅ Attend</button>
                    <button className={`auth-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>📋 History</button>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card blue">
                        <div className="stat-icon blue">📚</div>
                        <div className="stat-label">Total Classes</div>
                        <div className="stat-value">{stats.totalClasses || 0}</div>
                    </div>
                    <div className="stat-card green">
                        <div className="stat-icon green">✅</div>
                        <div className="stat-label">Present</div>
                        <div className="stat-value">{stats.present || 0}</div>
                        <div className="card-subtitle">{(stats.presentPercentage || 0).toFixed(1)}%</div>
                    </div>
                    <div className="stat-card red">
                        <div className="stat-icon red">❌</div>
                        <div className="stat-label">Absent</div>
                        <div className="stat-value">{stats.absent || 0}</div>
                        <div className="card-subtitle">{(stats.absentPercentage || 0).toFixed(1)}%</div>
                    </div>
                    <div className="stat-card orange">
                        <div className="stat-icon orange">🏠</div>
                        <div className="stat-label">Leave</div>
                        <div className="stat-value">{stats.leave || 0}</div>
                        <div className="card-subtitle">{(stats.leavePercentage || 0).toFixed(1)}%</div>
                    </div>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid-2">
                        {/* Attendance Pie Chart */}
                        <div className="chart-card">
                            <h3 className="chart-title">📊 Attendance Overview</h3>
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                                            paddingAngle={5} dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📊</div>
                                    <p>No attendance data yet</p>
                                </div>
                            )}
                        </div>

                        {/* Subject-wise Bar Chart */}
                        <div className="chart-card">
                            <h3 className="chart-title">📚 Subject-wise Attendance</h3>
                            {subjectData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={subjectData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="name" tick={{ fill: '#a0a0b8', fontSize: 12 }} />
                                        <YAxis tick={{ fill: '#a0a0b8' }} />
                                        <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                        <Bar dataKey="present" fill="#22c55e" name="Present" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="total" fill="#6366f1" name="Total" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📚</div>
                                    <p>No subject data yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Attend Tab - Active Sessions */}
                {activeTab === 'attend' && (
                    <div>
                        <h3 className="section-title">📡 Active Attendance Sessions</h3>
                        {activeSessions.length === 0 ? (
                            <div className="card">
                                <div className="empty-state">
                                    <div className="empty-state-icon">😴</div>
                                    <p>No active sessions right now. Check back later!</p>
                                </div>
                            </div>
                        ) : (
                            <div className="stats-grid">
                                {activeSessions.map((session) => (
                                    <div className="card" key={session.teacherId}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                            <div className="profile-pic" style={{ width: '40px', height: '40px', fontSize: '0.85rem' }}>
                                                {getInitials(session.teacherName)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{session.teacherName}</div>
                                                <span className="badge badge-primary">{session.subject}</span>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                                            Radius: {session.radius}m
                                        </p>
                                        <div className="session-badge active" style={{ marginBottom: '12px' }}>
                                            Session Active
                                        </div>
                                        <button
                                            className="btn btn-success btn-block"
                                            onClick={() => handleMarkAttendance(session.teacherId)}
                                            disabled={loading}
                                        >
                                            {loading ? '⏳ Marking...' : '📍 Mark Attendance'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {location && (
                            <div className="card" style={{ marginTop: '16px' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>📍 Your Location</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Lat: {location.lat.toFixed(6)} | Lon: {location.lon.toFixed(6)} | Accuracy: {location.accuracy?.toFixed(1)}m
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Date</th>
                                    <th>Subject</th>
                                    <th>Teacher</th>
                                    <th>Status</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.length === 0 ? (
                                    <tr><td colSpan="6" className="empty-state">No attendance records yet</td></tr>
                                ) : attendance.map((a, i) => (
                                    <tr key={a.id}>
                                        <td>{i + 1}</td>
                                        <td>{a.date}</td>
                                        <td><span className="badge badge-primary">{a.subject}</span></td>
                                        <td>{a.teacherName}</td>
                                        <td>
                                            <span className={`badge ${a.status === 'PRESENT' ? 'badge-success' : a.status === 'ABSENT' ? 'badge-danger' : 'badge-warning'}`}>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td>{new Date(a.timestamp).toLocaleTimeString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}