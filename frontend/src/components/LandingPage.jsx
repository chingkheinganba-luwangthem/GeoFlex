import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="landing-nav-brand">
                    <img src={logo} alt="GeoFlex" />
                    <span>GeoFlex</span>
                </div>
                <ul className="landing-nav-links">
                    <li><a href="#features">Features</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#contact">Contact</a></li>
                    <li>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
                            Get Started
                        </button>
                    </li>
                </ul>
            </nav>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-hero-content">
                    <div className="landing-hero-text">
                        <h1>
                            Smart Attendance<br />
                            with <span>GeoFlex</span>
                        </h1>
                        <p>
                            Revolutionize your institution's attendance system with GPS-based geofencing.
                            Track attendance in real-time, manage departments & sections, and gain powerful analytics — all in one platform.
                        </p>
                        <div className="landing-hero-buttons">
                            <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
                                👑 Continue as Admin
                            </button>
                            <button className="btn btn-outline-primary btn-lg" onClick={() => navigate('/login')}>
                                👨‍🏫 Continue as Teacher
                            </button>
                            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/login')}>
                                🎓 Continue as Student
                            </button>
                        </div>
                    </div>
                    <div className="landing-hero-image">
                        <img src="/hero.svg" alt="GeoFlex Attendance System" />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="landing-features" id="features">
                <h2>Why Choose GeoFlex?</h2>
                <p>Powerful features designed for modern educational institutions</p>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon purple">📍</div>
                        <h3>GPS Geofencing</h3>
                        <p>Ensure students are physically present with precise location-based attendance verification.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon blue">⚡</div>
                        <h3>Real-Time Tracking</h3>
                        <p>Instant attendance updates via WebSocket technology. Teachers see results as students check in.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon green">🏫</div>
                        <h3>Department & Sections</h3>
                        <p>Organize students by department (MCA, BCA) and sections (A, B, C, D) with separate records.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon cyan">📊</div>
                        <h3>Smart Analytics</h3>
                        <p>Visual charts and statistics for attendance trends, helping administrators make data-driven decisions.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon orange">🔐</div>
                        <h3>Role-Based Access</h3>
                        <p>Separate dashboards for Admins, Teachers, and Students with tailored permissions and views.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon pink">📱</div>
                        <h3>Fully Responsive</h3>
                        <p>Works seamlessly on desktop, tablet, and mobile devices for attendance on the go.</p>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="landing-about" id="about">
                <h2>About GeoFlex</h2>
                <p className="about-subtitle">Built for Modern Education</p>

                <div className="about-content">
                    <div className="about-text">
                        <p>
                            GeoFlex is a next-generation attendance management system designed specifically for colleges and universities.
                            By leveraging GPS geofencing technology, GeoFlex ensures that only students physically present within the
                            designated area can mark their attendance — eliminating proxy attendance and manual errors.
                        </p>
                        <p>
                            Our platform supports multi-level organization with departments and sections, allowing teachers to
                            conduct targeted attendance sessions for specific groups. With real-time WebSocket notifications,
                            attendance data flows instantly between teachers and students.
                        </p>
                        <p>
                            Whether you're an administrator managing the entire institution, a teacher running daily sessions,
                            or a student tracking your attendance record — GeoFlex provides a seamless, modern experience
                            with powerful analytics and role-based dashboards.
                        </p>
                    </div>
                    <div className="about-highlights">
                        <div className="about-highlight-item">
                            <div className="about-highlight-number">100%</div>
                            <div className="about-highlight-label">Location Verified</div>
                        </div>
                        <div className="about-highlight-item">
                            <div className="about-highlight-number">Real-Time</div>
                            <div className="about-highlight-label">WebSocket Updates</div>
                        </div>
                        <div className="about-highlight-item">
                            <div className="about-highlight-number">3 Roles</div>
                            <div className="about-highlight-label">Admin, Teacher, Student</div>
                        </div>
                        <div className="about-highlight-item">
                            <div className="about-highlight-number">Auto</div>
                            <div className="about-highlight-label">Absent Marking</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="landing-contact" id="contact">
                <h2>Contact Us</h2>
                <p className="contact-subtitle">Have questions or feedback? We'd love to hear from you.</p>

                <div className="contact-content">
                    <div className="contact-info">
                        <div className="contact-item">
                            <div className="contact-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,6 12,13 2,6" />
                                </svg>
                            </div>
                            <div>
                                <div className="contact-label">Email</div>
                                <a href="mailto:support@geoflex.edu" className="contact-value">support@geoflex.edu</a>
                            </div>
                        </div>
                        <div className="contact-item">
                            <div className="contact-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                            </div>
                            <div>
                                <div className="contact-label">Phone</div>
                                <a href="tel:+919876543210" className="contact-value">+91 98765 43210</a>
                            </div>
                        </div>
                        <div className="contact-item">
                            <div className="contact-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                </svg>
                            </div>
                            <div>
                                <div className="contact-label">Address</div>
                                <span className="contact-value">Manipur University, Canchipur, Imphal - 795003</span>
                            </div>
                        </div>
                    </div>

                    <div className="contact-social">
                        <h4>Follow Us</h4>
                        <div className="social-links">
                            <a href="https://twitter.com/geoflex" target="_blank" rel="noopener noreferrer" className="social-link" title="Twitter">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a href="https://github.com/geoflex" target="_blank" rel="noopener noreferrer" className="social-link" title="GitHub">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </a>
                            <a href="https://linkedin.com/company/geoflex" target="_blank" rel="noopener noreferrer" className="social-link" title="LinkedIn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                            <a href="https://instagram.com/geoflex" target="_blank" rel="noopener noreferrer" className="social-link" title="Instagram">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p>&copy; 2026 GeoFlex — Location Lock &middot; Smart Recognition. Built with ❤️ for smarter education.</p>
            </footer>
        </div>
    );
}
