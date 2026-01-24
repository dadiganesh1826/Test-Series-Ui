import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { examAPI, testSeriesAPI, userAPI, analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Badges from '../components/Badges';
import './Dashboard.css';
import { Flame, PlayCircle, Award, Target } from 'lucide-react';

const Dashboard = () => {
    const [examHistory, setExamHistory] = useState([]);
    const [testSeries, setTestSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState(null);
    const [weeklyProgress, setWeeklyProgress] = useState(0);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [historyRes, testsRes, profileRes, progressRes] = await Promise.all([
                examAPI.getHistory(user.id),
                testSeriesAPI.getAll(),
                userAPI.getProfile(user.id),
                analyticsAPI.getWeeklyProgress(user.id)
            ]);

            setExamHistory(historyRes.data);
            setTestSeries(testsRes.data);
            setUserProfile(profileRes.data);
            setWeeklyProgress(progressRes.data.weeklyProgress);
        } catch (err) {
            console.error('Failed to load dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    const completedExams = examHistory.filter(e => e.isCompleted);
    const incompleteExams = examHistory.filter(e => !e.isCompleted);
    const totalTests = completedExams.length;
    const passedTests = completedExams.filter(e => e.isPassed).length;
    const averageScore = totalTests > 0
        ? (completedExams.reduce((sum, e) => sum + (e.score / e.totalMarks * 100), 0) / totalTests).toFixed(1)
        : 0;

    const attemptedTestIds = new Set(examHistory.map(e => e.testSeries.id));
    const recommendedTests = testSeries.filter(t => !attemptedTestIds.has(t.id)).slice(0, 3);
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
                            <Link to={`/exam/${incompleteExams[0].testSeries.id}`} className="btn btn-primary">
                                Resume Test
                            </Link>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="stats-overview fade-in">
                    <StatBox icon="📚" value={totalTests} label="Tests Taken" />
                    <StatBox icon="🏆" value={passedTests} label="Tests Passed" />
                    <StatBox icon="📈" value={`${averageScore}%`} label="Avg. Score" />
                    <StatBox icon="🎯" value={testSeries.length} label="Total Series" />
                </div>

                <div className="dashboard-content">
                    {/* Left Column */}
                    <div className="content-main">
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
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            {/* Binance Yellow Line */}
                                            <Line type="monotone" dataKey="score" stroke="#FCD535" strokeWidth={3} dot={{ r: 4, fill: '#FCD535' }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

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
                                <div className="empty-state-small"><p>No completed tests yet.</p></div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="content-sidebar">
                        {/* Binance Style Streak Box (No Purple) */}
                        <div className="streak-card fade-in">
                            <div className="streak-header">
                                <div className="streak-icon"><Flame size={24} color="#FCD535" fill="#FCD535" /></div>
                                <div>
                                    <h3>{userProfile?.currentStreak || 0} Day Streak</h3>
                                    <p>Keep the fire burning!</p>
                                </div>
                            </div>
                            <div className="streak-progress">
                                <div className="progress-label">
                                    <span>Weekly Goal</span>
                                    <span>{weeklyProgress} / {userProfile?.weeklyGoal || 50} Qs</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${Math.min((weeklyProgress / (userProfile?.weeklyGoal || 50)) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                        </div>

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
                                            <Link to={`/exam/${test.id}`} className="btn btn-sm btn-full btn-primary" style={{ marginTop: '12px' }}>
                                                Start Now
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state-small"><p>You've attempted everything! Great job.</p></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatBox = ({ icon, value, label }) => (
    <div className="stat-box">
        <div className="stat-icon">{icon}</div>
        <div className="stat-content">
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
        </div>
    </div>
);

export default Dashboard;
