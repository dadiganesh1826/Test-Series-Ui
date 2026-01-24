import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import axios from 'axios';
import './Leaderboard.css';

const Leaderboard = () => {
    const [activeTab, setActiveTab] = useState('global');
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [testSeriesList, setTestSeriesList] = useState([]);
    const [selectedTestId, setSelectedTestId] = useState('');

    useEffect(() => {
        if (activeTab === 'global') {
            fetchGlobalLeaderboard();
        } else if (activeTab === 'test' && selectedTestId) {
            fetchTestLeaderboard(selectedTestId);
        }
    }, [activeTab, selectedTestId]);

    useEffect(() => {
        // Fetch test series list for the dropdown
        fetchTestSeriesList();
    }, []);

    const fetchGlobalLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await axios.get('${API_BASE_URL}/leaderboard/global');
            setLeaderboardData(res.data);
        } catch (error) {
            console.error("Error fetching global leaderboard", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTestLeaderboard = async (testId) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/leaderboard/test/${testId}`);
            setLeaderboardData(res.data);
        } catch (error) {
            console.error("Error fetching test leaderboard", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTestSeriesList = async () => {
        try {
            const res = await axios.get('${API_BASE_URL}/test-series');
            setTestSeriesList(res.data);
            if (res.data.length > 0) {
                // Default to first test if switching to test tab
                // We won't set selectedTestId immediately to avoid double fetch if user stays on global
            }
        } catch (error) {
            console.error("Error fetching test series list", error);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'test' && !selectedTestId && testSeriesList.length > 0) {
            setSelectedTestId(testSeriesList[0].id);
        }
    };

    return (
        <div className="leaderboard-page">
            <div className="leaderboard-header">
                <h1>🏆 Champions Leaderboard</h1>
                <p>See where you stand among the best!</p>
            </div>

            <div className="leaderboard-tabs">
                <button
                    className={`tab-btn ${activeTab === 'global' ? 'active' : ''}`}
                    onClick={() => handleTabChange('global')}
                >
                    🌍 Global Ranking
                </button>
                <button
                    className={`tab-btn ${activeTab === 'test' ? 'active' : ''}`}
                    onClick={() => handleTabChange('test')}
                >
                    📑 Test Wise
                </button>
            </div>

            {activeTab === 'test' && (
                <div className="test-selector">
                    <select
                        value={selectedTestId}
                        onChange={(e) => setSelectedTestId(e.target.value)}
                        className="test-dropdown"
                    >
                        {testSeriesList.map(test => (
                            <option key={test.id} value={test.id}>{test.title}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="leaderboard-content">
                {loading ? (
                    <div className="loading-state">Loading champions...</div>
                ) : leaderboardData.length === 0 ? (
                    <div className="empty-state">
                        <span>📉</span>
                        <p>No data available yet. Be the first to top the charts!</p>
                    </div>
                ) : (
                    <div className="leaderboard-table-container">
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Student</th>
                                    <th>Score</th>
                                    <th>Accuracy</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.map((entry, index) => (
                                    <tr key={index} className={`rank-${entry.rank}`}>
                                        <td className="rank-cell">
                                            {entry.rank === 1 ? '🥇' :
                                                entry.rank === 2 ? '🥈' :
                                                    entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                                        </td>
                                        <td className="user-cell">
                                            <div className="user-avatar">{entry.userName.charAt(0)}</div>
                                            <div className="user-info">
                                                <span className="user-name">{entry.userName}</span>
                                                {activeTab === 'global' && <span className="user-stats">{entry.testsTaken} tests taken</span>}
                                            </div>
                                        </td>
                                        <td className="score-cell">{entry.totalScore}</td>
                                        <td className="accuracy-cell">{entry.averageAccuracy.toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
