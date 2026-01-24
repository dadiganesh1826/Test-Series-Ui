import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api'
import axios from 'axios';
import API_BASE_URL from '../config/api'
import { Plus, Edit2, Trash2 } from 'lucide-react';
import API_BASE_URL from '../config/api'
import AdminLayout from '../components/Admin/AdminLayout';
import API_BASE_URL from '../config/api'
import '../components/Admin/Admin.css';
import API_BASE_URL from '../config/api'

const AdminSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await axios.get('${API_BASE_URL}/subjects');
            setSubjects(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching subjects', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${API_BASE_URL}/subjects/${editingId}`, formData);
            } else {
                await axios.post('${API_BASE_URL}/subjects', formData);
            }
            setShowModal(false);
            setFormData({ name: '', description: '' });
            setEditingId(null);
            fetchSubjects();
        } catch (error) {
            alert('Failed to save subject');
        }
    };

    const handleEdit = (subject) => {
        setFormData({ name: subject.name, description: subject.description });
        setEditingId(subject.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will delete all associated topics.')) {
            try {
                await axios.delete(`${API_BASE_URL}/subjects/${id}`);
                fetchSubjects();
            } catch (error) {
                alert('Failed to delete subject');
            }
        }
    };

    return (
        <AdminLayout title="Manage Subjects">
            <div className="admin-card" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '24px', padding: '16px' }}>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', description: '' });
                        setShowModal(true);
                    }}
                >
                    <Plus size={18} /> Add Subject
                </button>
            </div>

            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                    No subjects found.
                                </td>
                            </tr>
                        ) : (
                            subjects.map(subject => (
                                <tr key={subject.id}>
                                    <td>{subject.id}</td>
                                    <td>
                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{subject.name}</div>
                                    </td>
                                    <td>{subject.description || '-'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button
                                                onClick={() => handleEdit(subject)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(subject.id)}
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
                        <h2>{editingId ? 'Edit Subject' : 'Add Subject'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-main)' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
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
        </AdminLayout>
    );
};

export default AdminSubjects;
