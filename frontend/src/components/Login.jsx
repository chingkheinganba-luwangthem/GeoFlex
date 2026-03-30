import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import logo from '../assets/logo.png';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
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

            {/* Login Card */}
            <div className="auth-card">
                <div className="auth-card-header">
                    <img src={logo} alt="GeoFlex" className="auth-logo auth-logo-round" />
                    <h1>Welcome Back</h1>
                    <p>Sign in to your GeoFlex account</p>
                </div>

                {error && (
                    <div className="auth-error">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="auth-form">
                    <div className="auth-field">
                        <label>Email Address</label>
                        <div className="auth-input-wrap">
                            <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,6 12,13 2,6" />
                            </svg>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label>Password</label>
                        <div className="auth-input-wrap">
                            <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            <button type="button" className="auth-toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? (
                            <><span className="auth-spinner"></span> Signing in...</>
                        ) : (
                            <>Sign In <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></>
                        )}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>New here?</span>
                </div>

                <Link to="/register" className="auth-alt-link">
                    Create an account
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </Link>
            </div>
        </div>
    );
}