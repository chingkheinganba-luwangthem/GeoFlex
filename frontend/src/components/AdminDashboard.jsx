import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Navbar from './Navbar';
import { adminAPI } from '../utils/api';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState({});
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [showAddTeacher, setShowAddTeacher] = useState(false);
    const [showEditTeacher, setShowEditTeacher] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', subject: '' });
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [a, t, s] = await Promise.all([
                adminAPI.getAnalytics(),
                adminAPI.getTeachers(),
                adminAPI.getStudents(),
            ]);
            setAnalytics(a.data);
            setTeachers(t.data);
            setStudents(s.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddTeacher = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await adminAPI.addTeacher(form);
            setMsg('Teacher added successfully!');
            setShowAddTeacher(false);
            setForm({ name: '', email: '', password: '', subject: '' });
            loadData();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add teacher');
        }
    };

    const handleEditTeacher = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.updateTeacher(showEditTeacher.id, form);
            setMsg('Teacher updated!');
            setShowEditTeacher(null);
            setForm({ name: '', email: '', password: '', subject: '' });
            loadData();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update');
        }
    };

    const handleDeleteTeacher = async (id) => {
        if (!confirm('Remove this teacher?')) return;
        try {
            await adminAPI.deleteTeacher(id);
            setMsg('Teacher removed');
            loadData();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) { console.error(err); }
    };

    const handleDeleteStudent = async (id) => {
        if (!confirm('Remove this student?')) return;
        try {
            await adminAPI.deleteStudent(id);
            setMsg('Student removed');
            loadData();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) { console.error(err); }
    };

    const pieData = [
        { name: 'Teachers', value: analytics.totalTeachers || 0 },
        { name: 'Students', value: analytics.totalStudents || 0 },
    ];

    return (
        <div className="dashboard">
            <Navbar />
            <div className="page-container">
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">👑 Admin Dashboard</h1>
                        <p className="dashboard-subtitle">Manage your institution's attendance system</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => { setShowAddTeacher(true); setForm({ name: '', email: '', password: '', subject: '' }); setError(''); }}>
                        ➕ Add Teacher
                    </button>
                </div>

                {msg && <div className="success-msg">{msg}</div>}

                {/* Tabs */}
                <div className="auth-tabs" style={{ maxWidth: '400px', marginBottom: '24px' }}>
                    <button className={`auth-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Overview</button>
                    <button className={`auth-tab ${activeTab === 'teachers' ? 'active' : ''}`} onClick={() => setActiveTab('teachers')}>👨‍🏫 Teachers</button>
                    <button className={`auth-tab ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>👨‍🎓 Students</button>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card blue">
                                <div className="stat-icon blue">👨‍🎓</div>
                                <div className="stat-label">Total Students</div>
                                <div className="stat-value">{analytics.totalStudents || 0}</div>
                            </div>
                            <div className="stat-card green">
                                <div className="stat-icon green">👨‍🏫</div>
                                <div className="stat-label">Total Teachers</div>
                                <div className="stat-value">{analytics.totalTeachers || 0}</div>
                            </div>
                            <div className="stat-card purple">
                                <div className="stat-icon purple">📋</div>
                                <div className="stat-label">Total Records</div>
                                <div className="stat-value">{analytics.totalAttendance || 0}</div>
                            </div>
                            <div className="stat-card orange">
                                <div className="stat-icon orange">📅</div>
                                <div className="stat-label">Today's Records</div>
                                <div className="stat-value">{analytics.todayAttendance || 0}</div>
                            </div>
                        </div>

                        <div className="grid-2">
                            <div className="chart-card">
                                <h3 className="chart-title">User Distribution</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="chart-card">
                                <h3 className="chart-title">Quick Actions</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                                    <button className="btn btn-primary btn-block" onClick={() => { setShowAddTeacher(true); setForm({ name: '', email: '', password: '', subject: '' }); }}>➕ Add New Teacher</button>
                                    <button className="btn btn-ghost btn-block" onClick={() => setActiveTab('teachers')}>👨‍🏫 Manage Teachers</button>
                                    <button className="btn btn-ghost btn-block" onClick={() => setActiveTab('students')}>👨‍🎓 View Students</button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Teachers Tab */}
                {activeTab === 'teachers' && (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Subject</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.length === 0 ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No teachers found. Add one above!</td></tr>
                                ) : teachers.map((t) => (
                                    <tr key={t.id}>
                                        <td>#{t.id}</td>
                                        <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div className="profile-pic" style={{ width: '32px', height: '32px', fontSize: '0.7rem' }}>
                                                {t.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                            </div>
                                            {t.name}
                                        </td>
                                        <td>{t.email}</td>
                                        <td><span className="badge badge-primary">{t.subject || 'N/A'}</span></td>
                                        <td>
                                            <span className={`session-badge ${t.attendanceActive ? 'active' : 'inactive'}`}>
                                                {t.attendanceActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button className="btn btn-ghost btn-sm" onClick={() => { setShowEditTeacher(t); setForm({ name: t.name, email: t.email, password: '', subject: t.subject || '' }); setError(''); }}>✏️</button>
                                                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-red)' }} onClick={() => handleDeleteTeacher(t.id)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Students Tab */}
                {activeTab === 'students' && (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No students registered yet.</td></tr>
                                ) : students.map((s) => (
                                    <tr key={s.id}>
                                        <td>#{s.id}</td>
                                        <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div className="profile-pic" style={{ width: '32px', height: '32px', fontSize: '0.7rem' }}>
                                                {s.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                            </div>
                                            {s.name}
                                        </td>
                                        <td>{s.email}</td>
                                        <td>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}</td>
                                        <td>
                                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-red)' }} onClick={() => handleDeleteStudent(s.id)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Teacher Modal */}
            {showAddTeacher && (
                <div className="modal-overlay" onClick={() => setShowAddTeacher(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">➕ Add New Teacher</h2>
                        {error && <div className="error-msg">{error}</div>}
                        <form onSubmit={handleAddTeacher}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input type="password" className="form-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Subject</label>
                                <input className="form-input" placeholder="e.g. Mathematics" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowAddTeacher(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Teacher</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Teacher Modal */}
            {showEditTeacher && (
                <div className="modal-overlay" onClick={() => setShowEditTeacher(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">✏️ Edit Teacher</h2>
                        {error && <div className="error-msg">{error}</div>}
                        <form onSubmit={handleEditTeacher}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password (leave empty to keep)</label>
                                <input type="password" className="form-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Subject</label>
                                <input className="form-input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowEditTeacher(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
