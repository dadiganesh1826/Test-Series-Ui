import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/Admin/AdminLayout';
import { FileText, Upload, Lock, Unlock, Trash2, Plus, Download } from 'lucide-react';

const AdminTestSeries = () => {
    const navigate = useNavigate();
    const [testSeries, setTestSeries] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedTestId, setSelectedTestId] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        durationMinutes: 180,
        totalMarks: 300,
        passingMarks: 100,
        isActive: true,
        price: 0,
        examId: '',
        type: 'FULL_LENGTH'
    });

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            navigate('/admin/login');
            return;
        }
        fetchTestSeries();
        fetchExams();
    }, [navigate]);

    const fetchExams = async () => {
        try {
            const response = await axios.get('${API_BASE_URL}/admin/content/exams');
            setExams(response.data);
        } catch (error) {
            console.error('Error fetching exams:', error);
        }
    };

    const fetchTestSeries = async () => {
        try {
            setLoading(true);
            const response = await axios.get('${API_BASE_URL}/admin/test-series');
            setTestSeries(response.data);
        } catch (error) {
            console.error('Error fetching test series:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTestSeries = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                exam: formData.examId ? { id: formData.examId } : null
            };
            await axios.post('${API_BASE_URL}/test-series', payload);
            alert('Test Series created successfully!');
            setShowCreateModal(false);
            setFormData({
                title: '',
                description: '',
                durationMinutes: 180,
                totalMarks: 300,
                passingMarks: 100,
                isActive: true,
                price: 0,
                examId: '',
                type: 'FULL_LENGTH'
            });
            fetchTestSeries();
        } catch (error) {
            console.error('Error creating test series:', error);
            alert('Failed to create test series');
        }
    };

    const handleUploadQuestions = async () => {
        if (!uploadFile || !selectedTestId) return;

        const formData = new FormData();
        formData.append('file', uploadFile);

        try {
            setUploading(true);
            const response = await axios.post(`${API_BASE_URL}/admin/upload/questions/${selectedTestId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                alert(response.data.message);
                setShowUploadModal(false);
                setUploadFile(null);
                fetchTestSeries(); // Refresh to update question counts
            } else {
                alert('Upload failed: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error uploading questions:', error);
            alert('Failed to upload questions');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteTestSeries = async (id) => {
        if (!window.confirm('Are you sure you want to delete this test series?')) {
            return;
        }
        try {
            await axios.delete(`${API_BASE_URL}/test-series/${id}`);
            alert('Test Series deleted successfully');
            fetchTestSeries();
        } catch (error) {
            console.error('Error deleting test series:', error);
            alert('Failed to delete test series');
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            await axios.put(`${API_BASE_URL}/test-series/${id}/toggle-active`);
            fetchTestSeries();
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Failed to update status');
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Test Series">
                <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Test Series">
            <div className="admin-card" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '24px', padding: '16px' }}>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    <Plus size={18} /> Create New Test
                </button>
            </div>

            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Questions</th>
                            <th>Marks</th>
                            <th>Duration</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {testSeries.map(ts => (
                            <tr key={ts.id}>
                                <td>
                                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{ts.title}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{ts.description?.substring(0, 50)}...</div>
                                </td>
                                <td>
                                    <span className={`badge ${ts.isActive ? 'badge-success' : 'badge-danger'}`}>
                                        {ts.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </td>
                                <td>{ts.questionCount || 0}</td>
                                <td>{ts.totalMarks}</td>
                                <td>{ts.duration} min</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => navigate(`/admin/test-series/${ts.id}/questions`)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                                            title="Manage Questions"
                                        >
                                            <FileText size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedTestId(ts.id);
                                                setShowUploadModal(true);
                                            }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                                            title="Upload Questions"
                                        >
                                            <Upload size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(ts.id, ts.isActive)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: ts.isActive ? 'var(--success)' : 'var(--danger)' }}
                                            title={ts.isActive ? "Deactivate" : "Activate"}
                                        >
                                            {ts.isActive ? <Unlock size={18} /> : <Lock size={18} />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTestSeries(ts.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {testSeries.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No test series found. Create one to get started!
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 style={{ marginTop: 0, color: 'var(--text-main)' }}>Bulk Upload Questions</h3>

                        <div style={{ margin: '20px 0', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px dashed var(--border-main)' }}>
                            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>1. Download Template</p>
                            <button
                                onClick={() => window.open('${API_BASE_URL}/admin/upload/template', '_blank')}
                                className="btn btn-secondary"
                                style={{ width: '100%' }}
                            >
                                <Download size={16} /> Download Excel Template
                            </button>
                        </div>

                        <div style={{ margin: '20px 0' }}>
                            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>2. Upload Filled File</p>
                            <div className="form-group">
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={(e) => setUploadFile(e.target.files[0])}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            <button onClick={() => setShowUploadModal(false)} className="btn btn-secondary">Cancel</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleUploadQuestions}
                                disabled={!uploadFile}
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 style={{ marginTop: 0, color: 'var(--text-main)' }}>Create Test Series</h3>
                        <form onSubmit={handleCreateTestSeries}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div className="form-group">
                                    <label>Duration (min)</label>
                                    <input type="number" required value={formData.durationMinutes} onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Total Marks</label>
                                    <input type="number" required value={formData.totalMarks} onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '16px' }}>
                                <label>Exam Category</label>
                                <select
                                    value={formData.examId}
                                    onChange={(e) => setFormData({ ...formData, examId: e.target.value })}
                                >
                                    <option value="">Select Exam</option>
                                    {exams.map(exam => (
                                        <option key={exam.id} value={exam.id}>{exam.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Test</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminTestSeries;
