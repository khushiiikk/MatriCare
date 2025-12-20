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

const AppContent = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="App">
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/yoga" element={
                    <ProtectedRoute>
                        <Yoga />
                    </ProtectedRoute>
                } />
                <Route path="/about" element={
                    <ProtectedRoute>
                        <About />
                    </ProtectedRoute>
                } />


                {/* Public Routes */}
                <Route path="/login" element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                } />

                <Route path="/analytics" element={
                    <ProtectedRoute>
                        <Analytics />
                    </ProtectedRoute>
                } />


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
                <Route path="/trimester1" element={
                    <ProtectedRoute>
                        <Trimester1 />
                    </ProtectedRoute>
                } />
                <Route path="/trimester2" element={
                    <ProtectedRoute>
                        <Trimester2 />
                    </ProtectedRoute>
                } />
                <Route path="/trimester3" element={
                    <ProtectedRoute>
                        <Trimester3 />
                    </ProtectedRoute>
                } />
                <Route path="/find-care" element={
                    <ProtectedRoute>
                        <FindCare />
                    </ProtectedRoute>
                } />

            </Routes>
            {isAuthenticated && (
                <>
                    <FloatingRobot />
                    <SOSButton />
                </>
            )}
            <Footer />
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <LanguageProvider>
                <Router>
                    <AppContent />
                </Router>
            </LanguageProvider>
        </AuthProvider>
    );
}

export default App;
