import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const Hero = () => {
    return (
        <section className="hero-section">
            <div className="hero-bg-shape"></div>
            <div className="container">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Master Your Exams with <span>TestSeries</span>
                    </h1>
                    <p className="hero-subtitle">
                        The smartest way to prepare for competitive exams.
                        Get real-time analytics, expert-curated questions, and
                        AI-driven performance insights.
                    </p>
                    <div className="hero-cta-group">
                        <Link to="/register" className="btn-hero-primary">
                            Get Started Free
                        </Link>
                        <Link to="/test-series" className="btn-hero-secondary">
                            View Tests
                        </Link>
                    </div>
                </div>
            </div>
            {/* We could add an illustration here on the right side for desktop */}
        </section>
    );
};

export default Hero;
