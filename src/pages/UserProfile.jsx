import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './UserProfile.css';

const UserProfile = () => {
    const { user, login } = useAuth(); // login used to update context if needed
    const [profile, setProfile] = useState(null);
    const [allBadges, setAllBadges] = useState([]);
    const [userBadges, setUserBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Edit Form State
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        phoneNumber: '',
        targetExam: '',
        profilePicture: ''
    });

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [userRes, badgesRes, myBadgesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/users/${user.id}`),
                axios.get('${API_BASE_URL}/gamification/badges/all'),
                axios.get(`${API_BASE_URL}/gamification/badges/${user.id}`)
            ]);

            setProfile(userRes.data);
            setAllBadges(badgesRes.data);
            setUserBadges(myBadgesRes.data);

            setFormData({
                name: userRes.data.name || '',
                bio: userRes.data.bio || '',
                phoneNumber: userRes.data.phoneNumber || '',
                targetExam: userRes.data.targetExam || '',
                profilePicture: userRes.data.profilePicture || ''
            });

            // Trigger badge check logic just in case
            axios.post(`${API_BASE_URL}/gamification/check/${user.id}`);

        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            const response = await axios.put(`${API_BASE_URL}/users/${user.id}`, formData);
            setProfile(response.data);
            setIsEditing(false);
            // Optionally update AuthContext user if name changed
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    if (loading) return <div className="loading-spinner">Loading Profile...</div>;
    if (!profile) return <div>Profile not found</div>;

    // Helper to check if badge is earned
    const isBadgeEarned = (badgeId) => {
        return userBadges.some(ub => ub.badge.id === badgeId);
    };

    return (
        <div className="profile-container">
            {/* Header / Info Card */}
            <div className="profile-header-card">
                {profile.profilePicture ? (
                    <img src={profile.profilePicture} alt="Profile" className="profile-avatar" />
                ) : (
                    <div className="profile-avatar-placeholder">
                        {profile.name.charAt(0).toUpperCase()}
                    </div>
                )}

                <div className="profile-info">
                    {!isEditing ? (
                        <>
                            <h1 className="profile-name">{profile.name}</h1>
                            <div className="profile-email">{profile.email}</div>

                            <div className="profile-details">
                                {profile.targetExam && (
                                    <div className="detail-item">
                                        <span>🎯</span> {profile.targetExam}
                                    </div>
                                )}
                                {profile.phoneNumber && (
                                    <div className="detail-item">
                                        <span>📱</span> {profile.phoneNumber}
                                    </div>
                                )}
                            </div>

                            {profile.bio && (
                                <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>"{profile.bio}"</p>
                            )}
                        </>
                    ) : (
                        <div className="edit-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled // Name change might require Auth update, keep simple for now
                                />
                            </div>
                            <div className="form-group">
                                <label>Target Exam</label>
                                <select
                                    value={formData.targetExam}
                                    onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                                >
                                    <option value="">Select Exam</option>
                                    <option value="SSC CGL">SSC CGL</option>
                                    <option value="Banking">Banking</option>
                                    <option value="UPSC">UPSC</option>
                                    <option value="GATE">GATE</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Profile Picture URL</label>
                                <input
                                    value={formData.profilePicture}
                                    onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div className="form-actions">
                                <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                                <button className="save-btn" onClick={handleSaveProfile}>Save Changes</button>
                            </div>
                        </div>
                    )}
                </div>

                {!isEditing && (
                    <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                        Edit Profile ✎
                    </button>
                )}
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card" style={{ borderLeft: '5px solid #ff9800' }}>
                    <div className="stat-icon" style={{ background: '#fff3e0', color: '#ff9800' }}>🔥</div>
                    <div className="stat-content">
                        <h3>{profile.currentStreak || 0} Days</h3>
                        <p>Current Streak</p>
                    </div>
                </div>

                <div className="stat-card" style={{ borderLeft: '5px solid #4CAF50' }}>
                    <div className="stat-icon" style={{ background: '#e8f5e9', color: '#4CAF50' }}>💎</div>
                    <div className="stat-content">
                        <h3>{userBadges.length}</h3>
                        <p>Badges Earned</p>
                    </div>
                </div>

                <div className="stat-card" style={{ borderLeft: '5px solid #2196f3' }}>
                    <div className="stat-icon" style={{ background: '#e3f2fd', color: '#2196f3' }}>⚡</div>
                    <div className="stat-content">
                        <h3>{profile.longestStreak || 0} Days</h3>
                        <p>Longest Streak</p>
                    </div>
                </div>
            </div>

            {/* Badges Section */}
            <div className="badges-section">
                <div className="badges-header">
                    <h2>🏆 My Achievements</h2>
                    <p>Unlock badges by consistent learning and high scores</p>
                </div>

                <div className="badges-grid">
                    {allBadges.map(badge => {
                        const earned = isBadgeEarned(badge.id);
                        return (
                            <div key={badge.id} className={`badge-item ${earned ? 'earned' : 'locked'}`}>
                                <div className="badge-icon">
                                    {earned ? badge.icon : '🔒'}
                                </div>
                                <div className="badge-name">{badge.name}</div>
                                <div className="badge-desc">{badge.description}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
