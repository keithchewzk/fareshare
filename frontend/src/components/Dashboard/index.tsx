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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Your Groups</h1>
          <p className="text-muted-foreground">
            Manage your shared vehicles and track expenses
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="size-4 mr-2" />
            Create Group
          </Button>
          <Button variant="outline" onClick={() => setShowJoinDialog(true)}>
            <UserPlus className="size-4 mr-2" />
            Join Group
          </Button>
        </div>

        {/* Groups Grid */}
        {groups.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Users className="size-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Groups Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Create your first group to start tracking shared car expenses, or join an existing group with an invite code.
            </p>
          </div>
        ) : (
          /* Groups Grid - TODO: Implement when there are groups */
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Card key={group.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewGroup(group.id)}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="size-5" />
                    {group.name}
                  </CardTitle>
                  <CardDescription>
                    {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(group.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}