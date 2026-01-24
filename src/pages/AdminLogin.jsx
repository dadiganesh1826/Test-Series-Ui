import React, { useState } from 'react';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, Info } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('${API_BASE_URL}/admin/login', credentials);

            if (response.data.success) {
                // Store admin token
                localStorage.setItem('adminToken', response.data.token);
                localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
                navigate('/admin/dashboard');
            } else {
                setError('Invalid admin credentials');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <div className="admin-icon">
                        <ShieldCheck size={32} />
                    </div>
                    <h1>Admin Portal</h1>
                    <p>Secure access for administrators only</p>
                </div>

                <form onSubmit={handleSubmit} className="admin-login-form">
                    {error && (
                        <div className="error-message">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">
                            <Mail size={16} />
                            Admin Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            placeholder="admin@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            <Lock size={16} />
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="admin-login-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Logging in...
                            </>
                        ) : (
                            <>
                                Login to Dashboard
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="admin-login-footer">
                    <p>
                        <Info size={14} />
                        Only authorized personnel
                    </p>
                    <button
                        className="back-btn"
                        onClick={() => navigate('/')}
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>

            <div className="demo-credentials">
                <h3>Demo Credentials</h3>
                <p><strong>Email:</strong> admin@test.com</p>
                <p><strong>Password:</strong> admin123</p>
            </div>
        </div>
    );
};

export default AdminLogin;
