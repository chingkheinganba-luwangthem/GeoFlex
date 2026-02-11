import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await authAPI.login(email, password);
            const { token, role, userId, name, profilePicture } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem('userId', userId);
            localStorage.setItem('userName', name);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('profilePicture', profilePicture || '');

            if (role === 'ADMIN') navigate('/admin');
            else if (role === 'TEACHER') navigate('/teacher');
            else if (role === 'STUDENT') navigate('/student');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">📍</div>
                        <h1 className="auth-title">GeoAttend</h1>
                        <p className="auth-subtitle">Geofencing Attendance System</p>
                    </div>

                    {error && <div className="error-msg">{error}</div>}

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                            {loading ? '⏳ Signing in...' : '🔐 Sign In'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Student? <a href="/register">Create an account</a></p>
                    </div>

                    <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(99,102,241,0.08)', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--text-secondary)' }}>Demo Accounts:</strong><br />
                        👑 Admin: admin@geofence.com / admin123<br />
                        👨‍🏫 Teacher: teacher@geofence.com / teacher123<br />
                        👨‍🎓 Student: student@geofence.com / student123
                    </div>
                </div>
            </div>
        </div>
    );
}