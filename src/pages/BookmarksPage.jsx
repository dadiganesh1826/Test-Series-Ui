import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './BookmarksPage.css';

const BookmarksPage = () => {
    const { user } = useAuth();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchBookmarks();
        }
    }, [user]);

    const fetchBookmarks = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/bookmarks`, {
                params: { userId: user.id }
            });
            setBookmarks(response.data);
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (questionId) => {
        if (!window.confirm('Remove this bookmark?')) return;

        try {
            await axios.delete(`${API_BASE_URL}/bookmarks/${questionId}`, {
                params: { userId: user.id }
            });
            setBookmarks(bookmarks.filter(b => b.questionId !== questionId));
        } catch (error) {
            console.error('Error removing bookmark:', error);
            alert('Failed to remove bookmark');
        }
    };

    if (loading) {
        return <div className="loading-spinner">Loading your bookmarks...</div>;
    }

    return (
        <div className="bookmarks-container">
            <div className="bookmarks-header">
                <h1>My Bookmarks</h1>
                <p>Review your saved questions and important topics</p>
            </div>

            {bookmarks.length === 0 ? (
                <div className="no-bookmarks">
                    <h2>No bookmarks yet</h2>
                    <p>When you're practicing, click the star icon to save questions here.</p>
                    <Link to="/test-series" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
                        Start Practicing
                    </Link>
                </div>
            ) : (
                <div className="bookmarks-grid">
                    {bookmarks.map(bookmark => (
                        <div key={bookmark.id} className="bookmark-card">
                            <div className="bookmark-meta">
                                <span className="bookmark-badge">
                                    {bookmark.subject || 'General'}
                                </span>
                                <span className="bookmark-date">
                                    {new Date(bookmark.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="bookmark-question">
                                {bookmark.questionText}
                            </div>

                            <div className="bookmark-actions">
                                <button
                                    className="remove-bookmark-btn"
                                    onClick={() => handleRemove(bookmark.questionId)}
                                >
                                    Remove
                                </button>
                                {/* Future feature: Link to view full question/solution context */}
                                {/* <Link to={`/practice/question/${bookmark.questionId}`} className="view-btn">
                                    View Solution →
                                </Link> */}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookmarksPage;
