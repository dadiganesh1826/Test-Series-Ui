import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResultPage.css'; // Reuse existing styles

const PracticeResultPage = () => {
    const { attemptId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [attempt, setAttempt] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false);

    // Questions passed from PracticeMode (since we don't store session question list in DB for custom practice)
    const questions = location.state?.questions || [];

    useEffect(() => {
        fetchData();
    }, [attemptId]);

    const fetchData = async () => {
        try {
            const [attemptRes, answersRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/practice/${attemptId}?userId=${JSON.parse(localStorage.getItem('user')).id}`),
                axios.get(`${API_BASE_URL}/practice/${attemptId}/answers`)
            ]);

            setAttempt(attemptRes.data);
            setAnswers(answersRes.data);
        } catch (error) {
            console.error('Error fetching practice result:', error);
            alert('Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    const getQuestionResult = (questionId) => {
        return answers.find(a => a.question.id === questionId);
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
    if (!attempt) return <div className="error-message">Result not found</div>;

    // derived stats
    const totalQuestions = questions.length || attempt.totalQuestions;
    const score = attempt.correctAnswers * 1; // Assuming 1 mark per question for practice
    const percentage = (attempt.correctAnswers / totalQuestions) * 100;
    const isPassed = percentage >= 40; // Arbitrary pass mark

    return (
        <div className="result-page">
            <div className="container">
                <div className="result-header fade-in">
                    <div className={`result-icon ${isPassed ? 'success' : 'fail'}`}>
                        {isPassed ? '🎉' : '💪'}
                    </div>
                    <h1>{isPassed ? 'Well Done!' : 'Keep Practicing!'}</h1>
                    <p className="test-title">Practice Session Summary</p>
                </div>

                <div className="result-summary fade-in">
                    <div className="summary-card main-score">
                        <div className="score-text" style={{ textAlign: 'center', padding: '2rem' }}>
                            <div className="score-value" style={{ fontSize: '3rem', fontWeight: 'bold', color: '#667eea' }}>
                                {percentage.toFixed(0)}%
                            </div>
                            <div className="score-label">Accuracy</div>
                        </div>
                        <div className="score-details">
                            <div className="score-item">
                                <span className="label">Score</span>
                                <span className="value">{attempt.correctAnswers} / {totalQuestions}</span>
                            </div>
                            <div className="score-item">
                                <span className="label">Time Spent</span>
                                <span className="value">{(attempt.limitSeconds && attempt.completedAt) ? 'Completed' : 'Finished'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card correct">
                            <div className="stat-icon">✓</div>
                            <div className="stat-value">{attempt.correctAnswers}</div>
                            <div className="stat-label">Correct</div>
                        </div>
                        <div className="stat-card incorrect">
                            <div className="stat-icon">✗</div>
                            <div className="stat-value">{attempt.questionsAttempted - attempt.correctAnswers}</div>
                            <div className="stat-label">Incorrect</div>
                        </div>
                        <div className="stat-card unanswered">
                            <div className="stat-icon">−</div>
                            <div className="stat-value">{totalQuestions - attempt.questionsAttempted}</div>
                            <div className="stat-label">Unanswered</div>
                        </div>
                    </div>
                </div>

                <div className="result-actions">
                    <button onClick={() => setShowDetails(!showDetails)} className="btn btn-primary">
                        {showDetails ? 'Hide' : 'Show'} Detailed Analysis
                    </button>
                    <button onClick={() => navigate('/practice/topic')} className="btn btn-secondary">
                        New Practice
                    </button>
                </div>

                {showDetails && (
                    <div className="detailed-results fade-in">
                        {questions.length > 0 ? (
                            questions.map((question, index) => {
                                const answer = getQuestionResult(question.id);
                                const localResult = location.state?.sessionResults?.[question.id];
                                const isCorrect = answer?.isCorrect || localResult?.isCorrect;
                                const isSkipped = !answer && !localResult;
                                const isWrong = (answer || localResult) && !isCorrect;
                                const timeSpent = localResult?.timeSpent || answer?.timeSpent || 0;

                                return (
                                    <div key={question.id} className={`question-result ${isCorrect ? 'correct' : isWrong ? 'incorrect' : 'unanswered'}`}>
                                        <div className="question-result-header">
                                            <span className="question-num">Question {index + 1}</span>
                                            <div className="result-meta">
                                                <span className="time-badge" style={{ background: '#e2e8f0', color: '#4a5568', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{ fontSize: '1rem' }}>⏱</span> {timeSpent}s
                                                </span>
                                                <span className={`result-indicator ${isCorrect ? 'correct' : isWrong ? 'incorrect' : 'unanswered'}`}>
                                                    {isCorrect ? 'Correct' : isWrong ? 'Incorrect' : 'Unanswered'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="question-text-result">{question.questionText}</div>

                                        <div className="answers-grid">
                                            {['A', 'B', 'C', 'D'].map(optKey => {
                                                const optVal = question[`option${optKey}`];
                                                const isOptSelected = (answer?.selectedAnswer || localResult?.userAnswer) === optKey;
                                                const isOptCorrect = question.correctAnswer === optKey;

                                                let className = 'answer-option';
                                                if (isOptCorrect) className += ' correct-answer';
                                                else if (isOptSelected) className += ' wrong-answer selected';

                                                return (
                                                    <div key={optKey} className={className}>
                                                        <span className="option-letter">{optKey}</span>
                                                        <span className="option-content">{optVal}</span>
                                                        {isOptCorrect && <span className="correct-mark">✓</span>}
                                                        {isOptSelected && !isOptCorrect && <span className="wrong-mark">✗</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="explanation" style={{ marginTop: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '6px', borderLeft: '4px solid #667eea' }}>
                                            <strong style={{ display: 'block', marginBottom: '5px', color: '#2d3748' }}>Explanation:</strong>
                                            <p style={{ margin: 0, color: '#4a5568' }}>{question.explanation || (localResult?.explanation) || "No explanation provided."}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="warning-box" style={{ padding: '20px', textAlign: 'center', background: '#fff3cd', color: '#856404', borderRadius: '8px' }}>
                                Detailed question analysis is unavailable for this session (page refreshed).
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PracticeResultPage;
