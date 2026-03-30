import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Navbar() {
    const navigate = useNavigate();
    const name = localStorage.getItem('userName') || 'User';
    const role = localStorage.getItem('role') || '';
    const profilePicture = localStorage.getItem('profilePicture');

    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <img src={logo} alt="GeoFlex" className="navbar-logo navbar-logo-round" />
                <span>GeoFlex</span>
            </div>

            <div className="navbar-right">
                <div className="navbar-user">
                    <div className="profile-pic">
                        {profilePicture ? (
                            <img src={profilePicture} alt={name} />
                        ) : (
                            initials
                        )}
                    </div>
                    <div>
                        <div className="user-name">{name}</div>
                        <div className="user-role">{role}</div>
                    </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                </button>
            </div>
        </nav>
    );
}
