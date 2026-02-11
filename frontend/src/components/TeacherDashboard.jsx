import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { teacherAPI } from '../utils/api';
import { getCurrentLocation } from '../utils/location';

export default function TeacherDashboard() {
    const teacherId = localStorage.getItem('userId');
    const [sessionActive, setSessionActive] = useState(false);
    const [subject, setSubject] = useState('');
    const [radius, setRadius] = useState(100);
    const [location, setLocation] = useState(null);
    const [todayAttendance, setTodayAttendance] = useState([]);
    const [allAttendance, setAllAttendance] = useState([]);
    const [profile, setProfile] = useState({});
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('session');

    useEffect(() => {
        loadData();
        fetchLocation();
        const interval = setInterval(loadTodayAttendance, 5000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const [status, prof] = await Promise.all([
                teacherAPI.getSessionStatus(teacherId),
                teacherAPI.getProfile(teacherId),
            ]);
            setSessionActive(status.data.active);
            setSubject(status.data.subject || '');
            setRadius(status.data.radius || 100);
            setProfile(prof.data);
            loadTodayAttendance();
            loadAllAttendance();
        } catch (err) { console.error(err); }
    };

    const loadTodayAttendance = async () => {
        try {
            const res = await teacherAPI.getTodayAttendance(teacherId);
            setTodayAttendance(res.data);
        } catch (err) { console.error(err); }
    };

    const loadAllAttendance = async () => {
        try {
            const res = await teacherAPI.getAllAttendance(teacherId);
            setAllAttendance(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchLocation = async () => {
        try {
            const loc = await getCurrentLocation();
            setLocation(loc);
        } catch (err) {
            setError('Location error: ' + err.message);
        }
    };

    const handleStartSession = async () => {
        if (!location) {
            setError('Location not available. Please enable GPS.');
            return;
        }
        if (!subject) {
            setError('Please enter a subject name.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await teacherAPI.startSession({
                teacherId, lat: location.lat, lon: location.lon, radius, subject
            });
            setSessionActive(true);
            setMsg('✅ Attendance session started!');
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to start session');
        } finally {
            setLoading(false);
        }
    };

    const handleStopSession = async () => {
        setLoading(true);
        try {
            await teacherAPI.stopSession({ teacherId });
            setSessionActive(false);
            setMsg('Session stopped.');
            loadTodayAttendance();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to stop session');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard">
            <Navbar />
            <div className="page-container">
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">👨‍🏫 Teacher Dashboard</h1>
                        <p className="dashboard-subtitle">Welcome, {profile.name || 'Teacher'} • {profile.subject || subject || 'No Subject'}</p>
                    </div>
                    <div className={`session-badge ${sessionActive ? 'active' : 'inactive'}`}>
                        {sessionActive ? 'Session Active' : 'Session Inactive'}
                    </div>
                </div>

                {msg && <div className="success-msg">{msg}</div>}
                {error && <div className="error-msg">{error}</div>}

                {/* Tabs */}
                <div className="auth-tabs" style={{ maxWidth: '500px', marginBottom: '24px' }}>
                    <button className={`auth-tab ${activeTab === 'session' ? 'active' : ''}`} onClick={() => setActiveTab('session')}>📡 Session</button>
                    <button className={`auth-tab ${activeTab === 'today' ? 'active' : ''}`} onClick={() => setActiveTab('today')}>📋 Today</button>
                    <button className={`auth-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>📊 History</button>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card blue">
                        <div className="stat-icon blue">📡</div>
                        <div className="stat-label">Status</div>
                        <div className="stat-value" style={{ fontSize: '1.2rem' }}>{sessionActive ? '🟢 Active' : '🔴 Inactive'}</div>
                    </div>
                    <div className="stat-card green">
                        <div className="stat-icon green">👨‍🎓</div>
                        <div className="stat-label">Today's Count</div>
                        <div className="stat-value">{todayAttendance.length}</div>
                    </div>
                    <div className="stat-card purple">
                        <div className="stat-icon purple">📋</div>
                        <div className="stat-label">Total Records</div>
                        <div className="stat-value">{allAttendance.length}</div>
                    </div>
                    <div className="stat-card orange">
                        <div className="stat-icon orange">📍</div>
                        <div className="stat-label">Radius</div>
                        <div className="stat-value">{radius}m</div>
                    </div>
                </div>

                {/* Session Control Tab */}
                {activeTab === 'session' && (
                    <div className="grid-2">
                        <div className="card">
                            <h3 className="section-title">⚙️ Session Controls</h3>
                            <div className="form-group">
                                <label className="form-label">Subject</label>
                                <input
                                    className="form-input"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Mathematics"
                                    disabled={sessionActive}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Geofence Radius (meters)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={radius}
                                    onChange={(e) => setRadius(Number(e.target.value))}
                                    min="10"
                                    max="1000"
                                    disabled={sessionActive}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                {!sessionActive ? (
                                    <button className="btn btn-success btn-block" onClick={handleStartSession} disabled={loading}>
                                        {loading ? '⏳ Starting...' : '▶️ Start Session'}
                                    </button>
                                ) : (
                                    <button className="btn btn-danger btn-block" onClick={handleStopSession} disabled={loading}>
                                        {loading ? '⏳ Stopping...' : '⏹️ Stop Session'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="section-title">📍 Location Info</h3>
                            {location ? (
                                <div>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                        <strong>Latitude:</strong> {location.lat.toFixed(6)}
                                    </p>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                        <strong>Longitude:</strong> {location.lon.toFixed(6)}
                                    </p>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                        <strong>Accuracy:</strong> {location.accuracy?.toFixed(1)}m
                                    </p>
                                    <button className="btn btn-ghost btn-sm" onClick={fetchLocation}>🔄 Refresh Location</button>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📍</div>
                                    <p>Fetching location...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Today's Attendance Tab */}
                {activeTab === 'today' && (
                    <div>
                        {sessionActive && (
                            <div className="live-counter" style={{ marginBottom: '16px' }}>
                                <div className="live-dot"></div>
                                Live — {todayAttendance.length} students marked
                            </div>
                        )}
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Student</th>
                                        <th>Subject</th>
                                        <th>Status</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todayAttendance.length === 0 ? (
                                        <tr><td colSpan="5" className="empty-state">No attendance records for today</td></tr>
                                    ) : todayAttendance.map((a, i) => (
                                        <tr key={a.id}>
                                            <td>{i + 1}</td>
                                            <td>{a.studentName}</td>
                                            <td><span className="badge badge-primary">{a.subject}</span></td>
                                            <td><span className="badge badge-success">{a.status}</span></td>
                                            <td>{new Date(a.timestamp).toLocaleTimeString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student</th>
                                    <th>Subject</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allAttendance.length === 0 ? (
                                    <tr><td colSpan="6" className="empty-state">No attendance records yet</td></tr>
                                ) : allAttendance.map((a, i) => (
                                    <tr key={a.id}>
                                        <td>{i + 1}</td>
                                        <td>{a.studentName}</td>
                                        <td><span className="badge badge-primary">{a.subject}</span></td>
                                        <td>{a.date}</td>
                                        <td><span className="badge badge-success">{a.status}</span></td>
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
