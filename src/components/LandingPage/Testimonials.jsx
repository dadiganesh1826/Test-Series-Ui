import React from 'react';
import './LandingPage.css';

const Testimonials = () => {
    const reviews = [
        {
            name: "Priya Sharma",
            exam: "SSC CGL Aspirant",
            text: "The analytics feature is a game-changer. I realized I was spending too much time on easy questions. Improved my rank by 5000+!",
            avatar: "P"
        },
        {
            name: "Rahul Verma",
            exam: "Bank PO Aspirant",
            text: "The topic-wise practice helped me master Data Interpretation. The interface is exactly like the real exam.",
            avatar: "R"
        },
        {
            name: "Anjali Gupta",
            exam: "UPSC Aspirant",
            text: "I love the detailed explanations. It's like having a personal tutor. Highly recommended for serious aspirants.",
            avatar: "A"
        }
    ];

    return (
        <section className="testimonials-section">
            <div className="container">
                <div className="section-header-center">
                    <h2 className="section-title">Success Stories</h2>
                    <p className="section-subtitle">
                        Join thousands of students who achieved their dreams with TestSeries.
                    </p>
                </div>

                <div className="testimonials-grid">
                    {reviews.map((review, index) => (
                        <div key={index} className="testimonial-card">
                            <div className="quote-icon">❝</div>
                            <p className="testimonial-text">{review.text}</p>
                            <div className="user-meta">
                                <div className="user-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: '#555' }}>
                                    {review.avatar}
                                </div>
                                <div className="user-info">
                                    <h4>{review.name}</h4>
                                    <span>{review.exam}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
