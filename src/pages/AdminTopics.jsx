import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import axios from 'axios';
import { Plus, Edit2, Trash2, Filter, Upload, Download, FileText } from 'lucide-react';
import AdminLayout from '../components/Admin/AdminLayout';
import '../components/Admin/Admin.css';

const AdminTopics = () => {
    const [topics, setTopics] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [loading, setLoading] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', subjectId: '', timePerQuestion: 60 });
    const [editingId, setEditingId] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [selectedTopicId, setSelectedTopicId] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (selectedSubjectId) {
            fetchTopics(selectedSubjectId);
        } else {
            setTopics([]);
        }
    }, [selectedSubjectId]);

    const fetchSubjects = async () => {
        try {
            const response = await axios.get('${API_BASE_URL}/subjects');
            setSubjects(response.data);
            if (response.data.length > 0) {
                setSelectedSubjectId(response.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching subjects', error);
        }
    };

    const fetchTopics = async (subjectId) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/topics/subject/${subjectId}`);
            setTopics(response.data);
        } catch (error) {
            console.error('Error fetching topics', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                subject: { id: formData.subjectId },
                timePerQuestion: parseInt(formData.timePerQuestion)
            };

            if (editingId) {
                await axios.put(`${API_BASE_URL}/topics/${editingId}`, payload);
            } else {
                await axios.post('${API_BASE_URL}/topics', payload);
            }
            setShowModal(false);
            setFormData({ name: '', subjectId: '', timePerQuestion: 60 });
            setEditingId(null);
            fetchTopics(selectedSubjectId);
        } catch (error) {
            alert('Failed to save topic');
        }
    };

    const handleUploadQuestions = async () => {
        if (!uploadFile || !selectedTopicId) return;

        const formData = new FormData();
        formData.append('file', uploadFile);

        try {
            setUploading(true);
            const response = await axios.post(`${API_BASE_URL}/admin/upload/questions/topic/${selectedTopicId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert(response.data.message || 'Upload successful');
            setShowUploadModal(false);
            setUploadFile(null);
        } catch (error) {
            console.error('Error uploading questions:', error);
            alert('Failed to upload questions');
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (topic) => {
        setFormData({ name: topic.name, subjectId: selectedSubjectId, timePerQuestion: topic.timePerQuestion || 60 });
        setEditingId(topic.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`${API_BASE_URL}/topics/${id}`);
                fetchTopics(selectedSubjectId);
            } catch (error) {
                alert('Failed to delete topic');
            }
        }
    };

    return (
        <AdminLayout title="Manage Topics">
            <div className="admin-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                        <Filter size={16} /> Filter by Subject:
                    </label>
                    <select
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        className="form-control"
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-main)' }}
                    >
                        <option value="">Select Subject</option>
                        {subjects.map(subject => (
                            <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', subjectId: selectedSubjectId, timePerQuestion: 60 });
                        setShowModal(true);
                    }}
                    disabled={!selectedSubjectId}
                >
                    <Plus size={18} /> Add Topic
                </button>
            </div>

            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Topic Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topics.length === 0 ? (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                    {loading ? 'Loading...' : 'No topics found for this subject'}
                                </td>
                            </tr>
                        ) : (
                            topics.map(topic => (
                                <tr key={topic.id}>
                                    <td>{topic.id}</td>
                                    <td>
                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{topic.name}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button
                                                onClick={() => {
                                                    setSelectedTopicId(topic.id);
                                                    setShowUploadModal(true);
                                                }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                                                title="Upload Questions"
                                            >
                                                <Upload size={18} />
                                            </button>
                                            <button
                                                onClick={() => window.location.href = `/admin/topics/${topic.id}/questions`}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--info-color)' }}
                                                title="Manage Questions"
                                            >
                                                <FileText size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(topic)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(topic.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editingId ? 'Edit Topic' : 'Add Topic'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Subject</label>
                                <select
                                    value={formData.subjectId}
                                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                    disabled
                                    className="form-control"
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-main)', background: '#f5f5f5' }}
                                >
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Topic Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-main)' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Time Per Question (seconds)</label>
                                <input
                                    type="number"
                                    value={formData.timePerQuestion}
                                    onChange={e => setFormData({ ...formData, timePerQuestion: e.target.value })}
                                    required
                                    min="10"
                                    className="form-control"
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-main)' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showUploadModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 style={{ marginTop: 0, color: 'var(--text-main)' }}>Upload Questions</h3>

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
                                    style={{ width: '100%', padding: '10px', border: '1px solid var(--border-main)', borderRadius: '4px' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            <button onClick={() => setShowUploadModal(false)} className="btn btn-secondary">Cancel</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleUploadQuestions}
                                disabled={!uploadFile || uploading}
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminTopics;
