import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import './index.css';

const AppContent = () => {
    return (
        <div className="App">
            <Navbar />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </main>
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
