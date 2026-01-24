import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TestSeriesList from './pages/TestSeriesList';
import ExamPage from './pages/ExamPage';
import EnhancedExamPage from './pages/EnhancedExamPage';
import ResultPage from './pages/ResultPage';
import ResultsHistory from './pages/ResultsHistory';
import CategoryPage from './pages/CategoryPage';
import PracticeMode from './pages/PracticeMode';
import Leaderboard from './pages/Leaderboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminTestSeries from './pages/AdminTestSeries';
import AdminQuestions from './pages/AdminQuestions';
import AdminQuestionBank from './pages/AdminQuestionBank';
import AdminCategories from './pages/AdminCategories';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminExams from './pages/AdminExams';
import AdminCourses from './pages/AdminCourses';
import AdminSubjects from './pages/AdminSubjects';
import AdminTopics from './pages/AdminTopics';
import AdminTopicQuestions from './pages/AdminTopicQuestions';
import BookmarksPage from './pages/BookmarksPage';
import TopicPractice from './pages/TopicPractice';
import PracticeResultPage from './pages/PracticeResultPage';
import UserProfile from './pages/UserProfile';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

// Admin Protected Route Component
const AdminProtectedRoute = ({ children }) => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
        return <Navigate to="/admin/login" />;
    }

    return children;
};

// Layout wrapper to conditionally show Navbar
const Layout = ({ children }) => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <>
            {!isAdminRoute && <Navbar />}
            {children}
        </>
    );
};

function AppContent() {
    return (
        <Router>
            <div className="app">
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <PublicRoute>
                                    <Register />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <UserProfile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/test-series"
                            element={
                                <ProtectedRoute>
                                    <TestSeriesList />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/exam/:examId"
                            element={
                                <ProtectedRoute>
                                    <EnhancedExamPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/result/:examId"
                            element={
                                <ProtectedRoute>
                                    <ResultPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/results"
                            element={
                                <ProtectedRoute>
                                    <ResultsHistory />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/category/:categoryId" element={<CategoryPage />} />
                        <Route
                            path="/practice/:testId"
                            element={
                                <ProtectedRoute>
                                    <PracticeMode />
                                </ProtectedRoute>
                            }
                        />


                        <Route
                            path="/leaderboard"
                            element={
                                <ProtectedRoute>
                                    <Leaderboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/bookmarks"
                            element={
                                <ProtectedRoute>
                                    <BookmarksPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/practice/topic"
                            element={
                                <ProtectedRoute>
                                    <TopicPractice />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/practice/result/:attemptId"
                            element={
                                <ProtectedRoute>
                                    <PracticeResultPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route
                            path="/admin/dashboard"
                            element={
                                <AdminProtectedRoute>
                                    <AdminDashboard />
                                </AdminProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/users"
                            element={
                                <AdminProtectedRoute>
                                    <AdminUsers />
                                </AdminProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/test-series"
                            element={
                                <AdminProtectedRoute>
                                    <AdminTestSeries />
                                </AdminProtectedRoute>
                            }
                        />


                        <Route
                            path="/admin/test-series/:testSeriesId/questions"
                            element={
                                <AdminProtectedRoute>
                                    <AdminQuestions />
                                </AdminProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/questions" // Global Question Bank link
                            element={
                                <AdminProtectedRoute>
                                    <AdminQuestionBank />
                                </AdminProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/categories"
                            element={
                                <AdminProtectedRoute>
                                    <AdminCategories />
                                </AdminProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/analytics"
                            element={
                                <AdminProtectedRoute>
                                    <AdminAnalytics />
                                </AdminProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/exams"
                            element={
                                <AdminProtectedRoute>
                                    <AdminExams />
                                </AdminProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/courses"
                            element={
                                <AdminProtectedRoute>
                                    <AdminCourses />
                                </AdminProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/subjects"
                            element={
                                <AdminProtectedRoute>
                                    <AdminSubjects />
                                </AdminProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/topics"
                            element={
                                <AdminProtectedRoute>
                                    <AdminTopics />
                                </AdminProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/topics/:id/questions"
                            element={
                                <AdminProtectedRoute>
                                    <AdminTopicQuestions />
                                </AdminProtectedRoute>
                            }
                        />
                    </Routes>
                </Layout>
            </div>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
