import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Plus, Users, Car, LogOut, UserPlus } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  members: string[];
  createdAt: number;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onViewGroup: (groupId: string) => void;
}

export function Dashboard({ user, onLogout, onViewGroup }: DashboardProps) {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    loadGroups();
  }, [user.id]);

  const loadGroups = () => {
    const allGroups = JSON.parse(localStorage.getItem('fareshare_groups') || '[]');
    const userGroups = allGroups.filter((g: Group) => g.members.includes(user.id));
    setGroups(userGroups);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Content will go here */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">Manage your car sharing groups and track expenses.</p>
        </div>

        <div className="text-center py-12">
          <Car className="size-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Dashboard Coming Soon</h2>
          <p className="text-muted-foreground mb-4">
            Groups, trip tracking, and expense management will be available here.
          </p>
          <Button onClick={onLogout} variant="outline">
            <LogOut className="size-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}