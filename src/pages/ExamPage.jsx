import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examAPI, testSeriesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ExamPage.css';

const ExamPage = () => {
    const { examId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [examAttempt, setExamAttempt] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchExamData();
    }, [examId]);

    const fetchExamData = async () => {
        try {
            // Get exam attempt details
            const historyResponse = await examAPI.getHistory(user.id);
            const attempt = historyResponse.data.find(a => a.id === parseInt(examId));

            if (!attempt) {
                alert('Exam not found');
                navigate('/test-series');
                return;
            }

            setExamAttempt(attempt);

            // Get questions for this test series
            const questionsResponse = await testSeriesAPI.getQuestions(attempt.testSeries.id);
            setQuestions(questionsResponse.data);
        } catch (err) {
            alert('Failed to load exam');
            navigate('/test-series');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (questionId, answer) => {
        setAnswers({ ...answers, [questionId]: answer });
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

    const handleSubmit = async () => {
        const unanswered = questions.filter(q => !answers[q.id]);

        if (unanswered.length > 0) {
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
                    selectedAnswer: answers[q.id] || ''
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
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
        <div className="exam-page">
            <div className="exam-header">
                <div className="container">
                    <div className="exam-info">
                        <h2>{examAttempt?.testSeries?.title}</h2>
                        <div className="exam-meta">
                            <span>Question {currentQuestion + 1} of {questions.length}</span>
                            <span>•</span>
                            <span>{examAttempt?.testSeries?.totalMarks} Total Marks</span>
                        </div>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="exam-content">
                <div className="container">
                    <div className="question-card fade-in">
                        <div className="question-header">
                            <span className="question-number">Question {currentQuestion + 1}</span>
                            <span className="question-marks">{question.marks} marks</span>
                        </div>

                        <h3 className="question-text">{question.questionText}</h3>

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

                    <div className="exam-navigation">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                            className="btn btn-secondary"
                        >
                            ← Previous
                        </button>

                        <div className="question-indicators">
                            {questions.map((q, index) => (
                                <button
                                    key={q.id}
                                    className={`indicator ${index === currentQuestion ? 'active' : ''} ${answers[q.id] ? 'answered' : ''}`}
                                    onClick={() => setCurrentQuestion(index)}
                                    title={`Question ${index + 1}`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                        {currentQuestion === questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="btn btn-success"
                            >
                                {submitting ? 'Submitting...' : 'Submit Exam'}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="btn btn-primary"
                            >
                                Next →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamPage;
