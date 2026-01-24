import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Hide Navbar on Exam Page to provide full-screen experience
    if (location.pathname.startsWith('/exam/')) {
        return null;
    }

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">📚</span>
                    <span className="brand-text">TestSeries</span>
                </Link>

                <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                    {mobileMenuOpen ? '✕' : '☰'}
                </button>

                <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}>Dashboard</Link>
                            <Link to="/test-series" className="nav-link" onClick={closeMobileMenu}>Test Series</Link>
                            <Link to="/practice/topic" className="nav-link" onClick={closeMobileMenu}>🎯 Practice</Link>
                            <Link to="/results" className="nav-link" onClick={closeMobileMenu}>My Results</Link>
                            <Link to="/bookmarks" className="nav-link" onClick={closeMobileMenu}>🔖 Bookmarks</Link>
                            <Link to="/leaderboard" className="nav-link" onClick={closeMobileMenu}>🏆 Leaderboard</Link>
                            <div className="user-menu">
                                <Link to="/profile" className="user-profile-link" onClick={closeMobileMenu}>
                                    👤 <span className="user-name">{user?.name}</span>
                                </Link>
                                <button onClick={() => { logout(); closeMobileMenu(); }} className="btn btn-secondary btn-sm">Logout</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary btn-sm" onClick={closeMobileMenu}>Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMobileMenu}>Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
