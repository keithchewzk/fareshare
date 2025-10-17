import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';

const AppContent: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleLogin = (user: { id: string; email: string; name: string }) => {
    // TODO: Handle login logic when backend is ready
    console.log('User logged in:', user);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="size-full">
      <Routes>
        <Route path="/" element={<LandingPage onGetStarted={handleGetStarted} />} />
        <Route path="/auth" element={<AuthPage onLogin={handleLogin} onBack={handleBack} />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
