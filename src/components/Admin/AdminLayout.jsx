import React from 'react';
import Sidebar from './Sidebar';
import { Search } from 'lucide-react';
import './Admin.css';

const AdminLayout = ({ children, title, subtitle }) => {
    return (
        <div className="admin-container">
            <Sidebar />
            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="topbar-title">
                        <span>Pages / {title}</span>
                        <h1>{title}</h1>
                    </div>

                    <div className="topbar-actions">
                        <div className="search-bar-admin">
                            <Search size={18} color="#707A8A" />
                            <input type="text" placeholder="Search..." />
                        </div>
                        <div className="admin-profile">
                            <div className="admin-avatar">A</div>
                            <span style={{ fontWeight: '500', fontSize: '14px', color: 'var(--text-main)' }}>Admin</span>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
