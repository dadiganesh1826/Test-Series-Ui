import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminLayout from '../components/Admin/AdminLayout';
import { Search, Filter, Trash2, Ban, CheckCircle } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/admin/users');
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`http://localhost:8080/api/admin/users/${userId}`);
                setUsers(users.filter(user => user.id !== userId));
                toast.success('User deleted successfully');
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user');
            }
        }
    };

    const handleToggleActive = async (userId, currentStatus) => {
        try {
            const response = await axios.put(`http://localhost:8080/api/admin/users/${userId}/toggle-active`);
            setUsers(users.map(user =>
                user.id === userId ? { ...user, isBlocked: response.data.isBlocked === 'true' } : user
            ));
            toast.success(response.data.message);
        } catch (error) {
            console.error('Error updating user status:', error);
            toast.error('Failed to update user status');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || (user.role || 'STUDENT') === filterRole;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <AdminLayout title="Users">
                <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Users">
            {/* Toolbar */}
            <div className="admin-card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                <div className="search-bar-admin" style={{ width: '320px' }}>
                    <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px' }} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '40px' }}
                    />
                </div>
                <div className="input-group" style={{ marginBottom: 0, width: '200px' }}>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        style={{ height: '44px' }}
                    >
                        <option value="all">All Roles</option>
                        <option value="STUDENT">Student</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Joined Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            background: '#FEF6D8', color: '#B38600', /* Light Yellow / Gold Text */
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600',
                                            border: '1px solid #FCD535'
                                        }}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{user.name}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontWeight: '500', fontSize: '13px', color: 'var(--text-main)' }}>{user.role || 'STUDENT'}</span>
                                </td>
                                <td>
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td>
                                    <span className={`badge ${!user.isBlocked ? 'badge-success' : 'badge-danger'}`}>
                                        {!user.isBlocked ? 'ACTIVE' : 'BLOCKED'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => handleToggleActive(user.id, user.isBlocked)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: !user.isBlocked ? 'var(--danger)' : 'var(--success)' }}
                                            title={!user.isBlocked ? 'Block User' : 'Unblock User'}
                                        >
                                            {!user.isBlocked ? <Ban size={18} /> : <CheckCircle size={18} />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                            title="Delete User"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No users found matching your search.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;
