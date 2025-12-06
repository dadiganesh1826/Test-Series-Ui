import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { examAPI, testSeriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
    const [examHistory, setExamHistory] = useState([]);
    const [testSeries, setTestSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [historyRes, testsRes] = await Promise.all([
                examAPI.getHistory(user.id),
                testSeriesAPI.getAll()
            ]);

            setExamHistory(historyRes.data.filter(e => e.isCompleted));
            setTestSeries(testsRes.data);
        } catch (err) {
            console.error('Failed to load dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    const totalTests = examHistory.length;
    const passedTests = examHistory.filter(e => e.isPassed).length;
    const averageScore = totalTests > 0
        ? (examHistory.reduce((sum, e) => sum + (e.score / e.totalMarks * 100), 0) / totalTests).toFixed(1)
        : 0;

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-header fade-in">
                    <div>
                        <h1>Welcome back, {user.name}! 👋</h1>
                        <p>Track your progress and continue learning</p>
                    </div>
                </div>

                <div className="stats-overview fade-in">
                    <div className="stat-box">
                        <div className="stat-icon">📝</div>
                        <div className="stat-content">
                            <div className="stat-value">{totalTests}</div>
                            <div className="stat-label">Tests Taken</div>
                        </div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <div className="stat-value">{passedTests}</div>
                            <div className="stat-label">Tests Passed</div>
                        </div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <div className="stat-value">{averageScore}%</div>
                            <div className="stat-label">Average Score</div>
                        </div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-content">
                            <div className="stat-value">{testSeries.length}</div>
                            <div className="stat-label">Available Tests</div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-content">
                    <div className="content-section fade-in">
                        <div className="section-header">
                            <h2>Recent Activity</h2>
                            <Link to="/results" className="view-all">View All →</Link>
                        </div>

                        {examHistory.length > 0 ? (
                            <div className="activity-list">
                                {examHistory.slice(0, 5).map((exam) => (
                                    <Link
                                        key={exam.id}
                                        to={`/result/${exam.id}`}
                                        className="activity-item"
                                    >
                                        <div className="activity-info">
                                            <h4>{exam.testSeries.title}</h4>
                                            <p>{new Date(exam.submittedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}</p>
                                        </div>
                                        <div className="activity-result">
                                            <div className="score">{exam.score}/{exam.totalMarks}</div>
                                            <span className={`badge ${exam.isPassed ? 'badge-success' : 'badge-danger'}`}>
                                                {exam.isPassed ? 'Passed' : 'Failed'}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state-small">
                                <p>No tests taken yet. Start your first test!</p>
                                <Link to="/test-series" className="btn btn-primary">Browse Tests</Link>
                            </div>
                        )}
                    </div>

                    <div className="content-section fade-in">
                        <div className="section-header">
                            <h2>Quick Start</h2>
                        </div>

                        <div className="quick-actions">
                            <Link to="/test-series" className="action-card">
                                <span className="action-icon">🚀</span>
                                <h3>Take a Test</h3>
                                <p>Start a new test series</p>
                            </Link>
                            <Link to="/results" className="action-card">
                                <span className="action-icon">📈</span>
                                <h3>View Results</h3>
                                <p>Check your performance</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
