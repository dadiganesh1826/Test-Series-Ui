import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import axios from 'axios';
import AdminLayout from '../components/Admin/AdminLayout';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AdminAnalytics = () => {
    const [period, setPeriod] = useState('7d');
    const [userGrowthData, setUserGrowthData] = useState([]);
    const [testPerformanceData, setTestPerformanceData] = useState([]);
    // Mock device data for now
    const deviceData = [
        { name: 'Desktop', value: 400 },
        { name: 'Mobile', value: 300 },
        { name: 'Tablet', value: 100 },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [growthRes, perfRes] = await Promise.all([
                    axios.get('${API_BASE_URL}/admin/analytics/user-growth'),
                    axios.get('${API_BASE_URL}/admin/analytics/test-performance')
                ]);
                setUserGrowthData(growthRes.data);
                setTestPerformanceData(perfRes.data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            }
        };
        fetchData();
    }, []);

    const COLORS = ['#4318ff', '#6ad2ff', '#ffce20'];

    return (
        <AdminLayout title="Analytics">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    style={{ padding: '10px', borderRadius: '10px', border: '1px solid #e0e5f2' }}
                >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 3 Months</option>
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                {/* Revenue/User Growth Chart */}
                <div className="admin-card" style={{ gridColumn: 'span 2' }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#2b3674' }}>Growth & Revenue</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={userGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e5f2" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Line type="monotone" dataKey="users" stroke="#4318ff" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                                {/* Revenue line removed since backend doesn't provide it yet */}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Popular Tests */}
                <div className="admin-card">
                    <h3 style={{ margin: '0 0 20px 0', color: '#2b3674' }}>Top Performing Tests</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={testPerformanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e5f2" />
                                <XAxis dataKey="name" hide />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="attempts" fill="#6ad2ff" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        {testPerformanceData.map((d, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px', color: '#a3aed0' }}>
                                <span>{d.name}</span>
                                <span style={{ color: '#2b3674', fontWeight: 'bold' }}>{d.attempts} attempts</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Device Distribution */}
                <div className="admin-card">
                    <h3 style={{ margin: '0 0 20px 0', color: '#2b3674' }}>Device Usage</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={deviceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {deviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminAnalytics;
