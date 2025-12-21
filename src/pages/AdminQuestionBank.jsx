import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminLayout from '../components/Admin/AdminLayout';
import { Plus, Search, BookOpen, Database, Trash2, AlertCircle } from 'lucide-react';
import '../components/Admin/Admin.css'; // Ensure styles are loaded

const AdminQuestionBank = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('test-series');
    const [testSeries, setTestSeries] = useState([]);
    const [bankQuestions, setBankQuestions] = useState([]);
    const [reviewQuestions, setReviewQuestions] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        marks: 1,
        negativeMarks: 0,
        explanation: '',
        subjectId: '',
        topicId: ''
    });

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            navigate('/admin/login');
            return;
        }
        fetchData();
    }, [activeTab, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'test-series') {
                const response = await axios.get('http://localhost:8080/api/admin/test-series');
                setTestSeries(response.data);
            } else if (activeTab === 'global') {
                const [qRes, sRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/admin/content/questions/bank'),
                    axios.get('http://localhost:8080/api/subjects')
                ]);
                setBankQuestions(qRes.data);
                setSubjects(sRes.data);
            } else if (activeTab === 'review') {
                const response = await axios.get('http://localhost:8080/api/admin/content/questions/review');
                setReviewQuestions(response.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.put(`http://localhost:8080/api/admin/content/questions/${id}/status`, null, {
                params: { status }
            });
            toast.success(`Question ${status.toLowerCase()} successfully`);
            fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleCreateGlobalQuestion = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                subject: formData.subjectId ? { id: formData.subjectId } : null,
                topic: formData.topicId ? { id: formData.topicId } : null
            };

            delete payload.subjectId;
            delete payload.topicId;

            await axios.post('http://localhost:8080/api/admin/content/questions/bank', payload);
            toast.success('Question added to bank');
            setShowModal(false);
            setFormData({
                questionText: '', optionA: '', optionB: '', optionC: '', optionD: '',
                correctAnswer: 'A', marks: 1, negativeMarks: 0, explanation: '',
                subjectId: '', topicId: ''
            });
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to create question');
        }
    };

    const filteredTestSeries = testSeries.filter(ts =>
        ts.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredQuestions = bankQuestions.filter(q =>
        q.questionText.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <AdminLayout title="Question Bank">
                <div style={{ textAlign: 'center', padding: '50px', color: 'var(--gray)' }}>Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Question Bank">
            {/* Tabs */}
            <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '24px' }}>
                <TabButton
                    active={activeTab === 'test-series'}
                    onClick={() => setActiveTab('test-series')}
                    icon={<BookOpen size={18} />}
                    label="By Test Series"
                />
                <TabButton
                    active={activeTab === 'global'}
                    onClick={() => setActiveTab('global')}
                    icon={<Database size={18} />}
                    label="Global Bank"
                />
                <TabButton
                    active={activeTab === 'review'}
                    onClick={() => setActiveTab('review')}
                    icon={<AlertCircle size={18} color={activeTab === 'review' ? 'var(--primary)' : 'var(--danger)'} />}
                    label="Review Queue"
                    hasBadge
                />
            </div>

            {/* Toolbar */}
            <div className="admin-card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                <div className="search-bar-admin" style={{ width: '300px' }}>
                    <Search size={18} color="var(--gray)" />
                    <input
                        type="text"
                        placeholder={activeTab === 'test-series' ? "Search test series..." : "Search questions..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {activeTab === 'global' && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Add Question
                    </button>
                )}
            </div>

            {/* Content */}
            {activeTab === 'test-series' ? (
                <div className="grid-4">
                    {filteredTestSeries.map(ts => (
                        <div key={ts.id} className="admin-card"
                            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
                            onClick={() => navigate(`/admin/test-series/${ts.id}/questions`)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '12px',
                                    background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <BookOpen size={24} />
                                </div>
                                <span className="badge badge-success">{ts.questionCount || 0} Qs</span>
                            </div>
                            <h3 style={{ margin: '0 0 8px 0', color: 'var(--dark)', fontSize: '1.1rem' }}>{ts.title}</h3>
                            <p style={{ color: 'var(--gray)', fontSize: '0.9rem', margin: 0, flex: 1 }}>
                                {ts.description?.substring(0, 60)}...
                            </p>
                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                                Manage Questions →
                            </div>
                        </div>
                    ))}
                </div>
            ) : activeTab === 'global' ? (
                <div className="admin-card">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Question</th>
                                <th>Difficulty</th>
                                <th>Marks</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuestions.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--gray)' }}>No questions found in global bank</td></tr>
                            ) : filteredQuestions.map(q => (
                                <tr key={q.id}>
                                    <td><div dangerouslySetInnerHTML={{ __html: q.questionText.substring(0, 100) + '...' }} /></td>
                                    <td><span className="badge badge-info">{q.difficulty || 'Medium'}</span></td>
                                    <td>{q.marks}</td>
                                    <td><span className={`badge ${q.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>{q.status || 'APPROVED'}</span></td>
                                    <td>
                                        <button className="btn-outline" style={{ border: 'none', color: 'var(--danger)' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Review Queue */
                <div className="admin-card">
                    <h3 style={{ marginTop: 0, marginBottom: '24px', color: 'var(--dark)' }}>Review Pending Content</h3>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Question</th>
                                <th>Submitted By</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviewQuestions.length === 0 ? (
                                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '32px', color: 'var(--gray)' }}>No questions pending review</td></tr>
                            ) : reviewQuestions.map(q => (
                                <tr key={q.id}>
                                    <td>
                                        <div dangerouslySetInnerHTML={{ __html: q.questionText }} />
                                        <div style={{ fontSize: '0.85rem', color: 'var(--gray)', marginTop: '8px' }}>
                                            Correct: {q.correctAnswer} | Marks: {q.marks}
                                        </div>
                                    </td>
                                    <td>Unknown User</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button className="btn btn-primary" onClick={() => handleStatusUpdate(q.id, 'APPROVED')}
                                                style={{ background: 'var(--success)', padding: '6px 12px', fontSize: '0.85rem' }}>
                                                Approve
                                            </button>
                                            <button className="btn btn-primary" onClick={() => handleStatusUpdate(q.id, 'REJECTED')}
                                                style={{ background: 'var(--danger)', padding: '6px 12px', fontSize: '0.85rem' }}>
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal - Simplified styling */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '800px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, color: 'var(--dark)' }}>Add to Question Bank</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--gray)' }}>&times;</button>
                        </div>
                        <form onSubmit={handleCreateGlobalQuestion}>
                            <div className="form-group">
                                <label>Question Text</label>
                                <textarea className="form-control" rows="3" value={formData.questionText} onChange={e => setFormData({ ...formData, questionText: e.target.value })} required />
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label>Subject</label>
                                    <select className="form-control" value={formData.subjectId} onChange={e => setFormData({ ...formData, subjectId: e.target.value, topicId: '' })}>
                                        <option value="">Select Subject</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Topic</label>
                                    <select className="form-control" value={formData.topicId} onChange={e => setFormData({ ...formData, topicId: e.target.value })} disabled={!formData.subjectId}>
                                        <option value="">Select Topic</option>
                                        {subjects.find(s => s.id === parseInt(formData.subjectId))?.topics?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div className="form-group"><label>Option A</label><input className="form-control" value={formData.optionA} onChange={e => setFormData({ ...formData, optionA: e.target.value })} required /></div>
                                <div className="form-group"><label>Option B</label><input className="form-control" value={formData.optionB} onChange={e => setFormData({ ...formData, optionB: e.target.value })} required /></div>
                                <div className="form-group"><label>Option C</label><input className="form-control" value={formData.optionC} onChange={e => setFormData({ ...formData, optionC: e.target.value })} required /></div>
                                <div className="form-group"><label>Option D</label><input className="form-control" value={formData.optionD} onChange={e => setFormData({ ...formData, optionD: e.target.value })} required /></div>
                            </div>

                            <div className="grid-4" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                                <div className="form-group">
                                    <label>Correct</label>
                                    <select className="form-control" value={formData.correctAnswer} onChange={e => setFormData({ ...formData, correctAnswer: e.target.value })}>
                                        <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                                    </select>
                                </div>
                                <div className="form-group"><label>Marks</label><input type="number" className="form-control" value={formData.marks} onChange={e => setFormData({ ...formData, marks: e.target.value })} /></div>
                                <div className="form-group"><label>Neg. Marks</label><input type="number" step="0.25" className="form-control" value={formData.negativeMarks} onChange={e => setFormData({ ...formData, negativeMarks: e.target.value })} /></div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Add Question</button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

const TabButton = ({ active, onClick, icon, label, hasBadge }) => (
    <button
        onClick={onClick}
        style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
            color: active ? 'var(--primary)' : 'var(--gray)',
            fontWeight: active ? '600' : '500',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '0.95rem',
            transition: 'all 0.2s'
        }}
    >
        {icon}
        {label}
    </button>
);

export default AdminQuestionBank;
