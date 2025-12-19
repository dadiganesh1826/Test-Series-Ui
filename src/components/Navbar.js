import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">📚</span>
                    <span className="brand-text">TestSeries</span>
                </Link>

                <div className="navbar-menu">
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="nav-link">Dashboard</Link>
                            <Link to="/test-series" className="nav-link">Test Series</Link>
                            <Link to="/practice/topic" className="nav-link">🎯 Practice</Link>
                            <Link to="/results" className="nav-link">My Results</Link>
                            <Link to="/bookmarks" className="nav-link">🔖 Bookmarks</Link>
                            <Link to="/leaderboard" className="nav-link">🏆 Leaderboard</Link>
                            <div className="user-menu">
                                <Link to="/profile" className="user-profile-link">
                                    👤 <span className="user-name">{user?.name}</span>
                                </Link>
                                <button onClick={logout} className="btn btn-secondary btn-sm">Logout</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
