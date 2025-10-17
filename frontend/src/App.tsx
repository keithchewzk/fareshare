import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';

const App: React.FC = () => {
  const handleGetStarted = () => {
    // TODO: Navigate to auth page when implemented
    console.log('Navigate to auth page');
  };

  return (
    <BrowserRouter>
      <div className="size-full">
        <Routes>
          <Route path="/" element={<LandingPage onGetStarted={handleGetStarted} />} />
          {/* <Route path="/auth" element={<AuthPage />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
