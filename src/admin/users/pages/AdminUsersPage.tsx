import {
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Shield,
  ShieldAlert,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useAuth } from "@/domains/auth/hooks/useAuth";
import { supabase } from "@/infrastructure/supabase/client";
import { adminService } from "@/domains/auth/api/users.api";
import { usersService } from "@/domains/auth/api/user-roles.api";

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  role: "admin" | "moderator" | "user" | null;
}

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);

  // Form state
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<
    "admin" | "moderator" | "user"
  >("user");

  // Edit Form state
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "moderator" | "user">(
    "user"
  );

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const mergedUsers = await adminService.getAllUsersWithRoles();

      // Sort by created_at desc
      mergedUsers.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setUsers(mergedUsers);
    } catch (_error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "create-user",
        {
          body: {
            email: newUserEmail,
            password: newUserPassword,
            full_name: newUserName,
            role: newUserRole,
          },
        }
      );

      if (fnError) throw fnError;
      if (data?.warning) toast.warning(data.warning);

      toast.success("User created successfully");
      setIsCreateOpen(false);
      resetForm();
      fetchUsers();
    } catch (_error) {
      toast.error("Failed to create user. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = (user: UserProfile) => {
    setEditingUser(user);
    setEditName(user.full_name || "");
    setEditRole(user.role || "user");
    setIsEditOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsUpdating(true);
    try {
      // 1. Update Profile (Name)
      await adminService.updateUserProfile(editingUser.id, editName);

      // 2. Update Role
      if (editRole !== editingUser.role) {
        if (editRole === "user") {
          // Remove role entry if downgrading to user
          await usersService.deleteUserRole(editingUser.id);
        } else {
          // Update user role
          await usersService.updateUserRole({
            user_id: editingUser.id,
            role: editRole,
          });
        }
      }

      toast.success("User updated successfully");
      setIsEditOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to update user. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (user: UserProfile) => {
    setDeleteUser(user);
  };

  const handleConfirmDelete = async () => {
    if (!deleteUser) return;

    setIsDeleting(true);
    try {
      await usersService.deleteUser({
        target_user_id: deleteUser.id,
      });

      toast.success("User deleted successfully");
      setDeleteUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to delete user. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserName("");
    setNewUserRole("user");
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 font-medium text-red-800 text-xs">
            <ShieldAlert className="mr-1 h-3 w-3" /> Admin
          </span>
        );
      case "moderator":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 font-medium text-blue-800 text-xs">
            <Shield className="mr-1 h-3 w-3" /> Moderator
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-800 text-xs">
            User
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-3xl tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage user accounts and roles.
          </p>
        </div>
        <Dialog onOpenChange={setIsCreateOpen} open={isCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleCreateUser}>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                  value={newUserName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  type="email"
                  value={newUserEmail}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    className="pr-10"
                    id="password"
                    minLength={6}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                    type={showNewUserPassword ? "text" : "password"}
                    value={newUserPassword}
                  />
                  <button
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                    type="button"
                  >
                    {showNewUserPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  onValueChange={(value: "admin" | "moderator" | "user") =>
                    setNewUserRole(value)
                  }
                  value={newUserRole}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end pt-4">
                <Button disabled={isCreating} type="submit">
                  {isCreating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog onOpenChange={setIsEditOpen} open={isEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleUpdateUser}>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  className="bg-muted"
                  disabled
                  id="edit-email"
                  type="email"
                  value={editingUser?.email || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  value={editName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  onValueChange={(value: "admin" | "moderator" | "user") =>
                    setEditRole(value)
                  }
                  value={editRole}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end pt-4">
                <Button disabled={isUpdating} type="submit">
                  {isUpdating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Alert */}
        <AlertDialog
          onOpenChange={(open) => !open && setDeleteUser(null)}
          open={!!deleteUser}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                user account for{" "}
                <span className="font-semibold text-foreground">
                  {deleteUser?.email}
                </span>{" "}
                and remove their data from the servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
                onClick={(e) => {
                  e.preventDefault();
                  handleConfirmDelete();
                }}
              >
                {isDeleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || "N/A"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        disabled={user.id === currentUser?.id}
                        onClick={() => handleEditClick(user)}
                        size="sm"
                        title={
                          user.id === currentUser?.id
                            ? "Cannot edit your own role here"
                            : "Edit user"
                        }
                        variant="ghost"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={user.id === currentUser?.id}
                        onClick={() => handleDeleteClick(user)}
                        size="sm"
                        title={
                          user.id === currentUser?.id
                            ? "Cannot delete yourself"
                            : "Delete user"
                        }
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell
                      className="py-8 text-center text-muted-foreground"
                      colSpan={5}
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
