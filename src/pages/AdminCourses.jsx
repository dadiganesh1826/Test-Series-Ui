import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminLayout from '../components/Admin/AdminLayout';
import { Trash2, Plus, X } from 'lucide-react';

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        examId: '',
        price: 0,
        discountedPrice: 0,
        isActive: true
    });

    useEffect(() => {
        fetchCourses();
        fetchExams();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/admin/content/courses');
            setCourses(response.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load courses');
            setLoading(false);
        }
    };

    const fetchExams = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/admin/content/exams');
            setExams(response.data);
        } catch (error) {
            console.error('Failed to load exams');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`http://localhost:8080/api/admin/content/courses/${id}`);
                setCourses(courses.filter(c => c.id !== id));
                toast.success('Course deleted');
            } catch (error) {
                toast.error('Failed to delete course');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                exam: formData.examId ? { id: formData.examId } : null
            };
            const response = await axios.post('http://localhost:8080/api/admin/content/courses', payload);
            setCourses([...courses, response.data]);
            setShowModal(false);
            setFormData({ title: '', description: '', examId: '', price: 0, discountedPrice: 0, isActive: true });
            toast.success('Course created successfully');
        } catch (error) {
            toast.error('Failed to create course');
        }
    };

    return (
        <AdminLayout title="Courses Management">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div className="search-bar-admin" style={{ background: 'white', padding: '10px', borderRadius: '10px' }}>
                    <input type="text" placeholder="Search courses..." style={{ border: 'none', outline: 'none' }} />
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={18} /> New Course
                </button>
            </div>

            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Exam</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map(course => (
                            <tr key={course.id}>
                                <td style={{ fontWeight: 'bold' }}>{course.title}</td>
                                <td>{course.exam ? course.exam.name : '-'}</td>
                                <td>
                                    ₹{course.price}
                                    {course.discountedPrice && <span style={{ textDecoration: 'line-through', color: '#ccc', marginLeft: '5px' }}>₹{course.discountedPrice}</span>}
                                </td>
                                <td>
                                    <span className={`badge ${course.isActive ? 'badge-success' : 'badge-danger'}`}>
                                        {course.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <button onClick={() => handleDelete(course.id)} style={{ background: 'none', border: 'none', color: '#e31a1a', cursor: 'pointer' }}>
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
                            <h3>Add New Course</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Course Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Related Exam</label>
                                <select
                                    className="form-control"
                                    value={formData.examId}
                                    onChange={e => setFormData({ ...formData, examId: e.target.value })}
                                >
                                    <option value="">Select Exam</option>
                                    {exams.map(exam => (
                                        <option key={exam.id} value={exam.id}>{exam.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Price</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Discounted Price</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.discountedPrice}
                                        onChange={e => setFormData({ ...formData, discountedPrice: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Course</button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminCourses;
