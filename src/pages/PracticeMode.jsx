import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api'
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config/api'
import axios from 'axios';
import API_BASE_URL from '../config/api'
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api'
import BookmarkButton from '../components/BookmarkButton';
import API_BASE_URL from '../config/api'
import NoteEditor from '../components/NoteEditor';
import API_BASE_URL from '../config/api'
import './PracticeMode.css';
import API_BASE_URL from '../config/api'

const PracticeMode = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [testSeries, setTestSeries] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [practiceAttemptId, setPracticeAttemptId] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        attempted: 0,
        correct: 0,
        accuracy: 0
    });
    const [timeLeft, setTimeLeft] = useState(null);

    const formatTime = (seconds) => {
        if (!seconds && seconds !== 0) return "--:--";
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    useEffect(() => {
        // Check if custom practice was passed via state
        if (testId === 'custom' && location.state) {
            initCustomPractice();
        } else {
            startPractice();
        }
    }, [testId, location.state]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);


    const initCustomPractice = () => {
        const { attempt, questions, title } = location.state;
        if (attempt && questions) {
            setPracticeAttemptId(attempt.id);
            setQuestions(questions);
            setTestSeries({ title: title || 'Custom Practice Session' });
            if (attempt.limitSeconds) {
                setTimeLeft(attempt.limitSeconds);
            }
            setLoading(false);
        } else {
            // Fallback
            navigate('/dashboard');
        }
    };

    const startPractice = async () => {
        if (!testId || testId === 'custom') return;

        try {
            setLoading(true);

            // Get test series details
            const testRes = await axios.get(`${API_BASE_URL}/test-series/${testId}`);
            setTestSeries(testRes.data);

            // Get questions
            const questionsRes = await axios.get(`${API_BASE_URL}/test-series/${testId}/questions`);
            setQuestions(questionsRes.data);

            // Start practice attempt
            const practiceRes = await axios.post(
                `${import.meta.env.VITE_API_URL || '${API_BASE_URL}'}/practice/start/${testId}?userId=${user.id}`
            );
            setPracticeAttemptId(practiceRes.data.id);
            if (practiceRes.data.limitSeconds) {
                setTimeLeft(practiceRes.data.limitSeconds);
            }

        } catch (error) {
            console.error('Error starting practice:', error);
            alert('Failed to start practice mode');
        } finally {
            setLoading(false);
        }
    };

    const [startTime, setStartTime] = useState(Date.now());
    const [sessionResults, setSessionResults] = useState({});
    const [timeSpentMap, setTimeSpentMap] = useState({}); // Stores accumulated time for each question

    // Track time when question changes
    useEffect(() => {
        const now = Date.now();
        const prevIndex = currentQuestionIndex; // Capture current index for cleanup closure

        setStartTime(now);

        return () => {
            // On unmount/change, save the time spent on this question
            const elapsed = Math.round((Date.now() - now) / 1000);
            setTimeSpentMap(prev => ({
                ...prev,
                [questions[prevIndex]?.id]: (prev[questions[prevIndex]?.id] || 0) + elapsed
            }));
        };
    }, [currentQuestionIndex, questions]);

    const handleAnswerSelect = (answer) => {
        setSelectedAnswer(answer);
    };

    const handleSubmitAnswer = async () => {
        if (!selectedAnswer) {
            alert('Please select an answer');
            return;
        }

        const currentSessionTime = Math.round((Date.now() - startTime) / 1000);
        const totalTimeSpent = Math.max(1, (timeSpentMap[questions[currentQuestionIndex].id] || 0) + currentSessionTime);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/practice/${practiceAttemptId}/answer`,
                {
                    questionId: questions[currentQuestionIndex].id,
                    selectedAnswer: selectedAnswer,
                    timeSpent: totalTimeSpent
                }
            );

            // Store result for final report
            setSessionResults(prev => ({
                ...prev,
                [questions[currentQuestionIndex].id]: {
                    ...response.data,
                    timeSpent: totalTimeSpent, // Store accumulated time
                    userAnswer: selectedAnswer
                }
            }));

            setAnsweredQuestions(new Set([...answeredQuestions, currentQuestionIndex]));

            // Update stats
            setStats(prev => ({
                attempted: prev.attempted + 1,
                correct: prev.correct + (response.data.isCorrect ? 1 : 0),
                accuracy: ((prev.correct + (response.data.isCorrect ? 1 : 0)) / (prev.attempted + 1) * 100).toFixed(1)
            }));

            // Auto-advance or Finish
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedAnswer(null);
            } else {
                // Last question - finish practice
                handleEndPractice(true);
            }

        } catch (error) {
            console.error('Error submitting answer:', error);
            alert('Failed to submit answer');
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setSelectedAnswer(null);
        }
    };

    const onEndClick = () => handleEndPractice(false);

    // Pass sessionResults to handleEndPractice
    const handleTimeUp = () => {
        handleEndPractice(true);
    };

    // Modified handleEndPractice to include rich results
    const handleEndPractice = async (force = false) => {
        if (!force && !window.confirm('Are you sure you want to end the practice session?')) {
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/practice/${practiceAttemptId}/complete`);

            // Navigate with rich data
            navigate(`/practice/result/${practiceAttemptId}`, {
                state: {
                    questions: questions,
                    sessionResults: sessionResults
                }
            });
        } catch (error) {
            console.error('Error completing practice:', error);
            navigate('/dashboard');
        }
    };

    if (loading) {
        return (
            <div className="practice-mode">
                <div className="loading">Loading practice mode...</div>
            </div>
        );
    }

    if (!questions.length) {
        return (
            <div className="practice-mode">
                <div className="no-questions">No questions available</div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="practice-mode">
            {/* Header */}
            <div className="practice-header">
                <div className="header-left">
                    <h1>🎯 Practice Mode</h1>
                    <p>{testSeries?.title}</p>
                </div>
                <div className="header-stats">
                    <div className="stat-badge" style={{
                        minWidth: '100px',
                        justifyContent: 'center',
                        backgroundColor: timeLeft < 60 ? '#fff2f4' : undefined,
                        borderColor: timeLeft < 60 ? '#f6465d' : undefined
                    }}>
                        <span className="stat-label">Time Left</span>
                        <span className="stat-value" style={{ color: timeLeft < 60 ? '#f6465d' : 'inherit' }}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <div className="stat-badge">
                        <span className="stat-label">Progress</span>
                        <span className="stat-value">{currentQuestionIndex + 1}/{questions.length}</span>
                    </div>
                    <div className="stat-badge">
                        <span className="stat-label">Accuracy</span>
                        <span className="stat-value">{stats.accuracy}%</span>
                    </div>
                    <div className="stat-badge">
                        <span className="stat-label">Correct</span>
                        <span className="stat-value">{stats.correct}/{stats.attempted}</span>
                    </div>
                </div>
            </div>

            {/* Question Card */}
            <div className="question-container">
                <div className="question-header">
                    <div className="question-meta">
                        <span className="question-number">Question {currentQuestionIndex + 1}</span>
                        <span className="question-marks">{currentQuestion.marks} marks</span>
                    </div>
                    <div className="question-actions">
                        <BookmarkButton questionId={currentQuestion.id} />
                    </div>
                </div>

                <div className="question-text">{currentQuestion.questionText}</div>

                <div className="options-container">
                    {['A', 'B', 'C', 'D'].map(option => {
                        const optionText = currentQuestion[`option${option}`];
                        const isSelected = selectedAnswer === option;

                        return (
                            <div
                                key={option}
                                className={`option ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleAnswerSelect(option)}
                            >
                                <div className="option-label">{option}</div>
                                <div className="option-text">{optionText}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Note Editor */}
                <NoteEditor questionId={currentQuestion.id} />

                {/* Action Buttons */}
                <div className="action-buttons">
                    <button className="submit-btn" onClick={handleSubmitAnswer}>
                        {currentQuestionIndex === questions.length - 1 ? 'Finish Practice' : 'Save & Next'}
                    </button>
                </div>
            </div>

            {/* Navigation Footer */}
            <div className="practice-footer">
                <button
                    className="nav-btn"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                >
                    ← Previous
                </button>

                <div className="question-palette">
                    {questions.map((_, index) => (
                        <div
                            key={index}
                            className={`palette-item ${index === currentQuestionIndex ? 'active' : ''} ${answeredQuestions.has(index) ? 'answered' : ''}`}
                            onClick={() => {
                                setCurrentQuestionIndex(index);
                                setSelectedAnswer(null);
                            }}
                        >
                            {index + 1}
                        </div>
                    ))}
                </div>

                <button className="end-btn" onClick={onEndClick}>
                    End Practice
                </button>
            </div>
        </div>
    );
};

export default PracticeMode;
