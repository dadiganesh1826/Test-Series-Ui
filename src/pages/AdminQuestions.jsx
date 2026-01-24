import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/Admin/AdminLayout';
// import './AdminQuestions.css'; // Removed old CSS

const AdminQuestions = () => {
    const navigate = useNavigate();
    const { testSeriesId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [testSeries, setTestSeries] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        marks: 4,
        explanation: ''
    });

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            navigate('/admin/login');
            return;
        }
        fetchData();
    }, [navigate, testSeriesId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tsResponse, qResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/test-series/${testSeriesId}`),
                axios.get(`${API_BASE_URL}/test-series/${testSeriesId}/questions`)
            ]);
            setTestSeries(tsResponse.data);
            setQuestions(qResponse.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuestion = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/test-series/${testSeriesId}/questions`, formData);
            alert('Question created successfully!');
            setShowCreateModal(false);
            setFormData({
                questionText: '',
                optionA: '',
                optionB: '',
                optionC: '',
                optionD: '',
                correctAnswer: 'A',
                marks: 4,
                explanation: ''
            });
            fetchData();
        } catch (error) {
            console.error('Error creating question:', error);
            alert('Failed to create question');
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) {
            return;
        }
        try {
            await axios.delete(`${API_BASE_URL}/questions/${id}`);
            alert('Question deleted successfully');
            fetchData();
        } catch (error) {
            console.error('Error deleting question:', error);
            alert('Failed to delete question');
        }
    };

    const [showImportModal, setShowImportModal] = useState(false);
    const [globalQuestions, setGlobalQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);

    const fetchGlobalQuestions = async () => {
        try {
            const response = await axios.get('${API_BASE_URL}/admin/content/questions/bank');
            setGlobalQuestions(response.data);
        } catch (error) {
            console.error('Error fetching global questions:', error);
        }
    };

    const handleImportQuestions = async () => {
        if (selectedQuestions.length === 0) {
            alert('Please select questions to import');
            return;
        }
        try {
            await axios.post(`${API_BASE_URL}/test-series/${testSeriesId}/questions/import`, selectedQuestions);
            alert('Questions imported successfully!'); // Simple alert for now, can be toast
            setShowImportModal(false);
            setSelectedQuestions([]);
            fetchData(); // Refresh list
        } catch (error) {
            console.error('Error importing questions:', error);
            alert('Failed to import questions');
        }
    };

    const toggleQuestionSelection = (id) => {
        setSelectedQuestions(prev =>
            prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
        );
    };

    if (loading) {
        return (
            <AdminLayout title="Questions">
                <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={`Questions: ${testSeries?.title || ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <button
                    onClick={() => navigate('/admin/test-series')}
                    style={{ background: 'none', border: 'none', color: '#a3aed0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    ← Back to Series
                </button>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                        className="refresh-btn"
                        onClick={fetchData}
                        style={{ padding: '10px 20px', background: 'white', border: '1px solid #e0e5f2', borderRadius: '10px', cursor: 'pointer', color: '#2b3674' }}
                    >
                        🔄 Refresh
                    </button>
                    <button
                        className="import-btn"
                        onClick={() => {
                            fetchGlobalQuestions();
                            setShowImportModal(true);
                        }}
                        style={{ padding: '10px 20px', background: '#FCD535', color: '#1E2329', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        ⬇ Import from Bank
                    </button>
                    <button
                        className="create-btn"
                        onClick={() => setShowCreateModal(true)}
                        style={{ padding: '10px 20px', background: '#1E2329', color: '#FCD535', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        ➕ Add Question
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {questions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#a3aed0', background: 'white', borderRadius: '20px' }}>
                        <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>❓</span>
                        <p>No questions found in this test series.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{ padding: '10px 20px', background: '#4318ff', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', marginTop: '10px' }}
                        >
                            Add Your First Question
                        </button>
                    </div>
                ) : (
                    questions.map((q, index) => (
                        <div key={q.id} className="admin-card" style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <span style={{ fontWeight: 'bold', color: '#4318ff', background: '#f4f7fe', padding: '5px 10px', borderRadius: '5px' }}>
                                    Question {index + 1}
                                </span>
                                <span style={{ fontWeight: 'bold', color: '#2b3674' }}>{q.marks} Marks</span>
                            </div>

                            <p style={{ fontSize: '16px', color: '#2b3674', fontWeight: '500', marginBottom: '20px' }}>
                                <div dangerouslySetInnerHTML={{ __html: q.questionText }} />
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                {['A', 'B', 'C', 'D'].map((opt) => (
                                    <div key={opt} style={{
                                        padding: '10px', borderRadius: '10px', border: '1px solid #e0e5f2',
                                        background: q.correctAnswer === opt ? '#e6fffa' : 'white',
                                        borderColor: q.correctAnswer === opt ? '#05cd99' : '#e0e5f2'
                                    }}>
                                        <span style={{ fontWeight: 'bold', marginRight: '10px', color: q.correctAnswer === opt ? '#05cd99' : '#a3aed0' }}>{opt}.</span>
                                        {q[`option${opt}`]}
                                        {q.correctAnswer === opt && <span style={{ float: 'right' }}>✅</span>}
                                    </div>
                                ))}
                            </div>

                            {q.explanation && (
                                <div style={{ background: '#fff8e1', padding: '15px', borderRadius: '10px', marginBottom: '15px', fontSize: '14px' }}>
                                    <strong style={{ color: '#F0B90B' }}>Explanation:</strong> <div dangerouslySetInnerHTML={{ __html: q.explanation }} />
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e0e5f2', paddingTop: '15px' }}>
                                <button className="edit-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                                    ✏️
                                </button>
                                <button className="delete-btn" onClick={() => handleDeleteQuestion(q.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Import Modal */}
            {showImportModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setShowImportModal(false)}>
                    <div style={{
                        background: 'white', padding: '30px', borderRadius: '20px', width: '800px', maxWidth: '90%',
                        maxHeight: '90vh', display: 'flex', flexDirection: 'column'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, color: '#2b3674' }}>Import from Global Bank</h2>
                            <button onClick={() => setShowImportModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#a3aed0' }}>×</button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', border: '1px solid #EAECEF', borderRadius: '8px' }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '50px' }}>Select</th>
                                        <th>Question</th>
                                        <th>Marks</th>
                                        <th>Difficulty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {globalQuestions.map(q => (
                                        <tr key={q.id} className={selectedQuestions.includes(q.id) ? 'selected-row' : ''} style={{ background: selectedQuestions.includes(q.id) ? '#FEF6D8' : 'white' }}>
                                            <td style={{ textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedQuestions.includes(q.id)}
                                                    onChange={() => toggleQuestionSelection(q.id)}
                                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                />
                                            </td>
                                            <td><div dangerouslySetInnerHTML={{ __html: q.questionText.substring(0, 100) + '...' }} /></td>
                                            <td>{q.marks}</td>
                                            <td><span className="badge badge-info">{q.difficulty || 'Medium'}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <span style={{ alignSelf: 'center', marginRight: 'auto', color: '#707A8A' }}>
                                {selectedQuestions.length} selected
                            </span>
                            <button onClick={() => setShowImportModal(false)} style={{ padding: '10px 20px', border: 'none', background: '#EAECEF', color: '#1E2329', borderRadius: '10px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleImportQuestions} style={{ padding: '10px 20px', border: 'none', background: '#FCD535', color: '#1E2329', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Import Selected
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setShowCreateModal(false)}>
                    <div style={{
                        background: 'white', padding: '30px', borderRadius: '20px', width: '600px', maxWidth: '90%',
                        maxHeight: '90vh', overflowY: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, color: '#2b3674' }}>Add New Question</h2>
                            <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#a3aed0' }}>×</button>
                        </div>
                        <form onSubmit={handleCreateQuestion}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#2b3674', fontWeight: '600' }}>Question Text *</label>
                                <textarea
                                    required
                                    value={formData.questionText}
                                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #e0e5f2', borderRadius: '10px' }}
                                    placeholder="Enter the question"
                                    rows="3"
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                {['A', 'B', 'C', 'D'].map((opt) => (
                                    <div key={opt} className="form-group">
                                        <label style={{ display: 'block', marginBottom: '5px', color: '#2b3674', fontWeight: '600' }}>Option {opt} *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData[`option${opt}`]}
                                            onChange={(e) => setFormData({ ...formData, [`option${opt}`]: e.target.value })}
                                            style={{ width: '100%', padding: '10px', border: '1px solid #e0e5f2', borderRadius: '10px' }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '5px', color: '#2b3674', fontWeight: '600' }}>Correct Answer *</label>
                                    <select
                                        value={formData.correctAnswer}
                                        onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #e0e5f2', borderRadius: '10px' }}
                                    >
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '5px', color: '#2b3674', fontWeight: '600' }}>Marks *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.marks}
                                        onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #e0e5f2', borderRadius: '10px' }}
                                    />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#2b3674', fontWeight: '600' }}>Explanation (Optional)</label>
                                <textarea
                                    value={formData.explanation}
                                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #e0e5f2', borderRadius: '10px' }}
                                    placeholder="Explain the correct answer"
                                    rows="2"
                                />
                            </div>
                            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '10px 20px', border: 'none', background: '#f4f7fe', color: '#2b3674', borderRadius: '10px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '10px 20px', border: 'none', background: '#4318ff', color: 'white', borderRadius: '10px', cursor: 'pointer' }}>
                                    Add Question
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminQuestions;
