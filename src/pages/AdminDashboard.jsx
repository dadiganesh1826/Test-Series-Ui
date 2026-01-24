import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/Admin/AdminLayout';
import { Users, BookOpen, FileText, CheckCircle, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTestSeries: 0,
        totalExams: 0,
        activeUsers: 0
    });
    const [activity, setActivity] = useState([]);
    const [growthData, setGrowthData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            navigate('/admin/login');
            return;
        }
        fetchDashboardData();
    }, [navigate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const [statsRes, activityRes, growthRes] = await Promise.all([
                axios.get('${API_BASE_URL}/admin/stats', config),
                axios.get('${API_BASE_URL}/admin/recent-activity', config),
                axios.get('${API_BASE_URL}/admin/analytics/user-growth', config)
            ]);
            setStats(statsRes.data);
            setActivity(activityRes.data);
            setGrowthData(growthRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Dashboard">
                <div style={{ textAlign: 'center', marginTop: '100px', color: '#707A8A' }}>Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Dashboard">
            {/* Stats Grid - Binance Colors */}
            <div className="grid-4" style={{ marginBottom: '32px' }}>
                <StatCard icon={<Users size={24} />} title="Total Users" value={stats.totalUsers} />
                <StatCard icon={<BookOpen size={24} />} title="Test Series" value={stats.totalTestSeries} />
                <StatCard icon={<FileText size={24} />} title="Total Exams" value={stats.totalExams} />
                <StatCard icon={<CheckCircle size={24} />} title="Active Users" value={stats.activeUsers} />
            </div>

            <div className="grid-2">
                {/* Chart Section */}
                <div className="admin-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, color: '#1E2329' }}>User Growth</h3>
                        <TrendingUp size={20} color="#FCD535" />
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={growthData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAECEF" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#707A8A', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#707A8A', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#FCD535"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 6, fill: '#FCD535', stroke: '#1E2329', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="admin-card">
                    <h3 style={{ marginTop: 0, marginBottom: '24px', color: '#1E2329' }}>Recent Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {activity.length > 0 ? (
                            activity.map((item, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '8px',
                                        background: '#FAFAFA', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', border: '1px solid #EAECEF'
                                    }}>
                                        <TrendingUp size={18} color="#707A8A" />
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '500', color: '#1E2329', fontSize: '14px' }}>{item.description}</p>
                                        <span style={{ fontSize: '12px', color: '#707A8A' }}>{item.timestamp}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#707A8A', fontSize: '14px' }}>
                                No recent activity
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

// Enhanced Stat Card for Binance Theme
const StatCard = ({ icon, title, value }) => {
    // Determine color based on title (simple heuristic for demo)
    let iconColor = '#FCD535';
    let iconBg = 'rgba(252, 213, 53, 0.1)';

    if (title.includes('Users')) { iconColor = '#0ECB81'; iconBg = 'rgba(14, 203, 129, 0.1)'; } // Green
    if (title.includes('Exams')) { iconColor = '#F6465D'; iconBg = 'rgba(246, 70, 93, 0.1)'; } // Red/Pink
    if (title.includes('Series')) { iconColor = '#FCD535'; iconBg = 'rgba(252, 213, 53, 0.1)'; } // Yellow

    return (
        <div className="stat-card-enhanced">
            <div className="stat-icon-wrapper" style={{ background: iconBg, color: iconColor }}>
                {React.cloneElement(icon, { size: 24, color: iconColor })}
            </div>
            <div>
                <h3 className="stat-value">{value}</h3>
                <p className="stat-label">{title}</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
