import React, { useState } from 'react';
import './QuestionPalette.css';

const QuestionPalette = ({
    questions,
    currentQuestion,
    answers,
    markedForReview,
    onQuestionSelect,
    onSubmit
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const getQuestionStatus = (index) => {
        const questionId = questions[index]?.id;

        if (markedForReview && markedForReview[questionId]) {
            return 'marked';
        }
        if (answers && answers[questionId]) {
            return 'answered';
        }
        if (index < currentQuestion) {
            return 'not-answered';
        }
        return 'not-visited';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'answered':
                return '#10b981'; // green
            case 'not-answered':
                return '#ef4444'; // red
            case 'marked':
                return '#f59e0b'; // orange
            case 'not-visited':
                return '#6b7280'; // gray
            default:
                return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'answered':
                return '✓';
            case 'not-answered':
                return '✗';
            case 'marked':
                return '⚠';
            case 'not-visited':
                return '';
            default:
                return '';
        }
    };

    const getStatusCounts = () => {
        const counts = {
            answered: 0,
            'not-answered': 0,
            marked: 0,
            'not-visited': 0
        };

        questions.forEach((_, index) => {
            const status = getQuestionStatus(index);
            counts[status]++;
        });

        return counts;
    };

    const counts = getStatusCounts();

    if (isCollapsed) {
        return (
            <div className="question-palette collapsed">
                <button
                    className="palette-toggle"
                    onClick={() => setIsCollapsed(false)}
                >
                    <span>📋</span>
                    <span>Show Palette</span>
                </button>
            </div>
        );
    }

    return (
        <div className="question-palette">
            <div className="palette-header">
                <h3>Question Palette</h3>
                <button
                    className="palette-toggle"
                    onClick={() => setIsCollapsed(true)}
                >
                    ▼
                </button>
            </div>

            <div className="palette-grid">
                {questions.map((question, index) => {
                    const status = getQuestionStatus(index);
                    const isActive = index === currentQuestion;

                    return (
                        <button
                            key={question.id}
                            className={`palette-question ${status} ${isActive ? 'active' : ''}`}
                            onClick={() => onQuestionSelect(index)}

                        >
                            <span className="question-number">{index + 1}</span>
                            <span className="question-icon">{getStatusIcon(status)}</span>
                        </button>
                    );
                })}
            </div>

            <div className="palette-legend">
                <h4>Legend</h4>
                <div className="legend-items">
                    <div className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
                        <span>Answered ({counts.answered})</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
                        <span>Not Answered ({counts['not-answered']})</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
                        <span>Marked ({counts.marked})</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: '#6b7280' }}></span>
                        <span>Not Visited ({counts['not-visited']})</span>
                    </div>
                </div>
            </div>

            <div className="palette-summary">
                <div className="summary-row">
                    <span>Total Questions:</span>
                    <strong>{questions.length}</strong>
                </div>
                <div className="summary-row">
                    <span>Answered:</span>
                    <strong style={{ color: '#10b981' }}>{counts.answered}</strong>
                </div>
                <div className="summary-row">
                    <span>Remaining:</span>
                    <strong style={{ color: '#ef4444' }}>
                        {questions.length - counts.answered}
                    </strong>
                </div>
            </div>

            <button className="submit-exam-btn" onClick={onSubmit}>
                Submit Exam
            </button>
        </div>
    );
};

export default QuestionPalette;
