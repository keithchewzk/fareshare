import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Plus, Users, Car, LogOut, UserPlus } from 'lucide-react';
import { CreateGroupDialog } from './CreateGroupDialog';
import { JoinGroupDialog } from './JoinGroupDialog';
import { groupService, Group } from '../../services/groupService';

interface User {
  id: string;
  email: string;
  name: string;
}


interface DashboardProps {
  user: User;
  onLogout: () => void;
  onViewGroup: (groupId: number) => void;
}

export function Dashboard({ user, onLogout, onViewGroup }: DashboardProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  useEffect(() => {
    loadGroups();
  }, [user.id]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const userGroups = await groupService.getGroups();
      setGroups(userGroups);
    } catch (error) {
      console.error('Failed to load groups:', error);
      // Keep empty groups array on error
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const getGroupStats = (groupId: number) => {
    const trips = JSON.parse(localStorage.getItem('fareshare_trips') || '[]');
    const groupTrips = trips.filter((t: any) => t.groupId === groupId);
    return {
      totalTrips: groupTrips.length,
      unpaidTrips: groupTrips.filter((t: any) => !t.paid).length,
    };
  };

  const handleCreateGroup = () => {
    // Refresh the groups list after creation
    loadGroups();
  };

  const handleJoinGroup = (inviteCode: string): { success: boolean; error?: string } => {
    // TODO: Implement join group with backend API
    console.log('Join group not yet implemented with backend API:', inviteCode);
    return { success: false, error: 'Join group functionality coming soon' };
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
        {loading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading groups...</p>
          </div>
        ) : groups.length === 0 ? (
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => {
              const stats = getGroupStats(group.id);
              return (
                <Card
                  key={group.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => onViewGroup(group.id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <span>{group.name}</span>
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Car className="size-5" />
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {group.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Trips</span>
                      <span>{stats.totalTrips}</span>
                    </div>
                    {stats.unpaidTrips > 0 && (
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-muted-foreground">Pending</span>
                        <span className="text-destructive">{stats.unpaidTrips} unpaid</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <CreateGroupDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateGroup={handleCreateGroup}
      />

      <JoinGroupDialog
        open={showJoinDialog}
        onOpenChange={setShowJoinDialog}
        onJoinGroup={handleJoinGroup}
      />
    </div>
  );
}