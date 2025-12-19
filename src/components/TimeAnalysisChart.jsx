import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import './TimeAnalysisChart.css';

const TimeAnalysisChart = ({ timeAnalysis }) => {
    if (!timeAnalysis || !timeAnalysis.questionTimeData || timeAnalysis.questionTimeData.length === 0) {
        return null;
    }

    const { questionTimeData, averageTimePerQuestion, totalTimeSpent } = timeAnalysis;

    // Prepare data for chart
    const chartData = questionTimeData.map((item, index) => ({
        name: `Q${index + 1}`,
        time: item.timeSpentSeconds,
        questionNumber: index + 1,
        status: item.timeSpentSeconds > averageTimePerQuestion * 1.5 ? 'slow' :
            item.timeSpentSeconds < averageTimePerQuestion * 0.5 ? 'fast' : 'normal'
    }));

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-title">Question {data.questionNumber}</p>
                    <p className="tooltip-time">Time: {data.time}s</p>
                    <p className={`tooltip-status ${data.status}`}>
                        {data.status === 'slow' ? '🐢 Slow' :
                            data.status === 'fast' ? '⚡ Fast' : '✓ Normal'}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Get bar color based on time
    const getBarColor = (entry) => {
        if (entry.time > averageTimePerQuestion * 1.5) return '#F44336'; // Red - Slow
        if (entry.time < averageTimePerQuestion * 0.5) return '#4CAF50'; // Green - Fast
        return '#2196F3'; // Blue - Normal
    };

    // Calculate statistics
    const slowQuestions = questionTimeData.filter(q => q.timeSpentSeconds > averageTimePerQuestion * 1.5).length;
    const fastQuestions = questionTimeData.filter(q => q.timeSpentSeconds < averageTimePerQuestion * 0.5).length;
    const normalQuestions = questionTimeData.length - slowQuestions - fastQuestions;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    return (
        <div className="time-analysis-chart">
            <h3 className="chart-title">⏱️ Time Analysis</h3>

            {/* Summary Stats */}
            <div className="time-stats-grid">
                <div className="time-stat-card">
                    <div className="stat-icon">⏰</div>
                    <div className="stat-content">
                        <div className="stat-label">Total Time</div>
                        <div className="stat-value">{formatTime(totalTimeSpent)}</div>
                    </div>
                </div>

                <div className="time-stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <div className="stat-label">Avg per Question</div>
                        <div className="stat-value">{averageTimePerQuestion}s</div>
                    </div>
                </div>

                <div className="time-stat-card fast">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-content">
                        <div className="stat-label">Fast Questions</div>
                        <div className="stat-value">{fastQuestions}</div>
                    </div>
                </div>

                <div className="time-stat-card slow">
                    <div className="stat-icon">🐢</div>
                    <div className="stat-content">
                        <div className="stat-label">Slow Questions</div>
                        <div className="stat-value">{slowQuestions}</div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#666', fontSize: 12 }}
                            axisLine={{ stroke: '#ccc' }}
                        />
                        <YAxis
                            label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft', fill: '#666' }}
                            tick={{ fill: '#666', fontSize: 12 }}
                            axisLine={{ stroke: '#ccc' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                        />
                        <ReferenceLine
                            y={averageTimePerQuestion}
                            stroke="#FF9800"
                            strokeDasharray="5 5"
                            label={{ value: 'Average', position: 'right', fill: '#FF9800', fontSize: 12 }}
                        />
                        <Bar
                            dataKey="time"
                            name="Time Spent (seconds)"
                            radius={[8, 8, 0, 0]}
                        >
                            {chartData.map((entry, index) => (
                                <rect key={`bar-${index}`} fill={getBarColor(entry)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Time Management Tips */}
            <div className="time-tips">
                <h4 className="tips-title">💡 Time Management Tips</h4>
                <div className="tips-grid">
                    {slowQuestions > questionTimeData.length * 0.3 && (
                        <div className="tip-card warning">
                            <span className="tip-icon">⚠️</span>
                            <div className="tip-content">
                                <strong>Too Many Slow Questions</strong>
                                <p>You spent too much time on {slowQuestions} questions. Try to move faster on difficult questions.</p>
                            </div>
                        </div>
                    )}

                    {fastQuestions > questionTimeData.length * 0.5 && (
                        <div className="tip-card info">
                            <span className="tip-icon">ℹ️</span>
                            <div className="tip-content">
                                <strong>Quick Responses</strong>
                                <p>You answered {fastQuestions} questions very quickly. Make sure you're reading carefully!</p>
                            </div>
                        </div>
                    )}

                    {normalQuestions > questionTimeData.length * 0.6 && (
                        <div className="tip-card success">
                            <span className="tip-icon">✅</span>
                            <div className="tip-content">
                                <strong>Good Time Management</strong>
                                <p>You maintained consistent timing on most questions. Keep it up!</p>
                            </div>
                        </div>
                    )}

                    <div className="tip-card general">
                        <span className="tip-icon">🎯</span>
                        <div className="tip-content">
                            <strong>Recommended Strategy</strong>
                            <p>Aim for {Math.floor(averageTimePerQuestion * 0.8)}-{Math.ceil(averageTimePerQuestion * 1.2)}s per question for optimal time management.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="time-legend">
                <div className="legend-item">
                    <div className="legend-color fast"></div>
                    <span>Fast (&lt; {Math.floor(averageTimePerQuestion * 0.5)}s)</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color normal"></div>
                    <span>Normal ({Math.floor(averageTimePerQuestion * 0.5)}-{Math.ceil(averageTimePerQuestion * 1.5)}s)</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color slow"></div>
                    <span>Slow (&gt; {Math.ceil(averageTimePerQuestion * 1.5)}s)</span>
                </div>
            </div>
        </div>
    );
};

export default TimeAnalysisChart;
