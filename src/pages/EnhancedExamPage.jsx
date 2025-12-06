import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examAPI, testSeriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ExamTimer from '../components/ExamTimer';
import QuestionPalette from '../components/QuestionPalette';
import AutoSaveIndicator from '../components/AutoSaveIndicator';
import './EnhancedExamPage.css';

const EnhancedExamPage = () => {
    const { examId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [markedForReview, setMarkedForReview] = useState({});
    const [questionTimes, setQuestionTimes] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [examAttempt, setExamAttempt] = useState(null);
    const [autoSaveStatus, setAutoSaveStatus] = useState(null);
    const [lastSaved, setLastSaved] = useState(null);
    const [isPaletteOpen, setIsPaletteOpen] = useState(false); // Mobile toggle
    const navigate = useNavigate();
    const { user } = useAuth();
    const questionStartTime = useRef(Date.now());
    const autoSaveInterval = useRef(null);

    const fetchExamData = useCallback(async () => {
        try {
            const historyResponse = await examAPI.getHistory(user.id);
            const attempt = historyResponse.data.find(a => a.id === parseInt(examId));

            if (!attempt) {
                alert('Exam not found');
                navigate('/test-series');
                return;
            }

            setExamAttempt(attempt);

            const questionsResponse = await testSeriesAPI.getQuestions(attempt.testSeries.id);
            setQuestions(questionsResponse.data);
        } catch (err) {
            alert('Failed to load exam');
            navigate('/test-series');
        } finally {
            setLoading(false);
        }
    }, [examId, user.id, navigate]);

    useEffect(() => {
        fetchExamData();
        return () => {
            if (autoSaveInterval.current) {
                clearInterval(autoSaveInterval.current);
            }
        };
    }, [fetchExamData]);

    const autoSaveProgress = useCallback(async () => {
        if (!examAttempt || examAttempt.isCompleted) return;

        setAutoSaveStatus('saving');

        try {
            const currentQuestionId = questions[currentQuestion]?.id;
            // Update time for current question before saving
            const now = Date.now();
            const timeSpentSinceLoad = Math.floor((now - questionStartTime.current) / 1000);

            // Calculate current total time for this question
            const currentTotalTime = (questionTimes[currentQuestionId] || 0) + timeSpentSinceLoad;

            const updatedTimes = { ...questionTimes, [currentQuestionId]: currentTotalTime };

            const answersArray = Object.keys(answers).map(qId => ({
                questionId: parseInt(qId),
                selectedAnswer: answers[qId],
                markedForReview: markedForReview[qId] || false,
                timeSpentSeconds: updatedTimes[qId] || 0
            }));

            await examAPI.autoSave({
                examAttemptId: parseInt(examId),
                answers: answersArray,
                questionStatuses: []
            });

            const timeStr = new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            setAutoSaveStatus('saved');
            setLastSaved(timeStr);

            setTimeout(() => setAutoSaveStatus(null), 3000);
        } catch (err) {
            console.error('Auto-save failed:', err);
            setAutoSaveStatus('error');
            setTimeout(() => setAutoSaveStatus(null), 3000);
        }
    }, [examAttempt, answers, markedForReview, questionTimes, currentQuestion, questions, examId]);

    // Auto-save every 30 seconds
    useEffect(() => {
        if (examAttempt && !examAttempt.isCompleted) {
            autoSaveInterval.current = setInterval(() => {
                autoSaveProgress();
            }, 30000); // 30 seconds

            return () => {
                if (autoSaveInterval.current) {
                    clearInterval(autoSaveInterval.current);
                }
            };
        }
    }, [examAttempt, autoSaveProgress]);

    const handleAnswerSelect = (questionId, answer) => {
        setAnswers({ ...answers, [questionId]: answer });
        // Auto-save on answer change
        setTimeout(() => autoSaveProgress(), 1000);
    };

    const handleMarkForReview = () => {
        const questionId = questions[currentQuestion]?.id;
        setMarkedForReview(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };

    const handleClearResponse = () => {
        const questionId = questions[currentQuestion]?.id;
        const newAnswers = { ...answers };
        delete newAnswers[questionId];
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleQuestionSelect = (index) => {
        setCurrentQuestion(index);
    };

    const handleTimeExpired = () => {
        alert('Time expired! Submitting your exam automatically.');
        handleSubmit(true);
    };

    const handleSubmit = async (autoSubmit = false) => {
        const unanswered = questions.filter(q => !answers[q.id]);

        if (!autoSubmit && unanswered.length > 0) {
            const confirm = window.confirm(
                `You have ${unanswered.length} unanswered question(s). Do you want to submit anyway?`
            );
            if (!confirm) return;
        }

        setSubmitting(true);

        try {
            const submitData = {
                examAttemptId: parseInt(examId),
                answers: questions.map(q => ({
                    questionId: q.id,
                    selectedAnswer: answers[q.id] || '',
                    markedForReview: markedForReview[q.id] || false,
                    timeSpentSeconds: questionTimes[q.id] || 0
                }))
            };

            const response = await examAPI.submitExam(submitData);
            navigate(`/result/${response.data.examAttemptId}`);
        } catch (err) {
            alert('Failed to submit exam. Please try again.');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="container" style={{ padding: '40px 20px' }}>
                <div className="error-message">No questions found for this exam</div>
            </div>
        );
    }

    const question = questions[currentQuestion];

    return (
        <div className="exam-page enhanced">
            {/* Header */}
            <div className="exam-header">
                <div className="header-content">
                    <div className="exam-info">
                        <h2>{examAttempt?.testSeries?.title}</h2>
                    </div>

                    <div className="header-actions">
                        <AutoSaveIndicator
                            status={autoSaveStatus}
                            lastSaved={lastSaved}
                        />
                        {examAttempt?.startTime && (
                            <ExamTimer
                                durationMinutes={examAttempt.testSeries.durationMinutes}
                                startTime={examAttempt.startTime}
                                onTimeExpired={handleTimeExpired}
                            />
                        )}
                        <button
                            className="btn-mobile-palette"
                            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                            style={{
                                display: window.innerWidth <= 900 ? 'block' : 'none',
                                marginLeft: '10px',
                                padding: '6px 12px',
                                background: '#f0f0f0',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            {isPaletteOpen ? 'Hide Payload' : 'Show Palette'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="exam-content">

                {/* Left Column: Question Area + Footer */}
                <div className="question-section">
                    <div className="question-scroll-area">
                        <div className="question-card">
                            <div className="question-header">
                                <span className="question-number">Question {currentQuestion + 1}</span>
                                <span className="question-marks">+{question.marks} / -{question.negativeMarks || 0}</span>
                            </div>

                            <div className="question-text">{question.questionText}</div>

                            <div className="options-grid">
                                {['A', 'B', 'C', 'D'].map(option => (
                                    <button
                                        key={option}
                                        className={`option-button ${answers[question.id] === option ? 'selected' : ''}`}
                                        onClick={() => handleAnswerSelect(question.id, option)}
                                    >
                                        <span className="option-label">{option}</span>
                                        <span className="option-text">{question[`option${option}`]}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Navigation (Inside Left Column) */}
                    <div className="exam-footer">
                        <div className="question-actions">
                            <button
                                className={`mark-review-btn ${markedForReview[question.id] ? 'active' : ''}`}
                                onClick={handleMarkForReview}
                            >
                                {markedForReview[question.id] ? '★ Marked' : '☆ Mark for Review'}
                            </button>

                            <button
                                className="clear-btn"
                                onClick={handleClearResponse}
                            >
                                Clear Response
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={handlePrevious}
                                disabled={currentQuestion === 0}
                                className="nav-btn prev"
                            >
                                Previous
                            </button>

                            <button
                                onClick={currentQuestion < questions.length - 1 ? handleNext : () => handleSubmit(false)}
                                className={`nav-btn ${currentQuestion < questions.length - 1 ? 'next' : 'submit'}`}
                            >
                                {currentQuestion < questions.length - 1 ? 'Save & Next' : 'Submit Exam'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Palette */}
                <div
                    className={`palette-section ${isPaletteOpen ? 'open' : ''}`}
                    style={window.innerWidth <= 900 && !isPaletteOpen ? { display: 'none' } : {}}
                >
                    <QuestionPalette
                        questions={questions}
                        currentQuestion={currentQuestion}
                        answers={answers}
                        markedForReview={markedForReview}
                        onQuestionSelect={(idx) => {
                            handleQuestionSelect(idx);
                            setIsPaletteOpen(false);
                        }}
                        onSubmit={() => handleSubmit(false)}
                    />
                </div>
            </div>
        </div>
    );
};

export default EnhancedExamPage;
