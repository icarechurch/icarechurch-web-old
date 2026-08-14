import { Pencil, Plus, Trash2 } from "lucide-react";
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
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  type Pastor,
  type PastorInsert,
  useChurchInfo,
  useChurchInfoMutation,
  usePastorMutations,
  usePastors,
} from "@/hooks/useChurchData";
import { ImageUpload } from "./ImageUpload";
import {
  createDefaultPastorForm,
  DEFAULT_CHURCH_INFO_FORM,
  getErrorMessage,
  getInitials,
  pastorToFormState,
} from "./adminconstants/churchinfo/adminchurchinfo";

export function AdminChurchInfo() {
  const { data: churchInfo, isLoading } = useChurchInfo();
  const mutation = useChurchInfoMutation();
  const { data: pastors, isLoading: pastorsLoading } = usePastors();
  const { createPastor, updatePastor, deletePastor } = usePastorMutations();

  const [form, setForm] = useState(DEFAULT_CHURCH_INFO_FORM);

  const [pastorForm, setPastorForm] = useState<PastorInsert>(
    createDefaultPastorForm()
  );

  const [editingPastor, setEditingPastor] = useState<Pastor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pastorToDelete, setPastorToDelete] = useState<Pastor | null>(null);

  useEffect(() => {
    if (churchInfo) {
      setForm({
        church_name: churchInfo.church_name || "",
        address: churchInfo.address || "",
        city: churchInfo.city || "",
        state: churchInfo.state || "",
        zip: churchInfo.zip || "",
        phone: churchInfo.phone || "",
        email: churchInfo.email || "",
        office_hours: churchInfo.office_hours || "",
        fallback_stream_url: churchInfo.fallback_stream_url || "",
      });
    }
  }, [churchInfo]);

  const handleSaveChurchInfo = async () => {
    if (!churchInfo?.id) return;
    try {
      await mutation.mutateAsync({ id: churchInfo.id, ...form });
      toast.success("Church info updated");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const resetPastorForm = () => {
    setPastorForm(createDefaultPastorForm(pastors?.length || 0));
    setEditingPastor(null);
  };

  const handlePastorFieldChange =
    (field: keyof PastorInsert) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setPastorForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleChurchFieldChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleOpenDialog = (pastor?: Pastor) => {
    if (pastor) {
      setEditingPastor(pastor);
      setPastorForm(pastorToFormState(pastor));
    } else {
      resetPastorForm();
    }
    setDialogOpen(true);
  };

  const handleSavePastor = async () => {
    if (!pastorForm.name.trim()) {
      toast.error("Pastor name is required");
      return;
    }

    try {
      if (editingPastor) {
        await updatePastor.mutateAsync({
          id: editingPastor.id,
          ...pastorForm,
        });
        toast.success("Pastor updated");
      } else {
        await createPastor.mutateAsync(pastorForm);
        toast.success("Pastor added");
      }
      setDialogOpen(false);
      resetPastorForm();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeletePastor = async (id: string) => {
    try {
      await deletePastor.mutateAsync(id);
      toast.success("Pastor deleted");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading || pastorsLoading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-2xl">Church Information</h2>

      {/* Pastors Management */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle>Pastors</CardTitle>
          <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Pastor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingPastor ? "Edit Pastor" : "Add Pastor"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="font-medium text-sm">Name *</label>
                  <Input
                    onChange={handlePastorFieldChange("name")}
                    placeholder="Pastor Name"
                    value={pastorForm.name}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-medium text-sm">Title</label>
                  <Input
                    onChange={handlePastorFieldChange("title")}
                    placeholder="e.g., Senior Pastor, Associate Pastor"
                    value={pastorForm.title || ""}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-medium text-sm">Email</label>
                  <Input
                    onChange={handlePastorFieldChange("email")}
                    placeholder="pastor@church.com"
                    type="email"
                    value={pastorForm.email || ""}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-medium text-sm">Phone</label>
                  <Input
                    onChange={handlePastorFieldChange("phone")}
                    placeholder="Phone Number"
                    value={pastorForm.phone || ""}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-medium text-sm">Bio</label>
                  <Textarea
                    onChange={handlePastorFieldChange("bio")}
                    placeholder="Short biography..."
                    rows={3}
                    value={pastorForm.bio || ""}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-medium text-sm">Profile Image</label>
                  <ImageUpload
                    folder="pastors"
                    onChange={(url) =>
                      setPastorForm({ ...pastorForm, image_url: url })
                    }
                    value={pastorForm.image_url || ""}
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-medium text-sm">Facebook URL</label>
                  <Input
                    onChange={handlePastorFieldChange("facebook_url")}
                    placeholder="https://facebook.com/pastor.profile"
                    value={pastorForm.facebook_url || ""}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  disabled={createPastor.isPending || updatePastor.isPending}
                  onClick={handleSavePastor}
                >
                  {editingPastor ? "Save Changes" : "Add Pastor"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {!pastors || pastors.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No pastors added yet. Click "Add Pastor" to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {pastors.map((pastor) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
                  key={pastor.id}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      {pastor.image_url ? (
                        <img
                          alt={pastor.name}
                          className="h-12 w-12 rounded-full object-cover"
                          src={pastor.image_url}
                        />
                      ) : (
                        <span className="font-bold text-lg text-primary">
                          {getInitials(pastor.name)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-medium">{pastor.name}</h4>
                      {pastor.title && (
                        <p className="truncate text-muted-foreground text-sm">
                          {pastor.title}
                        </p>
                      )}
                      {pastor.email && (
                        <p className="truncate text-muted-foreground text-xs">
                          {pastor.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      onClick={() => handleOpenDialog(pastor)}
                      size="icon"
                      variant="ghost"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setPastorToDelete(pastor)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        onOpenChange={(open) => !open && setPastorToDelete(null)}
        open={!!pastorToDelete}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pastor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {pastorToDelete?.name}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pastorToDelete) {
                  handleDeletePastor(pastorToDelete.id);
                  setPastorToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Church Details */}
      <Card>
        <CardHeader>
          <CardTitle>Church Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h5>Church Name</h5>
          <Input
            onChange={handleChurchFieldChange("church_name")}
            placeholder="Church Name"
            value={form.church_name}
          />
          <h5>Contact Information</h5>
          <Input
            onChange={handleChurchFieldChange("phone")}
            placeholder="Phone"
            value={form.phone}
          />
          <h5>Email</h5>
          <Input
            onChange={handleChurchFieldChange("email")}
            placeholder="Email"
            value={form.email}
          />
          <h5>Office Hours</h5>
          <Input
            onChange={handleChurchFieldChange("office_hours")}
            placeholder="Office Hours"
            value={form.office_hours}
          />
        </CardContent>
      </Card>

      {/* Livestream Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Livestream Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h5>Fallback Stream URL</h5>
            <Input
              onChange={handleChurchFieldChange("fallback_stream_url")}
              placeholder="https://www.facebook.com/your-page/videos/..."
              value={form.fallback_stream_url}
            />
            <p className="text-muted-foreground text-sm">
              This URL will be used as a backup when the automatic stream
              detection fails.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h5>Address</h5>
            <Input
              onChange={handleChurchFieldChange("address")}
              placeholder="Address"
              value={form.address}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h5>City</h5>
              <Input
                onChange={handleChurchFieldChange("city")}
                placeholder="City"
                value={form.city}
              />
            </div>
            <div className="space-y-2">
              <h5>State</h5>
              <Input
                onChange={handleChurchFieldChange("state")}
                placeholder="State"
                value={form.state}
              />
            </div>
            <div className="space-y-2">
              <h5>Zip</h5>
              <Input
                onChange={handleChurchFieldChange("zip")}
                placeholder="Zip"
                value={form.zip}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSaveChurchInfo} size="lg">
        Save All Changes
      </Button>
    </div>
  );
}
