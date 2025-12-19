import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, BookOpen, Library, FileQuestion, BarChart2, LogOut, Hexagon } from 'lucide-react';
import './Admin.css';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/admin/users', icon: <Users size={20} />, label: 'Users' },
        { path: '/admin/exams', icon: <GraduationCap size={20} />, label: 'Exams' },
        { path: '/admin/courses', icon: <BookOpen size={20} />, label: 'Courses' },
        { path: '/admin/test-series', icon: <Library size={20} />, label: 'Test Series' },
        { path: '/admin/questions', icon: <FileQuestion size={20} />, label: 'Question Bank' },
        { path: '/admin/analytics', icon: <BarChart2 size={20} />, label: 'Analytics' },
    ];

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    {/* Binance-like Yellow Icon */}
                    <div style={{ color: '#FCD535', display: 'flex', alignItems: 'center' }}>
                        <Hexagon size={28} fill="#FCD535" color="#FCD535" />
                    </div>
                    <span>TEST<span style={{ color: '#FCD535' }}>SERIES</span></span>
                </div>
            </div>

            <nav className="sidebar-menu">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="menu-icon" style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div style={{ padding: '24px', borderTop: '1px solid var(--border-main)' }}>
                <button
                    onClick={handleLogout}
                    className="btn"
                    style={{
                        width: '100%',
                        background: 'transparent',
                        color: '#707A8A',
                        justifyContent: 'flex-start',
                        padding: '10px 16px',
                        border: '1px solid var(--border-main)'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.color = '#F6465D'; e.currentTarget.style.borderColor = '#F6465D'; }}
                    onMouseOut={(e) => { e.currentTarget.style.color = '#707A8A'; e.currentTarget.style.borderColor = 'var(--border-main)'; }}
                >
                    <LogOut size={18} /> Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
