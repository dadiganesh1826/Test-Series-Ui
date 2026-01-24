import React, { createContext, useState, useContext, useEffect } from 'react';
import API_BASE_URL from '../config/api'
import axios from 'axios';
import API_BASE_URL from '../config/api'

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is stored in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Heartbeat to keep user active
    useEffect(() => {
        if (!user) return;

        const sendHeartbeat = async () => {
            try {
                await axios.put(`${API_BASE_URL}/users/${user.id}/activity`);
            } catch (error) {
                // Silently fail for heartbeat
                console.error("Heartbeat failed", error);
            }
        };

        sendHeartbeat(); // Send immediately on login/load
        const interval = setInterval(sendHeartbeat, 5 * 60 * 1000); // And every 5 mins

        return () => clearInterval(interval);
    }, [user]);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
