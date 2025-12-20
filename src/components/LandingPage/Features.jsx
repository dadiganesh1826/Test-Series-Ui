import React from 'react';
import './LandingPage.css';

const Features = () => {
    const features = [
        {
            icon: '📊',
            title: 'Real-time Analytics',
            desc: 'Track your performance with detailed insights, percentile rankings, and accuracy graphs.'
        },
        {
            icon: '🎯',
            title: 'Topic-wise Practice',
            desc: 'Focus on your weak areas with targeted practice questions for specific subjects and topics.'
        },
        {
            icon: '🏆',
            title: 'National Benchmarking',
            desc: 'Competete with thousands of students and see where you stand on the global leaderboard.'
        },
        {
            icon: '📝',
            title: 'Mock Tests',
            desc: 'Experience the real exam environment with our carefully timed and patterned mock tests.'
        },
        {
            icon: '💡',
            title: 'Detailed Solutions',
            desc: 'Understand the "Why" behind every answer with comprehensive explanations and tricks.'
        },
        {
            icon: '🔖',
            title: 'Smart Bookmarks',
            desc: 'Save important questions and add personal notes to revise them later before the exam.'
        }
    ];

    return (
        <section className="features-section">
            <div className="container">
                <div className="section-header-center">
                    <h2 className="section-title">Everything You Need to Succeed</h2>
                    <p className="section-subtitle">
                        Our platform is designed to optimize your preparation journey from day one.
                    </p>
                </div>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
