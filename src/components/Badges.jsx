import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Badges.css';

const Badges = () => {
    const { user } = useAuth();
    const [allBadges, setAllBadges] = useState([]);
    const [userBadges, setUserBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchBadges();
        }
    }, [user]);

    const fetchBadges = async () => {
        try {
            const [allRes, userRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/gamification/badges/all`),
                axios.get(`${API_BASE_URL}/gamification/badges/${user.id}`)
            ]);
            setAllBadges(allRes.data);
            setUserBadges(userRes.data); // This is a list of UserBadge objects
        } catch (error) {
            console.error("Error fetching badges", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="badges-section badges-loading">Loading Achievements...</div>;

    // Create a set of unlocked badge IDs for easy lookup
    const unlockedBadgeIds = new Set(userBadges.map(ub => ub.badge.id));

    return (
        <div className="badges-section fade-in">
            <div className="badges-header">
                <h2>🏆 Your Achievements</h2>
                <span className="badge-count">
                    {userBadges.length} / {allBadges.length} Unlocked
                </span>
            </div>

            <div className="badges-grid">
                {allBadges.map(badge => {
                    const isUnlocked = unlockedBadgeIds.has(badge.id);
                    return (
                        <div key={badge.id} className={`badge-card ${isUnlocked ? 'unlocked' : 'locked'}`} title={isUnlocked ? `Unlocked!` : 'Locked'}>
                            <div className="badge-icon">{badge.icon}</div>
                            <div className="badge-name">{badge.name}</div>
                            <div className="badge-desc">{badge.description}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Badges;
