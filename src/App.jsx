import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Health from './pages/Health';
import Settings from './pages/Settings';
import './index.css';

const AppContent = () => {
    return (
        <div className="App">
            <Navbar />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/health" element={<Health />} />
                    <Route path="/settings" element={<Settings />} />
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
