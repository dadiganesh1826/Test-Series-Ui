import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CategoryPage.css';

const CategoryPage = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [tests, setTests] = useState([]);
    const [filteredTests, setFilteredTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        duration: 'all',
        difficulty: 'all',
        sortBy: 'popular'
    });

    useEffect(() => {
        fetchData();
    }, [categoryId]);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, filters, tests]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [categoryRes, testsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/categories/${categoryId}`),
                axios.get(`${API_BASE_URL}/test-series/category/${categoryId}`)
            ]);
            setCategory(categoryRes.data);
            setTests(testsRes.data);
            setFilteredTests(testsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...tests];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(test =>
                test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                test.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Duration filter
        if (filters.duration !== 'all') {
            const [min, max] = filters.duration.split('-').map(Number);
            filtered = filtered.filter(test => {
                if (max) {
                    return test.duration >= min && test.duration <= max;
                }
                return test.duration >= min;
            });
        }

        // Sort
        if (filters.sortBy === 'duration-asc') {
            filtered.sort((a, b) => a.duration - b.duration);
        } else if (filters.sortBy === 'duration-desc') {
            filtered.sort((a, b) => b.duration - a.duration);
        } else if (filters.sortBy === 'marks-desc') {
            filtered.sort((a, b) => b.totalMarks - a.totalMarks);
        }

        setFilteredTests(filtered);
    };

    if (loading) {
        return (
            <div className="category-page">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="category-page">
            {/* Header */}
            <div className="category-header">
                <button className="back-btn" onClick={() => navigate('/')}>
                    ← Back to Home
                </button>
                <div className="category-info">
                    <div className="category-icon-large">{category?.icon || '📚'}</div>
                    <div>
                        <h1>{category?.name}</h1>
                        <p>{category?.description}</p>
                        <div className="test-count">{tests.length} Test Series Available</div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="filters-section">
                <div className="search-container">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search test series..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filters-container">
                    <select
                        value={filters.duration}
                        onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                        className="filter-select"
                    >
                        <option value="all">All Durations</option>
                        <option value="0-30">Under 30 min</option>
                        <option value="30-60">30-60 min</option>
                        <option value="60-120">1-2 hours</option>
                        <option value="120-999">2+ hours</option>
                    </select>

                    <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                        className="filter-select"
                    >
                        <option value="popular">Most Popular</option>
                        <option value="duration-asc">Duration: Low to High</option>
                        <option value="duration-desc">Duration: High to Low</option>
                        <option value="marks-desc">Highest Marks</option>
                    </select>
                </div>
            </div>

            {/* Results Info */}
            <div className="results-info">
                <p>Showing {filteredTests.length} of {tests.length} test series</p>
            </div>

            {/* Tests Grid */}
            <div className="tests-grid">
                {filteredTests.length === 0 ? (
                    <div className="no-tests">
                        <span className="no-tests-icon">📚</span>
                        <h3>No tests found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    filteredTests.map(test => (
                        <div key={test.id} className="test-card">
                            {test.featured && (
                                <div className="featured-badge">⭐ Featured</div>
                            )}
                            <h3 className="test-title">{test.title}</h3>
                            <p className="test-description">{test.description}</p>

                            <div className="test-meta">
                                <div className="meta-item">
                                    <span className="meta-icon">⏱️</span>
                                    <span>{test.duration} min</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-icon">📊</span>
                                    <span>{test.totalMarks} marks</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-icon">❓</span>
                                    <span>{test.questionCount || 0} questions</span>
                                </div>
                            </div>

                            <div className="test-stats">
                                <span className="stat">
                                    <span className="stat-icon">👥</span>
                                    {Math.floor(Math.random() * 1000) + 100} attempts
                                </span>
                                <span className="stat">
                                    <span className="stat-icon">⭐</span>
                                    {(Math.random() * 2 + 3).toFixed(1)} rating
                                </span>
                            </div>

                            <button
                                className="start-btn"
                                onClick={() => navigate(`/test/${test.id}`)}
                            >
                                Start Test →
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
