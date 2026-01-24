import React, { useState, useEffect } from 'react';
import './ExamTimer.css';

const ExamTimer = ({ durationMinutes, startTime, onTimeExpired }) => {
    const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60);
    const [isWarning, setIsWarning] = useState(false);
    const [isCritical, setIsCritical] = useState(false);

    const expiredRef = React.useRef(false);

    useEffect(() => {
        if (!startTime) return;

        const calculateTimeRemaining = () => {
            const now = new Date();
            // Fix: If timestamp doesn't have timezone info, assume UTC (common in Spring Boot + Cloud)
            const timeString = startTime.endsWith('Z') || startTime.includes('+') ? startTime : startTime + 'Z';
            const start = new Date(timeString);
            const elapsedSeconds = Math.floor((now - start) / 1000);
            const totalSeconds = durationMinutes * 60;
            const remaining = Math.max(0, totalSeconds - elapsedSeconds);

            setTimeRemaining(remaining);

            // Set warning states
            if (remaining <= 300 && remaining > 60) {
                setIsWarning(true);
                setIsCritical(false);
            } else if (remaining <= 60 && remaining > 0) {
                setIsWarning(false);
                setIsCritical(true);
            } else {
                setIsWarning(false);
                setIsCritical(false);
            }

            // Time expired
            if (remaining === 0) {
                if (!expiredRef.current && onTimeExpired) {
                    expiredRef.current = true;
                    onTimeExpired();
                }
            } else {
                // Reset ref if time was extended somehow (rare but safe)
                expiredRef.current = false;
            }
        };

        // Calculate immediately
        calculateTimeRemaining();

        // Update every second
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [startTime, durationMinutes, onTimeExpired]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    };

    const getTimerClass = () => {
        if (isCritical) return 'timer-critical';
        if (isWarning) return 'timer-warning';
        return 'timer-normal';
    };

    return (
        <div className={`exam-timer ${getTimerClass()}`}>
            <div className="timer-icon">⏱️</div>
            <div className="timer-content">
                <div className="timer-label">Time Remaining</div>
                <div className="timer-value">{formatTime(timeRemaining)}</div>
            </div>
            {isCritical && (
                <div className="timer-alert">
                    ⚠️ Less than 1 minute!
                </div>
            )}
        </div>
    );
};

export default ExamTimer;
