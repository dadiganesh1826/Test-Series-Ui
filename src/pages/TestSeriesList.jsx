import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testSeriesAPI, examAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './TestSeriesList.css';

const TestSeriesList = () => {
    const [testSeries, setTestSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchTestSeries();
    }, []);

    const fetchTestSeries = async () => {
        try {
            const response = await testSeriesAPI.getAll();
            setTestSeries(response.data);
        } catch (err) {
            setError('Failed to load test series');
        } finally {
            setLoading(false);
        }
    };

    const handleStartExam = async (testSeriesId) => {
        try {
            const response = await examAPI.startExam(user.id, testSeriesId);
            navigate(`/exam/${response.data.id}`);
        } catch (err) {
            alert('Failed to start exam. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ padding: '40px 20px' }}>
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="test-series-page">
            <div className="container">
                <div className="page-header fade-in">
                    <h1>Available Test Series</h1>
                    <p>Choose a test series and challenge yourself</p>
                </div>

                <div className="test-series-grid">
                    {testSeries.map((test, index) => (
                        <div
                            key={test.id}
                            className="test-card fade-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="test-card-header">
                                <h3>{test.title}</h3>
                                <span className="badge badge-primary">Active</span>
                            </div>

                            <p className="test-description">{test.description}</p>

                            <div className="test-stats">
                                <div className="stat">
                                    <span className="stat-icon">⏱️</span>
                                    <div>
                                        <div className="stat-value">{test.durationMinutes}m</div>
                                        <div className="stat-label">Time</div>
                                    </div>
                                </div>
                                <div className="stat">
                                    <span className="stat-icon">📝</span>
                                    <div>
                                        <div className="stat-value">{test.questions?.length || 0}</div>
                                        <div className="stat-label">Qs</div>
                                    </div>
                                </div>
                                <div className="stat">
                                    <span className="stat-icon">🎯</span>
                                    <div>
                                        <div className="stat-value">{test.totalMarks}</div>
                                        <div className="stat-label">Marks</div>
                                    </div>
                                </div>
                            </div>

                            <div className="test-card-footer">
                                <div className="passing-info">
                                    Pass: <strong>{test.passingMarks}</strong>
                                </div>
                                <div className="test-actions">
                                    <button
                                        onClick={() => navigate(`/practice/${test.id}`)}
                                        className="btn btn-outline-secondary btn-sm"
                                        title="Practice Mode"
                                    >
                                        Practice
                                    </button>
                                    <button
                                        onClick={() => handleStartExam(test.id)}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Start
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {testSeries.length === 0 && (
                    <div className="empty-state">
                        <span className="empty-icon">📚</span>
                        <h3>No test series available</h3>
                        <p>Check back later for new test series</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestSeriesList;
