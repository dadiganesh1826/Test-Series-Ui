import React, { useState } from 'react';
import './SubjectWiseAnalysis.css';

const SubjectWiseAnalysis = ({ subjectPerformance }) => {
    const [expandedSubject, setExpandedSubject] = useState(null);

    if (!subjectPerformance || subjectPerformance.length === 0) {
        return null;
    }

    const toggleSubject = (subjectId) => {
        setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
    };

    const getPerformanceColor = (accuracy) => {
        if (accuracy >= 80) return '#4CAF50'; // Green - Excellent
        if (accuracy >= 60) return '#2196F3'; // Blue - Good
        if (accuracy >= 40) return '#FF9800'; // Orange - Average
        return '#F44336'; // Red - Needs Improvement
    };

    const getPerformanceLabel = (accuracy) => {
        if (accuracy >= 80) return 'Excellent';
        if (accuracy >= 60) return 'Good';
        if (accuracy >= 40) return 'Average';
        return 'Needs Work';
    };

    const getStrengthIcon = (accuracy) => {
        if (accuracy >= 80) return '💪';
        if (accuracy >= 60) return '👍';
        if (accuracy >= 40) return '📈';
        return '📚';
    };

    return (
        <div className="subject-wise-analysis">
            <h3 className="analysis-title">📚 Subject-Wise Performance</h3>

            <div className="subjects-container">
                {subjectPerformance.map((subject) => {
                    const isExpanded = expandedSubject === subject.subjectId;
                    const accuracy = (subject.correctAnswers / subject.totalQuestions) * 100;
                    const performanceColor = getPerformanceColor(accuracy);

                    return (
                        <div key={subject.subjectId} className="subject-card">
                            {/* Subject Header */}
                            <div
                                className="subject-header"
                                onClick={() => toggleSubject(subject.subjectId)}
                            >
                                <div className="subject-info">
                                    <div className="subject-name-row">
                                        <span className="subject-icon">{getStrengthIcon(accuracy)}</span>
                                        <h4 className="subject-name">{subject.subjectName}</h4>
                                        <span
                                            className="performance-badge"
                                            style={{ backgroundColor: performanceColor }}
                                        >
                                            {getPerformanceLabel(accuracy)}
                                        </span>
                                    </div>

                                    <div className="subject-stats">
                                        <div className="stat-item">
                                            <span className="stat-label">Questions:</span>
                                            <span className="stat-value">{subject.totalQuestions}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Correct:</span>
                                            <span className="stat-value correct">{subject.correctAnswers}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Accuracy:</span>
                                            <span className="stat-value" style={{ color: performanceColor }}>
                                                {accuracy.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button className="expand-btn">
                                    {isExpanded ? '▼' : '▶'}
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="accuracy-bar-container">
                                <div
                                    className="accuracy-bar"
                                    style={{
                                        width: `${accuracy}%`,
                                        backgroundColor: performanceColor
                                    }}
                                >
                                    <span className="accuracy-text">{accuracy.toFixed(1)}%</span>
                                </div>
                            </div>

                            {/* Expanded Topics */}
                            {isExpanded && subject.topics && subject.topics.length > 0 && (
                                <div className="topics-section">
                                    <h5 className="topics-title">Topics Breakdown</h5>
                                    <div className="topics-list">
                                        {subject.topics.map((topic, index) => {
                                            const topicAccuracy = (topic.correctAnswers / topic.totalQuestions) * 100;
                                            const topicColor = getPerformanceColor(topicAccuracy);

                                            return (
                                                <div key={index} className="topic-item">
                                                    <div className="topic-header">
                                                        <span className="topic-name">{topic.topicName}</span>
                                                        <span className="topic-score">
                                                            {topic.correctAnswers}/{topic.totalQuestions}
                                                        </span>
                                                    </div>
                                                    <div className="topic-bar-container">
                                                        <div
                                                            className="topic-bar"
                                                            style={{
                                                                width: `${topicAccuracy}%`,
                                                                backgroundColor: topicColor
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span
                                                        className="topic-accuracy"
                                                        style={{ color: topicColor }}
                                                    >
                                                        {topicAccuracy.toFixed(0)}%
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Strengths and Weaknesses Summary */}
            <div className="performance-summary">
                <div className="summary-section strengths">
                    <h4 className="summary-title">💪 Your Strengths</h4>
                    <div className="summary-items">
                        {subjectPerformance
                            .filter(s => (s.correctAnswers / s.totalQuestions) * 100 >= 70)
                            .map(s => (
                                <div key={s.subjectId} className="summary-item strength">
                                    <span className="item-icon">✓</span>
                                    <span className="item-text">{s.subjectName}</span>
                                    <span className="item-score">
                                        {((s.correctAnswers / s.totalQuestions) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            ))}
                        {subjectPerformance.filter(s => (s.correctAnswers / s.totalQuestions) * 100 >= 70).length === 0 && (
                            <p className="no-items">Keep practicing to build strengths!</p>
                        )}
                    </div>
                </div>

                <div className="summary-section weaknesses">
                    <h4 className="summary-title">📚 Areas to Improve</h4>
                    <div className="summary-items">
                        {subjectPerformance
                            .filter(s => (s.correctAnswers / s.totalQuestions) * 100 < 60)
                            .map(s => (
                                <div key={s.subjectId} className="summary-item weakness">
                                    <span className="item-icon">!</span>
                                    <span className="item-text">{s.subjectName}</span>
                                    <span className="item-score">
                                        {((s.correctAnswers / s.totalQuestions) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            ))}
                        {subjectPerformance.filter(s => (s.correctAnswers / s.totalQuestions) * 100 < 60).length === 0 && (
                            <p className="no-items">Great! No weak areas found!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubjectWiseAnalysis;
