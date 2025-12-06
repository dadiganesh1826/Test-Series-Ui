import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="home-page">
            <div className="hero-section">
                <div className="container">
                    <div className="hero-content fade-in">
                        <h1 className="hero-title">
                            Master Your Skills with
                            <span className="gradient-text"> Test Series</span>
                        </h1>
                        <p className="hero-subtitle">
                            Take comprehensive exams, track your progress, and achieve your learning goals
                            with our advanced test series platform.
                        </p>
                        <div className="hero-actions">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/dashboard" className="btn btn-primary btn-lg">
                                        Go to Dashboard
                                    </Link>
                                    <Link to="/test-series" className="btn btn-secondary btn-lg">
                                        Browse Tests
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/register" className="btn btn-primary btn-lg">
                                        Get Started
                                    </Link>
                                    <Link to="/login" className="btn btn-secondary btn-lg">
                                        Login
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="features-section">
                <div className="container">
                    <h2 className="section-title fade-in">Why Choose Our Platform?</h2>

                    <div className="features-grid">
                        <div className="feature-card fade-in">
                            <div className="feature-icon">📝</div>
                            <h3>Comprehensive Tests</h3>
                            <p>Access a wide variety of test series covering multiple subjects and topics</p>
                        </div>

                        <div className="feature-card fade-in">
                            <div className="feature-icon">📊</div>
                            <h3>Detailed Analytics</h3>
                            <p>Get in-depth analysis of your performance with question-wise breakdowns</p>
                        </div>

                        <div className="feature-card fade-in">
                            <div className="feature-icon">⏱️</div>
                            <h3>Timed Exams</h3>
                            <p>Practice with realistic exam conditions and time constraints</p>
                        </div>

                        <div className="feature-card fade-in">
                            <div className="feature-icon">🎯</div>
                            <h3>Track Progress</h3>
                            <p>Monitor your improvement over time with comprehensive result history</p>
                        </div>

                        <div className="feature-card fade-in">
                            <div className="feature-icon">💡</div>
                            <h3>Instant Results</h3>
                            <p>Get immediate feedback with explanations for correct answers</p>
                        </div>

                        <div className="feature-card fade-in">
                            <div className="feature-icon">🏆</div>
                            <h3>Achievement System</h3>
                            <p>Track your success rate and celebrate your achievements</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="cta-section">
                <div className="container">
                    <div className="cta-content fade-in">
                        <h2>Ready to Start Your Journey?</h2>
                        <p>Join thousands of learners improving their skills every day</p>
                        {!isAuthenticated && (
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Create Free Account
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
