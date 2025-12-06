import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ResultPage.css';

const ResultPage = () => {
    const { examId } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchResult();
    }, [examId]);

    const fetchResult = async () => {
        try {
            const response = await examAPI.getResult(examId, user.id);
            setResult(response.data);
        } catch (err) {
            alert('Failed to load result');
            navigate('/results');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!result) return null;

    const correctAnswers = result.questionResults.filter(q => q.isCorrect).length;
    const incorrectAnswers = result.questionResults.filter(q => !q.isCorrect && q.selectedAnswer).length;
    const unanswered = result.questionResults.filter(q => !q.selectedAnswer).length;

    return (
        <div className="result-page">
            <div className="container">
                <div className="result-header fade-in">
                    <div className={`result-icon ${result.isPassed ? 'success' : 'fail'}`}>
                        {result.isPassed ? '🎉' : '📊'}
                    </div>
                    <h1>{result.isPassed ? 'Congratulations!' : 'Test Completed'}</h1>
                    <p className="test-title">{result.testSeriesTitle}</p>
                </div>

                <div className="result-summary fade-in">
                    <div className="summary-card main-score">
                        <div className="score-circle">
                            <svg viewBox="0 0 200 200">
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="90"
                                    fill="none"
                                    stroke="var(--bg-tertiary)"
                                    strokeWidth="12"
                                />
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="90"
                                    fill="none"
                                    stroke="url(#gradient)"
                                    strokeWidth="12"
                                    strokeDasharray={`${(result.percentage / 100) * 565.48} 565.48`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 100 100)"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#667eea" />
                                        <stop offset="100%" stopColor="#764ba2" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="score-text">
                                <div className="score-value">{result.percentage.toFixed(1)}%</div>
                                <div className="score-label">Score</div>
                            </div>
                        </div>
                        <div className="score-details">
                            <div className="score-item">
                                <span className="label">Your Score</span>
                                <span className="value">{result.score} / {result.totalMarks}</span>
                            </div>
                            <div className={`result-badge ${result.isPassed ? 'passed' : 'failed'}`}>
                                {result.isPassed ? '✓ Passed' : '✗ Not Passed'}
                            </div>
                        </div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card correct">
                            <div className="stat-icon">✓</div>
                            <div className="stat-value">{correctAnswers}</div>
                            <div className="stat-label">Correct</div>
                        </div>
                        <div className="stat-card incorrect">
                            <div className="stat-icon">✗</div>
                            <div className="stat-value">{incorrectAnswers}</div>
                            <div className="stat-label">Incorrect</div>
                        </div>
                        <div className="stat-card unanswered">
                            <div className="stat-icon">−</div>
                            <div className="stat-value">{unanswered}</div>
                            <div className="stat-label">Unanswered</div>
                        </div>
                    </div>
                </div>

                <div className="result-actions">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="btn btn-primary"
                    >
                        {showDetails ? 'Hide' : 'Show'} Detailed Analysis
                    </button>
                    <button
                        onClick={() => navigate('/test-series')}
                        className="btn btn-secondary"
                    >
                        Take Another Test
                    </button>
                </div>

                {showDetails && (
                    <div className="detailed-results fade-in">
                        <h2>Question-wise Analysis</h2>
                        {result.questionResults.map((question, index) => (
                            <div
                                key={question.questionId}
                                className={`question-result ${question.isCorrect ? 'correct' : question.selectedAnswer ? 'incorrect' : 'unanswered'}`}
                            >
                                <div className="question-result-header">
                                    <span className="question-num">Question {index + 1}</span>
                                    <span className={`result-indicator ${question.isCorrect ? 'correct' : question.selectedAnswer ? 'incorrect' : 'unanswered'}`}>
                                        {question.isCorrect ? '✓ Correct' : question.selectedAnswer ? '✗ Incorrect' : '− Unanswered'}
                                    </span>
                                    <span className="marks">{question.marksObtained} / {question.marksObtained + (question.isCorrect ? 0 : 5)} marks</span>
                                </div>

                                <p className="question-text-result">{question.questionText}</p>

                                <div className="answers-grid">
                                    {['A', 'B', 'C', 'D'].map(option => {
                                        const isCorrect = question.correctAnswer === option;
                                        const isSelected = question.selectedAnswer === option;

                                        return (
                                            <div
                                                key={option}
                                                className={`answer-option ${isCorrect ? 'correct-answer' : ''} ${isSelected && !isCorrect ? 'wrong-answer' : ''} ${isSelected ? 'selected' : ''}`}
                                            >
                                                <span className="option-letter">{option}</span>
                                                <span className="option-content">{question[`option${option}`]}</span>
                                                {isCorrect && <span className="correct-mark">✓</span>}
                                                {isSelected && !isCorrect && <span className="wrong-mark">✗</span>}
                                            </div>
                                        );
                                    })}
                                </div>

                                {question.explanation && (
                                    <div className="explanation">
                                        <strong>Explanation:</strong> {question.explanation}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultPage;
