import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/Admin/AdminLayout';
import './AdminCategories.css';

const AdminCategories = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '📚',
        displayOrder: 0,
        active: true
    });

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            navigate('/admin/login');
            return;
        }
        fetchCategories();
    }, [navigate]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await axios.put(`${API_BASE_URL}/categories/${editingCategory.id}`, formData);
                alert('Category updated successfully!');
            } else {
                await axios.post(`${API_BASE_URL}/categories`, formData);
                alert('Category created successfully!');
            }
            setShowModal(false);
            setEditingCategory(null);
            setFormData({
                name: '',
                description: '',
                icon: '📚',
                displayOrder: 0,
                active: true
            });
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData(category);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) {
            return;
        }
        try {
            await axios.delete(`${API_BASE_URL}/categories/${id}`);
            alert('Category deleted successfully');
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category');
        }
    };

    const iconOptions = ['📚', '💼', '🚂', '🏦', '⚙️', '🎓', '📊', '💻', '🏛️', '🔬'];

    if (loading) {
        return (
            <AdminLayout title="Categories">
                <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Categories">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div></div> {/* Spacer */}
                <button
                    className="create-btn" // Using class from CSS or inline
                    onClick={() => {
                        setEditingCategory(null);
                        setFormData({
                            name: '',
                            description: '',
                            icon: '📚',
                            displayOrder: 0,
                            active: true
                        });
                        setShowModal(true);
                    }}
                    style={{
                        padding: '10px 20px', background: '#4318ff', color: 'white',
                        border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    + Add Category
                </button>
            </div>

            <div className="categories-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {categories.map(category => (
                    <div key={category.id} className="category-card" style={{
                        background: 'white', borderRadius: '20px', padding: '24px',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.02)', position: 'relative'
                    }}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%', background: '#f4f7fe',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 0 15px 0'
                        }}>
                            {category.icon}
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', color: '#2b3674' }}>{category.name}</h3>
                        <p style={{ color: '#a3aed0', fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px 0', minHeight: '42px' }}>
                            {category.description}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e0e5f2', paddingTop: '15px' }}>
                            <span className={`badge ${category.active ? 'badge-success' : 'badge-danger'}`}>
                                {category.active ? 'ACTIVE' : 'INACTIVE'}
                            </span>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="edit-btn" onClick={() => handleEdit(category)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }} title="Edit">
                                    ✏️
                                </button>
                                <button className="delete-btn" onClick={() => handleDelete(category.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }} title="Delete">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)} style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
                        background: 'white', padding: '30px', borderRadius: '20px', width: '500px', maxWidth: '90%'
                    }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, color: '#2b3674' }}>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#a3aed0' }}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#2b3674', fontWeight: '600' }}>Category Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #e0e5f2', borderRadius: '10px' }}
                                    placeholder="e.g., SSC, Banking, Railways"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#2b3674', fontWeight: '600' }}>Description *</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #e0e5f2', borderRadius: '10px' }}
                                    rows="3"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#2b3674', fontWeight: '600' }}>Icon</label>
                                <div className="icon-selector" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {iconOptions.map(icon => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon })}
                                            style={{
                                                width: '40px', height: '40px', borderRadius: '10px', border: formData.icon === icon ? '2px solid #4318ff' : '1px solid #e0e5f2',
                                                background: formData.icon === icon ? '#f4f7fe' : 'white', cursor: 'pointer', fontSize: '20px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '5px', color: '#2b3674', fontWeight: '600' }}>Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.displayOrder}
                                        onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #e0e5f2', borderRadius: '10px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '5px', color: '#2b3674', fontWeight: '600' }}>Status</label>
                                    <select
                                        value={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #e0e5f2', borderRadius: '10px' }}
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', border: 'none', background: '#f4f7fe', color: '#2b3674', borderRadius: '10px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '10px 20px', border: 'none', background: '#4318ff', color: 'white', borderRadius: '10px', cursor: 'pointer' }}>
                                    {editingCategory ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminCategories;
