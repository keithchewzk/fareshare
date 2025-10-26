import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { GroupDetails } from './components/GroupDetails';
import { userService } from './services/userService';

interface User {
  id: number;
  email: string;
  name: string;
}

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('fareshare_token');
        if (token) {
          const userData = await userService.getCurrentUser();
          // Transform UserProfile to User format
          const user: User = {
            id: userData.id,
            email: userData.email,
            name: `${userData.first_name} ${userData.last_name || ''}`.trim(),
          };
          setUser(user);
        }
      } catch (error) {
        // Token might be invalid, remove it
        localStorage.removeItem('fareshare_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

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

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
