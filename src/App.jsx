import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Health from './pages/Health';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

const AppContent = () => {
    return (
        <div className="app-container">
            <div className="noise-overlay"></div>
            <Navbar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/health"
                        element={
                            <ProtectedRoute>
                                <Health />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>
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
