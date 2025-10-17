import React from "react";
import "./App.css";
import { LandingPage } from './components/LandingPage';

const App: React.FC = () => {
  return (
    <div className="size-full">
      <LandingPage onGetStarted={() => {}} />
    </div>
  );
};

export default App;
