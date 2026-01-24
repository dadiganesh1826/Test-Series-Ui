import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api'
import axios from 'axios';
import API_BASE_URL from '../config/api'
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api'
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api'
import './TopicPractice.css';
import API_BASE_URL from '../config/api'

const TopicPractice = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // Config State
    const [difficulty, setDifficulty] = useState('Medium');
    const [questionCount, setQuestionCount] = useState(10);

    useEffect(() => {
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        try {
            // Need endpoints to fetch subjects/topics separately or nested
            // Assuming we have such endpoints or can fetch from somewhere.
            // If strictly following previous backend, we only had basic entities.
            // Let's assume we can fetch categories/subjects.
            // Since we implemented AdminCategories, we likely have these APIs.

            // For now, I'll mock the structure if API fails, but let's try to fetch
            const subsRes = await axios.get('${API_BASE_URL}/subjects'); // Assuming this exists based on Entity creation
            setSubjects(subsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching subjects', error);
            // Fallback mock data for demo if API not ready
            // setSubjects(mockSubjects);
            setLoading(false);
        }
    };

    const handleStartPractice = async () => {
        if (!selectedTopic) return;

        setCreating(true);
        try {
            const payload = {
                userId: user.id,
                subjectId: selectedSubject.id,
                topicId: selectedTopic.id,
                difficulty: difficulty,
                questionCount: questionCount
            };

            const response = await axios.post('${API_BASE_URL}/practice/custom', payload);
            const { attempt, questions } = response.data;

            if (questions.length === 0) {
                alert('No questions found for these criteria. Try adjusting difficulty or count.');
                setCreating(false);
                return;
            }

            // Navigate to Practice Mode with state
            navigate('/practice/custom', {
                state: {
                    attempt: attempt,
                    questions: questions,
                    title: `Practice: ${selectedTopic.name}`
                }
            });

        } catch (error) {
            console.error('Error starting practice:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to start practice session';
            alert(`Error: ${errorMessage}. (Check backend logs if this persists)`);
            setCreating(false);
        }
    };

    if (loading) return <div className="loading-spinner">Loading topics...</div>;

    return (
        <div className="topic-practice-container">
            {/* Sidebar */}
            <div className="subjects-sidebar">
                <h2 className="sidebar-title">Select Topic</h2>
                {subjects.length === 0 ? (
                    <div className="empty-state">No subjects available</div>
                ) : (
                    subjects.map(subject => (
                        <div key={subject.id} className="subject-item">
                            <div
                                className="subject-header"
                                onClick={() => setSelectedSubject(subject === selectedSubject ? null : subject)}
                            >
                                {subject.name}
                                <span>{selectedSubject === subject ? '▼' : '▶'}</span>
                            </div>

                            {selectedSubject === subject && subject.topics && (
                                <div className="topics-list">
                                    {subject.topics.map(topic => (
                                        <div
                                            key={topic.id}
                                            className={`topic-item ${selectedTopic === topic ? 'active' : ''}`}
                                            onClick={() => setSelectedTopic(topic)}
                                        >
                                            {topic.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Config Area */}
            <div className="practice-config">
                {selectedTopic ? (
                    <div className="config-card">
                        <div className="config-header">
                            <h1>{selectedTopic.name}</h1>
                            <p>{selectedSubject.name} • Custom Practice</p>
                        </div>

                        <div className="config-section">
                            <label>Difficulty Level</label>
                            <div className="difficulty-options">
                                {['Easy', 'Medium', 'Hard'].map(level => (
                                    <div
                                        key={level}
                                        className={`option-btn ${difficulty === level ? 'selected' : ''}`}
                                        onClick={() => setDifficulty(level)}
                                    >
                                        {level}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="config-section">
                            <label>Number of Questions</label>
                            <div className="count-options">
                                {[5, 10, 20, 30].map(count => (
                                    <div
                                        key={count}
                                        className={`option-btn ${questionCount === count ? 'selected' : ''}`}
                                        onClick={() => setQuestionCount(count)}
                                    >
                                        {count}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            className="start-practice-btn"
                            onClick={handleStartPractice}
                            disabled={creating}
                        >
                            {creating ? 'Creating Session...' : 'Start Practice'}
                        </button>
                    </div>
                ) : (
                    <div className="empty-state">
                        <h2>Select a topic to start practicing</h2>
                        <p>Choose a subject from the sidebar to browse topics</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopicPractice;
