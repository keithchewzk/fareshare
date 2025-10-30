import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  ArrowLeft,
  Plus,
  Users,
  MapPin,
  MoreVertical,
  Trash2,
  LogOut,
  Copy,
  Check,
} from "lucide-react";
import { AddTripDialog } from "./AddTripDialog";
import {
  groupService,
  Group,
  Membership,
  MemberDetails,
} from "../../services/groupService";
import { tripService, TripDetails } from "../../services/tripService";
import { TripCard } from "./TripCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Sheet, SheetContent } from "../ui/sheet";

interface User {
  id: number;
  email: string;
  name: string;
}

interface GroupDetailsProps {
  user: User;
  groupId: string;
  onBack: () => void;
}

export function GroupDetails({ user, groupId, onBack }: GroupDetailsProps) {
  const [group, setGroup] = useState<Group | null>(null);
  const [trips, setTrips] = useState<TripDetails[]>([]);
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showMembersSheet, setShowMembersSheet] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [members, setMembers] = useState<MemberDetails[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  const isOwner = membership?.role === "owner";

  useEffect(() => {
    loadGroupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [fetchedGroup, userMembership] = await Promise.all([
        groupService.getGroup(groupId),
        groupService.getUserMembership(groupId),
      ]);

      setGroup(fetchedGroup);
      setMembership(userMembership);

      const groupTrips = await tripService.getTrips(parseInt(groupId));
      setTrips(groupTrips);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load group data"
      );
      console.error("loadGroupData error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (trip: TripDetails) => {
    if (trip.user_id === user.id) return "You";
    return `${trip.user_first_name} ${trip.user_last_name}`.trim();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDeleteGroup = () => setShowDeleteConfirm(true);
  const handleCancelDelete = () => setShowDeleteConfirm(false);

  const handleConfirmDelete = async () => {
    try {
      await groupService.deleteGroup(groupId);
      setShowDeleteConfirm(false);
      onBack();
    } catch (error) {
      console.error("Failed to delete group:", error);
      setShowDeleteConfirm(false);
    }
  };

  const handleLeaveGroup = () => setShowLeaveConfirm(true);
  const handleCancelLeave = () => setShowLeaveConfirm(false);

  const handleConfirmLeave = async () => {
    try {
      await groupService.leaveGroup(groupId);
      setShowLeaveConfirm(false);
      onBack();
    } catch (error) {
      console.error("Failed to leave group:", error);
      setShowLeaveConfirm(false);
    }
  };

  const copyInviteCode = () => {
    if (group) {
      navigator.clipboard.writeText(group.invite_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  /**
   * Updated handler: attempt to get the updated trip from the API.
   * If the API returns nothing (204 / empty body), we set settled_at locally
   * so UI reflects the settled state immediately.
   */
  const handleMarkAsSettled = async (tripId: number) => {
    try {
      const updatedTrip = await tripService.settleTrip(tripId).catch((err) => {
        console.error("tripService.settleTrip error:", err);
        return null;
      });

      // If API returns the updated trip use it, otherwise set settled_at optimistically.
      const settlementPatch =
        updatedTrip && updatedTrip.settled_at
          ? updatedTrip
          : { settled_at: new Date().toISOString() };

      setTrips((prev) =>
        prev.map((t) => (t.id === tripId ? { ...t, ...settlementPatch } : t))
      );
    } catch (error) {
      console.error("Failed to settle trip:", error);
    }
  };

  const loadMembers = async () => {
    try {
      setLoadingMembers(true);
      setMembersError(null);
      const groupMembers = await groupService.getGroupMembers(groupId);
      setMembers(groupMembers);
    } catch (error) {
      setMembersError(
        error instanceof Error ? error.message : "Failed to load members"
      );
      console.error("loadMembers error:", error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleOpenMembersSheet = () => {
    setShowMembersSheet(true);
    loadMembers();
  };

  const getInitials = (member: MemberDetails) => {
    const firstInitial = member.first_name.charAt(0).toUpperCase();
    const lastInitial = member.last_name
      ? member.last_name.charAt(0).toUpperCase()
      : "";
    return firstInitial + lastInitial;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={onBack}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Group not found</p>
          <Button onClick={onBack}>Back to Dashboard</Button>
        </div>
      </div>
    );
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                  onClick={handleOpenMembersSheet}
                >
                  <Users className="size-4 mr-1" />
                  Members
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyInviteCode}
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <span className="mr-2">Code: {group.invite_code}</span>
                  {copiedCode ? (
                    <Check className="size-4 text-green-600" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowAddTrip(true)}>
                <Plus className="size-4 mr-2" />
                Add Trip
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwner ? (
                    <DropdownMenuItem
                      onClick={handleDeleteGroup}
                      className="text-destructive"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete Group
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={handleLeaveGroup}>
                      <LogOut className="size-4 mr-2" />
                      Leave Group
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
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
              <TripCard
                key={trip.id}
                trip={trip}
                currentUserId={user.id}
                getUserName={getUserName}
                formatDate={formatDate}
                onMarkAsSettled={handleMarkAsSettled}
              />
            ))}
          </div>
        )}
      </main>

      <AddTripDialog
        open={showAddTrip}
        onOpenChange={setShowAddTrip}
        costPerDistance={group?.cost_per_distance || 0}
        groupId={parseInt(groupId)}
        onTripCreated={loadGroupData}
      />

      {/* Delete Group Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this group? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Yes, I'm Sure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Group Confirmation */}
      <Dialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave this group?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelLeave}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmLeave}>
              Leave Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Members Sheet */}
      <Sheet open={showMembersSheet} onOpenChange={setShowMembersSheet}>
        <SheetContent>
          <h2 className="text-lg font-semibold mb-6">Group Members</h2>
          {loadingMembers ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading members...</p>
            </div>
          ) : membersError ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-destructive">{membersError}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-center size-10 rounded-full bg-primary text-primary-foreground font-medium flex-shrink-0">
                    {getInitials(member)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {member.first_name} {member.last_name}
                    </p>
                  </div>
                  <Badge
                    variant={member.role === "owner" ? "default" : "secondary"}
                  >
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
