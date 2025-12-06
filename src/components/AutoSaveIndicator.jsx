import React from 'react';
import './AutoSaveIndicator.css';

const AutoSaveIndicator = ({ status, lastSaved }) => {
    const getStatusIcon = () => {
        switch (status) {
            case 'saving':
                return '💾';
            case 'saved':
                return '✓';
            case 'error':
                return '⚠️';
            default:
                return '';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'saving':
                return 'Saving...';
            case 'saved':
                return lastSaved ? `Saved at ${lastSaved}` : 'Saved';
            case 'error':
                return 'Save failed';
            default:
                return '';
        }
    };

    const getStatusClass = () => {
        switch (status) {
            case 'saving':
                return 'status-saving';
            case 'saved':
                return 'status-saved';
            case 'error':
                return 'status-error';
            default:
                return '';
        }
    };

    if (!status) return null;

    return (
        <div className={`auto-save-indicator ${getStatusClass()}`}>
            <span className="save-icon">{getStatusIcon()}</span>
            <span className="save-text">{getStatusText()}</span>
        </div>
    );
};

export default AutoSaveIndicator;
