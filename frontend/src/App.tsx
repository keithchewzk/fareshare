import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { GroupDetails } from './components/GroupDetails';

interface User {
  id: string;
  email: string;
  name: string;
}

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleViewGroup = (groupId: number) => {
    navigate(`/groups/${groupId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const GroupDetailsWrapper = () => {
    const { groupId } = useParams<{ groupId: string }>();
    if (!user || !groupId) return null;

    return (
      <GroupDetails
        user={user}
        groupId={groupId}
        onBack={handleBackToDashboard}
      />
    );
  };

  return (
    <div className="size-full">
      <Routes>
        <Route path="/" element={<LandingPage onGetStarted={handleGetStarted} />} />
        <Route path="/auth" element={<AuthPage onLogin={handleLogin} onBack={handleBack} />} />
        {user && (
          <>
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  user={user}
                  onLogout={handleLogout}
                  onViewGroup={handleViewGroup}
                />
              }
            />
            <Route path="/groups/:groupId" element={<GroupDetailsWrapper />} />
          </>
        )}
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
