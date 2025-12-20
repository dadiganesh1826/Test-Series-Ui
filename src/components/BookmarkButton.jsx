import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './BookmarkButton.css';

const BookmarkButton = ({ questionId }) => {
    const { user } = useAuth();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && questionId) {
            checkBookmarkStatus();
        }
    }, [user, questionId]);

    const checkBookmarkStatus = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/bookmarks/check`, {
                params: { userId: user.id, questionId }
            });
            setIsBookmarked(response.data);
        } catch (error) {
            console.error('Error checking bookmark status:', error);
        }
    };

    const toggleBookmark = async (e) => {
        e.stopPropagation();
        if (loading) return;

        setLoading(true);
        try {
            if (isBookmarked) {
                await axios.delete(`http://localhost:8080/api/bookmarks/${questionId}`, {
                    params: { userId: user.id }
                });
                setIsBookmarked(false);
            } else {
                await axios.post(`http://localhost:8080/api/bookmarks`, {
                    userId: user.id,
                    questionId
                });
                setIsBookmarked(true);
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            alert('Failed to update bookmark');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
            onClick={toggleBookmark}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Question"}
            disabled={loading}
        >
            <span className="bookmark-icon">
                {isBookmarked ? '★' : '☆'}
            </span>
        </button>
    );
};

export default BookmarkButton;
