import React, { useState } from 'react';
import API_BASE_URL from '../config/api';
import axios from 'axios';
import './DownloadReportButton.css';

const DownloadReportButton = ({ examAttemptId, testSeriesTitle }) => {
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await axios.get(
                `${API_BASE_URL}/reports/exam/${examAttemptId}/pdf`,
                {
                    responseType: 'blob',
                    timeout: 30000 // 30 seconds timeout
                }
            );

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `${testSeriesTitle.replace(/\s+/g, '_')}_Report_${timestamp}.pdf`;

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

            // Cleanup
            window.URL.revokeObjectURL(url);

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error downloading report:', err);
            setError('Failed to download report. Please try again.');
            setTimeout(() => setError(null), 5000);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="download-report-container">
            <button
                className={`download-report-btn ${downloading ? 'downloading' : ''} ${success ? 'success' : ''}`}
                onClick={handleDownload}
                disabled={downloading}
            >
                {downloading ? (
                    <>
                        <span className="btn-spinner"></span>
                        <span>Generating PDF...</span>
                    </>
                ) : success ? (
                    <>
                        <span className="btn-icon">✓</span>
                        <span>Downloaded!</span>
                    </>
                ) : (
                    <>
                        <span className="btn-icon">📄</span>
                        <span>Download PDF Report</span>
                    </>
                )}
            </button>

            {error && (
                <div className="download-error">
                    <span className="error-icon">⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="download-success">
                    <span className="success-icon">✓</span>
                    <span>Report downloaded successfully!</span>
                </div>
            )}

            <div className="download-info">
                <p className="info-text">
                    <span className="info-icon">ℹ️</span>
                    Download a comprehensive PDF report with all your analytics,
                    including rank, percentile, subject-wise analysis, and time breakdown.
                </p>
            </div>
        </div>
    );
};

export default DownloadReportButton;
