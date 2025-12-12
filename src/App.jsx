import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Yoga from './pages/Yoga';
import Login from './pages/Login';
import About from './pages/About';
import Settings from './pages/Settings';
import Chatbot from './pages/Chatbot';
import Trimester1 from './pages/Trimester1';
import Trimester2 from './pages/Trimester2';

import Trimester3 from './pages/Trimester3';
import SOSButton from './components/SOSButton';
import FloatingRobot from './components/FloatingRobot';
import Footer from './components/Footer';
import FindCare from './pages/FindCare';
import Analytics from './pages/Analytics';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children;
};

// Public Route Component (redirects to home if already logged in)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (isAuthenticated) {
        return <Navigate to="/" />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <LanguageProvider>
                <Router>
                    <div className="App">
                        <Navbar />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/yoga" element={<Home />} />
                            <Route path="/about" element={<About />} />

                            {/* Public Routes */}
                            <Route path="/login" element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            } />

                            <Route path="/analytics" element={<Analytics />} />

                            {/* Protected Routes */}
                            <Route path="/settings" element={
                                <ProtectedRoute>
                                    <Settings />
                                </ProtectedRoute>
                            } />

                            <Route path="/chatbot" element={
                                <ProtectedRoute>
                                    <Chatbot />
                                </ProtectedRoute>
                            } />

                            {/* Content Routes */}
                            <Route path="/trimester1" element={<Trimester1 />} />
                            <Route path="/trimester2" element={<Trimester2 />} />
                            <Route path="/trimester3" element={<Trimester3 />} />
                            <Route path="/find-care" element={<FindCare />} />
                        </Routes>
                        <FloatingRobot />
                        <SOSButton />
                        <Footer />
                    </div>
                </Router>
            </LanguageProvider>
        </AuthProvider>
    );
}

export default App;
