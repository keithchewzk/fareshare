import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft, Plus, Copy, Check, Users, MapPin } from 'lucide-react';
import { AddTripDialog } from './AddTripDialog';

interface User {
  id: string;
  email: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
  inviteCode: string;
  members: string[];
}

interface Trip {
  id: string;
  groupId: string;
  userId: string;
  startAddress: string;
  endAddress: string;
  distance: number;
  cost: number;
  date: number;
  paid: boolean;
}

interface GroupDetailsProps {
  user: User;
  groupId: string;
  onBack: () => void;
}

export function GroupDetails({ user, groupId, onBack }: GroupDetailsProps) {
  const [group, setGroup] = useState<Group | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showAddTrip, setShowAddTrip] = useState(false);

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = () => {
    const allGroups = JSON.parse(localStorage.getItem('fareshare_groups') || '[]');
    const foundGroup = allGroups.find((g: Group) => g.id === groupId);
    setGroup(foundGroup);

    const allTrips = JSON.parse(localStorage.getItem('fareshare_trips') || '[]');
    const groupTrips = allTrips.filter((t: Trip) => t.groupId === groupId);
    // Sort by date, newest first
    groupTrips.sort((a: Trip, b: Trip) => b.date - a.date);
    setTrips(groupTrips);
  };

  const copyInviteCode = () => {
    if (group) {
      navigator.clipboard.writeText(group.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const getUserName = (userId: string) => {
    if (userId === user.id) return 'You';
    const allUsers = JSON.parse(localStorage.getItem('fareshare_users') || '[]');
    const foundUser = allUsers.find((u: any) => u.id === userId);
    return foundUser?.name || 'Unknown User';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleAddTrip = (tripData: {
    startAddress: string;
    endAddress: string;
  }) => {
    const newTrip: Trip = {
      id: Date.now().toString(),
      groupId,
      userId: user.id,
      startAddress: tripData.startAddress,
      endAddress: tripData.endAddress,
      distance: 0, // Will be calculated by backend later
      cost: 0, // Will be calculated by backend later
      date: Date.now(),
      paid: false,
    };

    // Add to localStorage
    const allTrips = JSON.parse(localStorage.getItem('fareshare_trips') || '[]');
    allTrips.push(newTrip);
    localStorage.setItem('fareshare_trips', JSON.stringify(allTrips));

    // Update local state
    setTrips([newTrip, ...trips]);
    setShowAddTrip(false);
  };

  if (!group) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="size-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-2">{group.name}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="size-4" />
                  {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyInviteCode}
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <span className="mr-2">Code: {group.inviteCode}</span>
                  {copiedCode ? (
                    <Check className="size-4 text-green-600" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button onClick={() => setShowAddTrip(true)}>
              <Plus className="size-4 mr-2" />
              Add Trip
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Trip History Section */}
        <div className="mb-4">
          <h2>Trip History</h2>
        </div>

        {trips.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-muted mb-4">
              <MapPin className="size-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2">No Trips Yet</h3>
            <p className="text-muted-foreground">
              Start logging trips to track expenses for this group
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <Card key={trip.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">
                          {getUserName(trip.userId)}
                        </span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(trip.date)}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 mb-1">
                        <MapPin className="size-4 mt-1 text-muted-foreground flex-shrink-0" />
                        <span>{trip.startAddress}</span>
                      </div>
                      <div className="flex items-start gap-2 pl-6">
                        <span className="text-muted-foreground">→</span>
                        <span>{trip.endAddress}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-1 mb-1">
                        <span>{trip.cost > 0 ? `$${trip.cost.toFixed(2)}` : 'Pending'}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {trip.distance > 0 ? `${trip.distance.toFixed(1)} mi` : 'Calculating...'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AddTripDialog
        open={showAddTrip}
        onOpenChange={setShowAddTrip}
        onAddTrip={handleAddTrip}
      />
    </div>
  );
}