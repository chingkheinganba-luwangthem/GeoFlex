import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import logo from '../assets/logo.png';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [departments, setDepartments] = useState([]);
    const [sections, setSections] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { loadDepartments(); }, []);

    const loadDepartments = async () => {
        try {
            const res = await authAPI.getDepartments();
            setDepartments(res.data);
        } catch (err) { console.error('Failed to load departments'); }
    };

    const handleDepartmentChange = async (e) => {
        const deptId = e.target.value;
        setDepartmentId(deptId);
        setSectionId('');
        setSections([]);
        if (deptId) {
            try {
                const res = await authAPI.getSections(deptId);
                setSections(res.data);
            } catch (err) { console.error('Failed to load sections'); }
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) { setError('Passwords do not match'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

        setLoading(true);
        try {
            const res = await authAPI.register({
                name, email, phone, password,
                departmentId: departmentId || null,
                sectionId: sectionId || null,
            });
            const { token, role, userId } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem('userId', userId);
            localStorage.setItem('userName', name);
            localStorage.setItem('userEmail', email);

            navigate('/student');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page-modern">
            {/* Animated background orbs */}
            <div className="auth-bg-orbs">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
            </div>

            {/* Back to landing */}
            <Link to="/" className="auth-back-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Home
            </Link>

            <div className="auth-card auth-card-wide">
                <div className="auth-card-header">
                    <img src={logo} alt="GeoFlex" className="auth-logo auth-logo-round" />
                    <h1>Create Account</h1>
                    <p>Register as a student to start marking attendance</p>
                </div>

                {error && (
                    <div className="auth-error">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="auth-form">
                    <div className="auth-form-grid">
                        <div className="auth-field">
                            <label>Full Name</label>
                            <div className="auth-input-wrap">
                                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                <input type="text" placeholder="Your full name" value={name}
                                    onChange={e => setName(e.target.value)} required />
                            </div>
                        </div>
                        <div className="auth-field">
                            <label>Phone Number</label>
                            <div className="auth-input-wrap">
                                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
                                <input type="tel" placeholder="Phone number" value={phone}
                                    onChange={e => setPhone(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="auth-field">
                        <label>Email Address</label>
                        <div className="auth-input-wrap">
                            <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,6 12,13 2,6" /></svg>
                            <input type="email" placeholder="name@example.com" value={email}
                                onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                        </div>
                    </div>

                    <div className="auth-form-grid">
                        <div className="auth-field">
                            <label>Department</label>
                            <div className="auth-input-wrap auth-select-wrap">
                                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                <select value={departmentId} onChange={handleDepartmentChange}>
                                    <option value="">Select Department</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="auth-field">
                            <label>Section</label>
                            <div className="auth-input-wrap auth-select-wrap">
                                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                                <select value={sectionId} onChange={e => setSectionId(e.target.value)} disabled={!departmentId}>
                                    <option value="">Select Section</option>
                                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="auth-form-grid">
                        <div className="auth-field">
                            <label>Password</label>
                            <div className="auth-input-wrap">
                                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                <input type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" value={password}
                                    onChange={e => setPassword(e.target.value)} required />
                                <button type="button" className="auth-toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>
                        <div className="auth-field">
                            <label>Confirm Password</label>
                            <div className="auth-input-wrap">
                                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                <input type={showPassword ? 'text' : 'password'} placeholder="Re-enter password" value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)} required />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? (
                            <><span className="auth-spinner"></span> Creating account...</>
                        ) : (
                            <>Create Account <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></>
                        )}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>Already have an account?</span>
                </div>

                <Link to="/login" className="auth-alt-link">
                    Sign in instead
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </Link>
            </div>
        </div>
    );
}
