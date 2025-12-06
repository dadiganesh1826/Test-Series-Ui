import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { examAPI, testSeriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

            setExamHistory(historyRes.data);
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

    // Process Data
    const completedExams = examHistory.filter(e => e.isCompleted);
    const incompleteExams = examHistory.filter(e => !e.isCompleted);

    // Stats
    const totalTests = completedExams.length;
    const passedTests = completedExams.filter(e => e.isPassed).length;
    const averageScore = totalTests > 0
        ? (completedExams.reduce((sum, e) => sum + (e.score / e.totalMarks * 100), 0) / totalTests).toFixed(1)
        : 0;

    // Recommended (Tests not yet attempted)
    const attemptedTestIds = new Set(examHistory.map(e => e.testSeries.id));
    const recommendedTests = testSeries.filter(t => !attemptedTestIds.has(t.id)).slice(0, 3);

    // Chart Data (Last 5 completed exams, reversed for chronological order)
    const chartData = completedExams.slice(0, 5).reverse().map(e => ({
        name: e.testSeries.title.length > 15 ? e.testSeries.title.substring(0, 15) + '...' : e.testSeries.title,
        score: ((e.score / e.totalMarks) * 100).toFixed(1)
    }));

    return (
        <div className="dashboard-page">
            <div className="container">
                {/* Header */}
                <div className="dashboard-header fade-in">
                    <div>
                        <h1>Hello, {user.name} 👋</h1>
                        <p>Keep pushing your limits. Here is your daily progress.</p>
                    </div>
                    {incompleteExams.length > 0 && (
                        <div className="resume-card">
                            <div className="resume-info">
                                <h3>Continue Learning</h3>
                                <p>You have {incompleteExams.length} unfinished test(s).</p>
                            </div>
                            <Link to={`/exam/${incompleteExams[0].testSeries.id}/start`} className="btn btn-primary">
                                Resume {incompleteExams[0].testSeries.title}
                            </Link>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="stats-overview fade-in">
                    <div className="stat-box">
                        <div className="stat-icon">📚</div>
                        <div className="stat-content">
                            <div className="stat-value">{totalTests}</div>
                            <div className="stat-label">Tests Taken</div>
                        </div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-icon">🏆</div>
                        <div className="stat-content">
                            <div className="stat-value">{passedTests}</div>
                            <div className="stat-label">Tests Passed</div>
                        </div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-icon">📈</div>
                        <div className="stat-content">
                            <div className="stat-value">{averageScore}%</div>
                            <div className="stat-label">Avg. Score</div>
                        </div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-content">
                            <div className="stat-value">{testSeries.length}</div>
                            <div className="stat-label">Total Series</div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-content">
                    {/* Left Column */}
                    <div className="content-main">

                        {/* Performance Chart */}
                        {completedExams.length > 0 && (
                            <div className="content-section fade-in">
                                <div className="section-header">
                                    <h2>Performance Trend</h2>
                                </div>
                                <div style={{ height: '300px', width: '100%' }}>
                                    <ResponsiveContainer>
                                        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid stroke="#f5f5f5" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="score" stroke="#0D47A1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Recent Activity */}
                        <div className="content-section fade-in" style={{ marginTop: '24px' }}>
                            <div className="section-header">
                                <h2>Recent Activity</h2>
                                <Link to="/results" className="view-all">View All History →</Link>
                            </div>

                            {completedExams.length > 0 ? (
                                <div className="activity-list">
                                    {completedExams.slice(0, 4).map((exam) => (
                                        <Link key={exam.id} to={`/result/${exam.id}`} className="activity-item">
                                            <div className="activity-icon">📝</div>
                                            <div className="activity-info">
                                                <h4>{exam.testSeries.title}</h4>
                                                <p>{new Date(exam.submittedAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="activity-result">
                                                <span className={`badge ${exam.isPassed ? 'badge-success' : 'badge-danger'}`}>
                                                    {exam.score} / {exam.totalMarks}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state-small">
                                    <p>No completed tests yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="content-sidebar">
                        {/* Recommended Tests */}
                        <div className="content-section fade-in">
                            <div className="section-header">
                                <h2>Recommended</h2>
                                <Link to="/test-series" className="view-all">Explore →</Link>
                            </div>

                            {recommendedTests.length > 0 ? (
                                <div className="rec-list">
                                    {recommendedTests.map(test => (
                                        <div key={test.id} className="rec-card">
                                            <h4>{test.title}</h4>
                                            <div className="rec-meta">
                                                <span>{test.totalQuestions} Qs</span> • <span>{test.durationMinutes} Mins</span>
                                            </div>
                                            <Link to={`/exam/${test.id}/start`} className="btn btn-sm btn-primary" style={{ marginTop: '12px', width: '100%' }}>
                                                Start Now
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state-small">
                                    <p>You've attempted everything! Great job.</p>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="content-section fade-in" style={{ marginTop: '24px' }}>
                            <div className="section-header">
                                <h2>Quick Actions</h2>
                            </div>
                            <div className="quick-actions">
                                <Link to="/test-series" className="action-card">
                                    <h3>🚀 Start New Test</h3>
                                </Link>
                                <Link to="/results" className="action-card" style={{ borderLeftColor: '#FBC02D' }}>
                                    <h3>📊 View Analytics</h3>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
