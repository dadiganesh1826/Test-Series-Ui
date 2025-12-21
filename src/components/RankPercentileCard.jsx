import React from 'react';
import './RankPercentileCard.css';

const RankPercentileCard = ({ analytics }) => {
    if (!analytics) return null;

    const { rank, totalAttempts, percentile, averageScore, topperScore, userScore } = analytics;

    const percentileColor = percentile >= 90 ? '#4CAF50' : percentile >= 75 ? '#2196F3' : percentile >= 50 ? '#FF9800' : '#F44336';

    const calculateProgress = (value, max) => {
        return Math.min((value / max) * 100, 100);
    };

    return (
        <div className="rank-percentile-card">
            <h3 className="card-title">📊 Your Performance Ranking</h3>

            <div className="stats-grid">
                {/* Rank Card */}
                <div className="stat-box rank-box">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-content">
                        <div className="stat-label">Your Rank</div>
                        <div className="stat-value">
                            {rank} <span className="stat-total">/ {totalAttempts}</span>
                        </div>
                        <div className="stat-description">
                            {rank <= 10 ? 'Excellent! Top 10!' :
                                rank <= totalAttempts * 0.25 ? 'Great! Top 25%' :
                                    rank <= totalAttempts * 0.5 ? 'Good! Top 50%' :
                                        'Keep practicing!'}
                        </div>
                    </div>
                </div>

                {/* Percentile Card */}
                <div className="stat-box percentile-box">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                        <div className="stat-label">Percentile</div>
                        <div className="stat-value" style={{ color: percentileColor }}>
                            {percentile.toFixed(2)}%
                        </div>
                        <div className="percentile-bar">
                            <div
                                className="percentile-fill"
                                style={{
                                    width: `${percentile}%`,
                                    backgroundColor: percentileColor
                                }}
                            ></div>
                        </div>
                        <div className="stat-description">
                            Better than {percentile.toFixed(0)}% of test takers
                        </div>
                    </div>
                </div>
            </div>

            {/* Comparison Section */}
            <div className="comparison-section">
                <h4 className="comparison-title">Score Comparison</h4>

                <div className="comparison-bars">
                    {/* Your Score */}
                    <div className="comparison-item">
                        <div className="comparison-label">
                            <span className="label-icon">👤</span>
                            <span>Your Score</span>
                        </div>
                        <div className="comparison-bar-container">
                            <div
                                className="comparison-bar your-score"
                                style={{ width: `${calculateProgress(userScore, topperScore)}%` }}
                            >
                                <span className="bar-value">{userScore}</span>
                            </div>
                        </div>
                    </div>

                    {/* Average Score */}
                    <div className="comparison-item">
                        <div className="comparison-label">
                            <span className="label-icon">📊</span>
                            <span>Average Score</span>
                        </div>
                        <div className="comparison-bar-container">
                            <div
                                className="comparison-bar average-score"
                                style={{ width: `${calculateProgress(averageScore, topperScore)}%` }}
                            >
                                <span className="bar-value">{averageScore.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Topper Score */}
                    <div className="comparison-item">
                        <div className="comparison-label">
                            <span className="label-icon">🥇</span>
                            <span>Topper Score</span>
                        </div>
                        <div className="comparison-bar-container">
                            <div
                                className="comparison-bar topper-score"
                                style={{ width: '100%' }}
                            >
                                <span className="bar-value">{topperScore}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Badge */}
                <div className="performance-badge">
                    {userScore >= topperScore * 0.9 ? (
                        <div className="badge excellent">
                            <span className="badge-icon">🌟</span>
                            <span>Excellent Performance!</span>
                        </div>
                    ) : userScore >= averageScore ? (
                        <div className="badge good">
                            <span className="badge-icon">👍</span>
                            <span>Above Average!</span>
                        </div>
                    ) : (
                        <div className="badge improve">
                            <span className="badge-icon">💪</span>
                            <span>Keep Improving!</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RankPercentileCard;
