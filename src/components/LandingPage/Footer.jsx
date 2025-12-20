import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const Footer = () => {
    return (
        <footer className="footer-section">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <h3>TestSeries</h3>
                        <p style={{ color: '#95a5a6', lineHeight: '1.6' }}>
                            Empowering students to achieve their dreams through
                            technology-driven learning and assessment.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h3>Quick Links</h3>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/test-series">All Tests</Link></li>
                            <li><Link to="/register">Register</Link></li>
                            <li><Link to="/login">Login</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h3>Support</h3>
                        <ul className="footer-links">
                            <li><a href="#">FAQ</a></li>
                            <li><a href="#">Contact Us</a></li>
                            <li><a href="#">Terms of Service</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h3>Connect</h3>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                            {/* Social Icons Placeholder */}
                            <span style={{ fontSize: '1.5rem', cursor: 'pointer' }}>📱</span>
                            <span style={{ fontSize: '1.5rem', cursor: 'pointer' }}>📧</span>
                            <span style={{ fontSize: '1.5rem', cursor: 'pointer' }}>💬</span>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    &copy; {new Date().getFullYear()} TestSeries Inc. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
