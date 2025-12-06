import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { examAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ResultsHistory.css';

const ResultsHistory = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const response = await examAPI.getHistory(user.id);
            setResults(response.data.filter(e => e.isCompleted));
        } catch (err) {
            console.error('Failed to load results');
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

    return (
        <div className="results-history-page">
            <div className="container">
                <div className="page-header fade-in">
                    <h1>My Results</h1>
                    <p>View all your test results and performance history</p>
                </div>

                {results.length > 0 ? (
                    <div className="results-table-container fade-in">
                        <table className="results-table">
                            <thead>
                                <tr>
                                    <th>Test Name</th>
                                    <th>Date</th>
                                    <th>Score</th>
                                    <th>Percentage</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((result) => {
                                    const percentage = (result.score / result.totalMarks * 100).toFixed(1);

                                    return (
                                        <tr key={result.id}>
                                            <td className="test-name">{result.testSeries.title}</td>
                                            <td>{new Date(result.submittedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}</td>
                                            <td className="score-cell">
                                                <strong>{result.score}</strong> / {result.totalMarks}
                                            </td>
                                            <td>
                                                <div className="percentage-bar">
                                                    <div
                                                        className="percentage-fill"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                    <span className="percentage-text">{percentage}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${result.isPassed ? 'badge-success' : 'badge-danger'}`}>
                                                    {result.isPassed ? 'Passed' : 'Failed'}
                                                </span>
                                            </td>
                                            <td>
                                                <Link to={`/result/${result.id}`} className="btn btn-primary btn-sm">
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state fade-in">
                        <span className="empty-icon">📊</span>
                        <h3>No results yet</h3>
                        <p>Take your first test to see results here</p>
                        <Link to="/test-series" className="btn btn-primary">Browse Tests</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultsHistory;
