import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2, ArrowLeft } from 'lucide-react';
import AdminLayout from '../components/Admin/AdminLayout';
import '../components/Admin/Admin.css';

const AdminTopicQuestions = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuestions();
    }, [id]);

    const fetchQuestions = async () => {
        try {
            console.log("Fetching questions for topic:", id);
            const response = await axios.get(`${API_BASE_URL}/topics/${id}/questions`);
            console.log("Response data:", response.data);

            if (Array.isArray(response.data)) {
                setQuestions(response.data);
            } else {
                console.error("Response is not an array:", response.data);
                setQuestions([]);
                alert("Unexpected response format from server.");
            }
        } catch (error) {
            console.error('Error fetching questions', error);
            alert('Failed to load questions. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (questionId) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            try {
                await axios.delete(`${API_BASE_URL}/questions/${questionId}`);
                setQuestions(questions.filter(q => q.id !== questionId));
            } catch (error) {
                alert('Failed to delete question');
            }
        }
    };

    return (
        <AdminLayout title="Manage Topic Questions">
            <div className="admin-card" style={{ marginBottom: '24px', padding: '16px' }}>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/admin/topics')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <ArrowLeft size={16} /> Back to Topics
                </button>
            </div>

            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Question</th>
                            <th>Correct</th>
                            <th>Marks</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {questions.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                    {loading ? 'Loading...' : 'No questions found for this topic'}
                                </td>
                            </tr>
                        ) : (
                            questions.map(q => (
                                <tr key={q.id}>
                                    <td>{q.id}</td>
                                    <td style={{ maxWidth: '400px' }}>
                                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {q.questionText}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="badge badge-success">{q.correctAnswer}</div>
                                    </td>
                                    <td>{q.marks}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(q.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                                            title="Delete Question"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export default AdminTopicQuestions;
