import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BookmarkButton from '../components/BookmarkButton';
import NoteEditor from '../components/NoteEditor';
import './PracticeMode.css';

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

    useEffect(() => {
        // Check if custom practice was passed via state
        if (testId === 'custom' && location.state) {
            initCustomPractice();
        } else {
            startPractice();
        }
    }, [testId, location.state]);

    const initCustomPractice = () => {
        const { attempt, questions, title } = location.state;
        if (attempt && questions) {
            setPracticeAttemptId(attempt.id);
            setQuestions(questions);
            setTestSeries({ title: title || 'Custom Practice Session' });
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
            const testRes = await axios.get(`http://localhost:8080/api/test-series/${testId}`);
            setTestSeries(testRes.data);

            // Get questions
            const questionsRes = await axios.get(`http://localhost:8080/api/test-series/${testId}/questions`);
            setQuestions(questionsRes.data);

            // Start practice attempt
            const practiceRes = await axios.post(
                `http://localhost:8080/api/practice/start/${testId}?userId=${user.id}`
            );
            setPracticeAttemptId(practiceRes.data.id);

        } catch (error) {
            console.error('Error starting practice:', error);
            alert('Failed to start practice mode');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (answer) => {
        if (feedback) return; // Already answered
        setSelectedAnswer(answer);
    };

    const handleSubmitAnswer = async () => {
        if (!selectedAnswer) {
            alert('Please select an answer');
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:8080/api/practice/${practiceAttemptId}/answer`,
                {
                    questionId: questions[currentQuestionIndex].id,
                    selectedAnswer: selectedAnswer,
                    timeSpent: 0
                }
            );

            setFeedback(response.data);
            setAnsweredQuestions(new Set([...answeredQuestions, currentQuestionIndex]));

            // Update stats
            setStats(prev => ({
                attempted: prev.attempted + 1,
                correct: prev.correct + (response.data.isCorrect ? 1 : 0),
                accuracy: ((prev.correct + (response.data.isCorrect ? 1 : 0)) / (prev.attempted + 1) * 100).toFixed(1)
            }));

        } catch (error) {
            console.error('Error submitting answer:', error);
            alert('Failed to submit answer');
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setFeedback(null);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setSelectedAnswer(null);
            setFeedback(null);
        }
    };

    const handleEndPractice = async () => {
        if (window.confirm('Are you sure you want to end practice?')) {
            try {
                if (practiceAttemptId) {
                    await axios.post(`http://localhost:8080/api/practice/${practiceAttemptId}/complete`);
                }
                // Navigate regardless of API success
                navigate('/dashboard');
            } catch (error) {
                console.error('Error ending practice:', error);
                // Still navigate even if API fails
                alert('Practice session ended. Redirecting to dashboard...');
                navigate('/dashboard');
            }
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
                        const isCorrect = feedback && feedback.correctAnswer === option;
                        const isWrong = feedback && selectedAnswer === option && !feedback.isCorrect;

                        return (
                            <div
                                key={option}
                                className={`option ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                                onClick={() => handleAnswerSelect(option)}
                            >
                                <div className="option-label">{option}</div>
                                <div className="option-text">{optionText}</div>
                                {isCorrect && <span className="option-icon">✓</span>}
                                {isWrong && <span className="option-icon">✗</span>}
                            </div>
                        );
                    })}
                </div>

                {/* Feedback Section */}
                {feedback && (
                    <div className={`feedback-section ${feedback.isCorrect ? 'correct-feedback' : 'wrong-feedback'}`}>
                        <div className="feedback-header">
                            {feedback.isCorrect ? (
                                <>
                                    <span className="feedback-icon">🎉</span>
                                    <h3>Correct!</h3>
                                </>
                            ) : (
                                <>
                                    <span className="feedback-icon">💡</span>
                                    <h3>Incorrect</h3>
                                </>
                            )}
                        </div>
                        <div className="feedback-body">
                            <p><strong>Correct Answer:</strong> {feedback.correctAnswer}</p>
                            {feedback.explanation && (
                                <div className="explanation">
                                    <strong>Explanation:</strong>
                                    <p>{feedback.explanation}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Note Editor */}
                <NoteEditor questionId={currentQuestion.id} />

                {/* Action Buttons */}
                <div className="action-buttons">
                    {!feedback ? (
                        <button className="submit-btn" onClick={handleSubmitAnswer}>
                            Submit Answer
                        </button>
                    ) : (
                        <button className="next-btn" onClick={handleNext}>
                            {currentQuestionIndex < questions.length - 1 ? 'Next Question →' : 'Review'}
                        </button>
                    )}
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
                                setFeedback(null);
                            }}
                        >
                            {index + 1}
                        </div>
                    ))}
                </div>

                <button className="end-btn" onClick={handleEndPractice}>
                    End Practice
                </button>
            </div>
        </div>
    );
};

export default PracticeMode;
