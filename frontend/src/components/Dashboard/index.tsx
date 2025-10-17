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
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="size-6" />
            <span className="text-xl">FareShare</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              {user.name}
            </span>
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content will go here */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Car className="size-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Dashboard Content Coming Soon</h2>
          <p className="text-muted-foreground mb-4">
            Groups, trip tracking, and expense management will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}