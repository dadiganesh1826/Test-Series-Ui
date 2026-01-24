import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminLayout from '../components/Admin/AdminLayout';
import { Trash2, Edit, Plus, X } from 'lucide-react';

const AdminExams = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true
    });

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const response = await axios.get('${API_BASE_URL}/admin/content/exams');
            setExams(response.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load exams');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`${API_BASE_URL}/admin/content/exams/${id}`);
                setExams(exams.filter(e => e.id !== id));
                toast.success('Exam deleted');
            } catch (error) {
                toast.error('Failed to delete exam');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('${API_BASE_URL}/admin/content/exams', formData);
            setExams([...exams, response.data]);
            setShowModal(false);
            setFormData({ name: '', description: '', isActive: true });
            toast.success('Exam created successfully');
        } catch (error) {
            toast.error('Failed to create exam');
        }
    };

    return (
        <AdminLayout title="Exams Management">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div className="search-bar-admin" style={{ background: 'white', padding: '10px', borderRadius: '10px' }}>
                    <input type="text" placeholder="Search exams..." style={{ border: 'none', outline: 'none' }} />
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={18} /> New Exam
                </button>
            </div>

            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exams.map(exam => (
                            <tr key={exam.id}>
                                <td style={{ fontWeight: 'bold' }}>{exam.name}</td>
                                <td>{exam.description}</td>
                                <td>
                                    <span className={`badge ${exam.isActive ? 'badge-success' : 'badge-danger'}`}>
                                        {exam.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <button onClick={() => handleDelete(exam.id)} style={{ background: 'none', border: 'none', color: '#e31a1a', cursor: 'pointer' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3>Add New Exam</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Exam Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-control"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    /> Active
                                </label>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Exam</button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminExams;
