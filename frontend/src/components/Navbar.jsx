import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const name = localStorage.getItem('userName') || 'User';
    const role = localStorage.getItem('role') || '';
    const profilePicture = localStorage.getItem('profilePicture');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const getInitials = (n) => {
        return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <div className="brand-icon">📍</div>
                GeoAttend
            </div>

            <div className="navbar-right">
                <div className="navbar-user">
                    <div className="profile-pic">
                        {profilePicture ? (
                            <img src={profilePicture} alt={name} />
                        ) : (
                            getInitials(name)
                        )}
                    </div>
                    <div>
                        <div className="user-name">{name}</div>
                        <div className="user-role">{role}</div>
                    </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                    🚪 Logout
                </button>
            </div>
        </nav>
    );
}
