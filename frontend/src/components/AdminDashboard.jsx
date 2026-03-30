import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Navbar from './Navbar';
import { adminAPI } from '../utils/api';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [sections, setSections] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Filters
    const [filterDeptId, setFilterDeptId] = useState('');
    const [filterSecId, setFilterSecId] = useState('');
    const [filterSections, setFilterSections] = useState([]);

    // Forms
    const [showModal, setShowModal] = useState('');
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({});

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [t, s, d, sec, a] = await Promise.all([
                adminAPI.getTeachers(),
                adminAPI.getStudents(),
                adminAPI.getDepartments(),
                adminAPI.getSections(),
                adminAPI.getAnalytics(),
            ]);
            setTeachers(t.data);
            setStudents(s.data);
            setDepartments(d.data);
            setSections(sec.data);
            setAnalytics(a.data);
        } catch (err) {
            console.error('Failed to load data', err);
        }
    };

    const loadFilteredStudents = async (deptId, secId) => {
        try {
            const res = await adminAPI.getStudents(deptId || null, secId || null);
            setStudents(res.data);
        } catch (err) { console.error(err); }
    };

    const handleFilterDeptChange = async (e) => {
        const deptId = e.target.value;
        setFilterDeptId(deptId);
        setFilterSecId('');
        setFilterSections([]);
        if (deptId) {
            const res = await adminAPI.getSections(deptId);
            setFilterSections(res.data);
        }
        loadFilteredStudents(deptId, '');
    };

    const handleFilterSecChange = (e) => {
        setFilterSecId(e.target.value);
        loadFilteredStudents(filterDeptId, e.target.value);
    };

    const showMessage = (msg, type = 'success') => {
        if (type === 'success') { setSuccess(msg); setError(''); }
        else { setError(msg); setSuccess(''); }
        setTimeout(() => { setSuccess(''); setError(''); }, 3000);
    };

    // ===== Department CRUD =====
    const handleAddDepartment = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.addDepartment({ name: form.name });
            showMessage('Department added!');
            setShowModal(''); setForm({});
            loadData();
        } catch (err) { showMessage(err.response?.data?.error || 'Error', 'error'); }
    };

    const handleDeleteDepartment = async (id) => {
        if (!confirm('Delete this department and all its sections?')) return;
        try {
            await adminAPI.deleteDepartment(id);
            showMessage('Department deleted');
            loadData();
        } catch (err) { showMessage('Failed to delete', 'error'); }
    };

    // ===== Section CRUD =====
    const handleAddSection = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.addSection({ name: form.name, departmentId: form.departmentId });
            showMessage('Section added!');
            setShowModal(''); setForm({});
            loadData();
        } catch (err) { showMessage(err.response?.data?.error || 'Error', 'error'); }
    };

    const handleDeleteSection = async (id) => {
        if (!confirm('Delete this section?')) return;
        try {
            await adminAPI.deleteSection(id);
            showMessage('Section deleted');
            loadData();
        } catch (err) { showMessage('Failed to delete', 'error'); }
    };

    // ===== Teacher CRUD =====
    const handleAddTeacher = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.addTeacher(form);
            showMessage('Teacher added!');
            setShowModal(''); setForm({});
            loadData();
        } catch (err) { showMessage(err.response?.data?.error || 'Error', 'error'); }
    };

    const handleEditTeacher = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.updateTeacher(editId, form);
            showMessage('Teacher updated!');
            setShowModal(''); setForm({}); setEditId(null);
            loadData();
        } catch (err) { showMessage(err.response?.data?.error || 'Error', 'error'); }
    };

    const handleDeleteTeacher = async (id) => {
        if (!confirm('Delete this teacher?')) return;
        try {
            await adminAPI.deleteTeacher(id);
            showMessage('Teacher deleted');
            loadData();
        } catch (err) { showMessage('Failed to delete', 'error'); }
    };

    // ===== Student CRUD =====
    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.addStudent(form);
            showMessage('Student added!');
            setShowModal(''); setForm({});
            loadData();
        } catch (err) { showMessage(err.response?.data?.error || 'Error', 'error'); }
    };

    const handleEditStudent = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.updateStudent(editId, form);
            showMessage('Student updated!');
            setShowModal(''); setForm({}); setEditId(null);
            loadData();
        } catch (err) { showMessage(err.response?.data?.error || 'Error', 'error'); }
    };

    const handleDeleteStudent = async (id) => {
        if (!confirm('Delete this student?')) return;
        try {
            await adminAPI.deleteStudent(id);
            showMessage('Student deleted');
            loadData();
        } catch (err) { showMessage('Failed to delete', 'error'); }
    };

    const openEditTeacher = (t) => {
        setEditId(t.id);
        setForm({ name: t.name, email: t.email, subject: t.subject || '', phone: t.phone || '' });
        setShowModal('editTeacher');
    };

    const openEditStudent = (s) => {
        setEditId(s.id);
        setForm({ name: s.name, email: s.email, phone: s.phone || '', departmentId: s.departmentId || '', sectionId: s.sectionId || '' });
        setShowModal('editStudent');
    };

    const [modalSections, setModalSections] = useState([]);
    const handleModalDeptChange = async (deptId) => {
        setForm(prev => ({ ...prev, departmentId: deptId, sectionId: '' }));
        setModalSections([]);
        if (deptId) {
            try {
                const res = await adminAPI.getSections(deptId);
                setModalSections(res.data);
            } catch (err) { console.error(err); }
        }
    };

    const chartData = [
        { name: 'Teachers', value: teachers.length },
        { name: 'Students', value: students.length },
        { name: 'Departments', value: departments.length },
    ].filter(d => d.value > 0);

    return (
        <div className="dashboard">
            <Navbar />
            <div className="page-container">
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">Admin Dashboard</h1>
                        <p className="dashboard-subtitle">Manage your institution's departments, sections, teachers & students</p>
                    </div>
                </div>

                {error && <div className="error-msg">{error}</div>}
                {success && <div className="success-msg">{success}</div>}

                {/* Tabs */}
                <div className="dashboard-tabs">
                    {['overview', 'departments', 'sections', 'teachers', 'students'].map(tab => (
                        <button key={tab} className={`dashboard-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}>
                            {tab === 'overview' && '📊 '}
                            {tab === 'departments' && '🏫 '}
                            {tab === 'sections' && '📋 '}
                            {tab === 'teachers' && '👨‍🏫 '}
                            {tab === 'students' && '🎓 '}
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* ===== OVERVIEW TAB ===== */}
                {activeTab === 'overview' && (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card blue">
                                <div className="stat-icon blue">🏫</div>
                                <div className="stat-label">Departments</div>
                                <div className="stat-value">{departments.length}</div>
                            </div>
                            <div className="stat-card purple">
                                <div className="stat-icon purple">📋</div>
                                <div className="stat-label">Sections</div>
                                <div className="stat-value">{sections.length}</div>
                            </div>
                            <div className="stat-card green">
                                <div className="stat-icon green">👨‍🏫</div>
                                <div className="stat-label">Teachers</div>
                                <div className="stat-value">{teachers.length}</div>
                            </div>
                            <div className="stat-card cyan">
                                <div className="stat-icon cyan">🎓</div>
                                <div className="stat-label">Students</div>
                                <div className="stat-value">{students.length}</div>
                            </div>
                        </div>

                        {chartData.length > 0 && (
                            <div className="grid-2">
                                <div className="chart-card">
                                    <div className="chart-title">Distribution</div>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="chart-card">
                                    <div className="chart-title">Departments Overview</div>
                                    {departments.map(d => (
                                        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                            <span style={{ fontWeight: 600 }}>{d.name}</span>
                                            <span style={{ color: 'var(--text-muted)' }}>{d.sections} sections · {d.students} students</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ===== DEPARTMENTS TAB ===== */}
                {activeTab === 'departments' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 className="section-title">🏫 Departments</h2>
                            <button className="btn btn-primary" onClick={() => { setShowModal('addDept'); setForm({}); }}>
                                + Add Department
                            </button>
                        </div>
                        <div className="table-container">
                            <table className="table">
                                <thead><tr><th>Name</th><th>Sections</th><th>Students</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {departments.map(d => (
                                        <tr key={d.id}>
                                            <td style={{ fontWeight: 600 }}>{d.name}</td>
                                            <td><span className="badge badge-info">{d.sections}</span></td>
                                            <td><span className="badge badge-primary">{d.students}</span></td>
                                            <td>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteDepartment(d.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {departments.length === 0 && (
                                        <tr><td colSpan="4" className="empty-state">No departments yet. Add one to get started!</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* ===== SECTIONS TAB ===== */}
                {activeTab === 'sections' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 className="section-title">📋 Sections</h2>
                            <button className="btn btn-primary" onClick={() => { setShowModal('addSection'); setForm({}); }}>
                                + Add Section
                            </button>
                        </div>
                        <div className="table-container">
                            <table className="table">
                                <thead><tr><th>Section</th><th>Department</th><th>Students</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {sections.map(s => (
                                        <tr key={s.id}>
                                            <td style={{ fontWeight: 600 }}>Section {s.name}</td>
                                            <td>{s.departmentName}</td>
                                            <td><span className="badge badge-primary">{s.students}</span></td>
                                            <td>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSection(s.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {sections.length === 0 && (
                                        <tr><td colSpan="4" className="empty-state">No sections yet</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* ===== TEACHERS TAB ===== */}
                {activeTab === 'teachers' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 className="section-title">👨‍🏫 Teachers</h2>
                            <button className="btn btn-primary" onClick={() => { setShowModal('addTeacher'); setForm({}); }}>
                                + Add Teacher
                            </button>
                        </div>
                        <div className="table-container">
                            <table className="table">
                                <thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Status</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {teachers.map(t => (
                                        <tr key={t.id}>
                                            <td style={{ fontWeight: 600 }}>{t.name}</td>
                                            <td>{t.email}</td>
                                            <td>{t.subject || '—'}</td>
                                            <td>
                                                {t.attendanceActive
                                                    ? <span className="badge badge-success">Active</span>
                                                    : <span className="badge badge-danger">Inactive</span>
                                                }
                                            </td>
                                            <td style={{ display: 'flex', gap: 8 }}>
                                                <button className="btn btn-ghost btn-sm" onClick={() => openEditTeacher(t)}>Edit</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTeacher(t.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {teachers.length === 0 && (
                                        <tr><td colSpan="5" className="empty-state">No teachers yet</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* ===== STUDENTS TAB ===== */}
                {activeTab === 'students' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 className="section-title">🎓 Students</h2>
                            <button className="btn btn-primary" onClick={() => { setShowModal('addStudent'); setForm({}); setModalSections([]); }}>
                                + Add Student
                            </button>
                        </div>

                        <div className="filter-bar">
                            <select value={filterDeptId} onChange={handleFilterDeptChange}>
                                <option value="">All Departments</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <select value={filterSecId} onChange={handleFilterSecChange} disabled={!filterDeptId}>
                                <option value="">All Sections</option>
                                {filterSections.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
                            </select>
                        </div>

                        <div className="table-container">
                            <table className="table">
                                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Department</th><th>Section</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {students.map(s => (
                                        <tr key={s.id}>
                                            <td style={{ fontWeight: 600 }}>{s.name}</td>
                                            <td>{s.email}</td>
                                            <td>{s.phone || '—'}</td>
                                            <td>{s.departmentName || '—'}</td>
                                            <td>{s.sectionName ? `Section ${s.sectionName}` : '—'}</td>
                                            <td style={{ display: 'flex', gap: 8 }}>
                                                <button className="btn btn-ghost btn-sm" onClick={() => openEditStudent(s)}>Edit</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteStudent(s.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {students.length === 0 && (
                                        <tr><td colSpan="6" className="empty-state">No students found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* ===== MODALS ===== */}

                {/* Add Department */}
                {showModal === 'addDept' && (
                    <div className="modal-overlay" onClick={() => setShowModal('')}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h3 className="modal-title">Add Department</h3>
                            <form onSubmit={handleAddDepartment}>
                                <div className="form-group">
                                    <label className="form-label">Department Name</label>
                                    <input className="form-input" placeholder="e.g. MCA, BCA" value={form.name || ''}
                                        onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-ghost" onClick={() => setShowModal('')}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Add Department</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Section */}
                {showModal === 'addSection' && (
                    <div className="modal-overlay" onClick={() => setShowModal('')}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h3 className="modal-title">Add Section</h3>
                            <form onSubmit={handleAddSection}>
                                <div className="form-group">
                                    <label className="form-label">Department</label>
                                    <select className="form-input form-select" value={form.departmentId || ''}
                                        onChange={e => setForm({ ...form, departmentId: e.target.value })} required>
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Section Name</label>
                                    <input className="form-input" placeholder="e.g. A, B, C" value={form.name || ''}
                                        onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-ghost" onClick={() => setShowModal('')}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Add Section</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Teacher */}
                {showModal === 'addTeacher' && (
                    <div className="modal-overlay" onClick={() => setShowModal('')}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h3 className="modal-title">Add Teacher</h3>
                            <form onSubmit={handleAddTeacher}>
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input className="form-input" placeholder="Full name" value={form.name || ''}
                                        onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input className="form-input" type="email" placeholder="Email" value={form.email || ''}
                                        onChange={e => setForm({ ...form, email: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password || ''}
                                        onChange={e => setForm({ ...form, password: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Subject</label>
                                    <input className="form-input" placeholder="e.g. Mathematics" value={form.subject || ''}
                                        onChange={e => setForm({ ...form, subject: e.target.value })} />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-ghost" onClick={() => setShowModal('')}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Add Teacher</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Teacher */}
                {showModal === 'editTeacher' && (
                    <div className="modal-overlay" onClick={() => setShowModal('')}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h3 className="modal-title">Edit Teacher</h3>
                            <form onSubmit={handleEditTeacher}>
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input className="form-input" value={form.name || ''}
                                        onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input className="form-input" type="email" value={form.email || ''}
                                        onChange={e => setForm({ ...form, email: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">New Password (leave blank to keep)</label>
                                    <input className="form-input" type="password" value={form.password || ''}
                                        onChange={e => setForm({ ...form, password: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Subject</label>
                                    <input className="form-input" value={form.subject || ''}
                                        onChange={e => setForm({ ...form, subject: e.target.value })} />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-ghost" onClick={() => setShowModal('')}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Student */}
                {showModal === 'addStudent' && (
                    <div className="modal-overlay" onClick={() => setShowModal('')}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h3 className="modal-title">Add Student</h3>
                            <form onSubmit={handleAddStudent}>
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input className="form-input" placeholder="Full name" value={form.name || ''}
                                        onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input className="form-input" type="email" placeholder="Email" value={form.email || ''}
                                        onChange={e => setForm({ ...form, email: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input className="form-input" type="tel" placeholder="Phone" value={form.phone || ''}
                                        onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password || ''}
                                        onChange={e => setForm({ ...form, password: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Department</label>
                                    <select className="form-input form-select" value={form.departmentId || ''}
                                        onChange={e => handleModalDeptChange(e.target.value)}>
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Section</label>
                                    <select className="form-input form-select" value={form.sectionId || ''}
                                        onChange={e => setForm({ ...form, sectionId: e.target.value })} disabled={!form.departmentId}>
                                        <option value="">Select Section</option>
                                        {modalSections.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-ghost" onClick={() => setShowModal('')}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Add Student</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Student */}
                {showModal === 'editStudent' && (
                    <div className="modal-overlay" onClick={() => setShowModal('')}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <h3 className="modal-title">Edit Student</h3>
                            <form onSubmit={handleEditStudent}>
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input className="form-input" value={form.name || ''}
                                        onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input className="form-input" type="email" value={form.email || ''}
                                        onChange={e => setForm({ ...form, email: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input className="form-input" type="tel" value={form.phone || ''}
                                        onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">New Password (leave blank to keep)</label>
                                    <input className="form-input" type="password" value={form.password || ''}
                                        onChange={e => setForm({ ...form, password: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Department</label>
                                    <select className="form-input form-select" value={form.departmentId || ''}
                                        onChange={e => handleModalDeptChange(e.target.value)}>
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Section</label>
                                    <select className="form-input form-select" value={form.sectionId || ''}
                                        onChange={e => setForm({ ...form, sectionId: e.target.value })} disabled={!form.departmentId}>
                                        <option value="">Select Section</option>
                                        {modalSections.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-ghost" onClick={() => setShowModal('')}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
