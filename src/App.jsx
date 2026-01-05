import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingActions from './components/FloatingActions';
import Home from './pages/Home';
import Health from './pages/Health';
import Settings from './pages/Settings';
import FindCare from './pages/FindCare';
import Login from './pages/Login';
import Chatbot from './pages/Chatbot';
import Yoga from './pages/Yoga';
import TrimesterPage from './pages/TrimesterPage';
import PregnancyRisks from './pages/PregnancyRisks';
import PregnancySymptoms from './pages/PregnancySymptoms';
import ReportHistory from './pages/ReportHistory';
import DietPlan from './pages/DietPlan';
import MaternalGuide from './pages/MaternalGuide';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

const AppContent = () => {
    return (
        <div className="app-container">
            <div className="noise-overlay"></div>
            <Navbar />
            <FloatingActions />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/chatbot"
                        element={
                            <ProtectedRoute>
                                <Chatbot />
                            </ProtectedRoute>
                        }
                    />
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
                    <Route
                        path="/find-care"
                        element={
                            <ProtectedRoute>
                                <FindCare />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/yoga"
                        element={
                            <ProtectedRoute>
                                <Yoga />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/yoga/trimester/:id"
                        element={
                            <ProtectedRoute>
                                <TrimesterPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/pregnancy-risks"
                        element={
                            <ProtectedRoute>
                                <PregnancyRisks />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/pregnancy-symptoms"
                        element={
                            <ProtectedRoute>
                                <PregnancySymptoms />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/report-history"
                        element={
                            <ProtectedRoute>
                                <ReportHistory />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/diet-plan"
                        element={
                            <ProtectedRoute>
                                <DietPlan />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/maternal-guide"
                        element={
                            <ProtectedRoute>
                                <MaternalGuide />
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
