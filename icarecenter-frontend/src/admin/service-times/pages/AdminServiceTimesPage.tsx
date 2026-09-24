import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { Textarea } from "@/shared/components/ui/textarea";
import {
  type ServiceTime,
  type ServiceTimeInsert,
  useServiceTimeMutations,
  useServiceTimes,
} from "@/domains/service-times/hooks/useServiceTimes";
import {
  INITIAL_FORM_STATE,
  REQUIRED_FIELDS,
  getItemsToDisplay,
  getResetForm,
  handleDragLeave,
  handleDragOver,
  isFormValid,
  prepareSortOrderUpdates,
  swapItems,
} from "@/admin/service-times/service-times.constants";

export function AdminServiceTimesPage() {
  const { data: serviceTimes, isLoading } = useServiceTimes();
  const {
    createServiceTime,
    updateServiceTime,
    deleteServiceTime,
    updateSortOrder,
  } = useServiceTimeMutations();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceTime | null>(null);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [orderedItems, setOrderedItems] = useState<ServiceTime[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setForm(getResetForm());
    setEditing(null);
  };

  const handleSave = async () => {
    if (!isFormValid(form)) {
      toast.error(
        `${REQUIRED_FIELDS.join(" and ")} are required`
      );
      return;
    }
    try {
      if (editing) {
        await updateServiceTime.mutateAsync({ id: editing.id, ...form });
        toast.success("Service time updated");
      } else {
        await createServiceTime.mutateAsync(form as ServiceTimeInsert);
        toast.success("Service time created");
      }
      setOpen(false);
      resetForm();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteServiceTime.mutateAsync(deleteId);
      toast.success("Deleted");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (s: ServiceTime) => {
    setEditing(s);
    setForm({
      name: s.name,
      time: s.time,
      description: s.description || "",
      audience: s.audience || "",
    });
    setOpen(true);
  };

  const handleDragStart = (id: string) => setDraggedItem(id);

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const element = e.currentTarget as HTMLElement;
    element.style.opacity = "1";

    if (!draggedItem || draggedItem === targetId || !serviceTimes) return;

    const items = swapItems(serviceTimes, draggedItem, targetId);
    setOrderedItems(items);
    setDraggedItem(null);

    // Save the new order to database
    const sortUpdates = prepareSortOrderUpdates(items);
    updateSortOrder
      .mutateAsync(sortUpdates)
      .then(() => toast.success("Order saved"))
      .catch((e) => toast.error(e.message));
  };

  const itemsToDisplay = getItemsToDisplay(orderedItems, serviceTimes);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-semibold text-2xl">Service Times</h2>
        <Dialog
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) resetForm();
          }}
          open={open}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit" : "Add"} Service Time</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Name *"
                value={form.name}
              />
              <Input
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                placeholder="Time * (e.g. 8:30-10:00 AM)"
                value={form.time}
              />
              <Input
                onChange={(e) => setForm({ ...form, audience: e.target.value })}
                placeholder="Audience (e.g. All Ages)"
                value={form.audience}
              />
              <Textarea
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Description"
                value={form.description}
              />
              <Button className="w-full" onClick={handleSave}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-4">
          {itemsToDisplay?.map((s) => (
            <Card
              className="cursor-move transition-colors hover:bg-secondary/50"
              draggable
              key={s.id}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDragStart={() => handleDragStart(s.id)}
              onDrop={(e) => handleDrop(e, s.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{s.name}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => openEdit(s)}
                    size="icon"
                    variant="ghost"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(s.id)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-muted-foreground text-sm">
                <p className="font-medium text-primary">{s.time}</p>
                {s.audience && <p>{s.audience}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        onOpenChange={(open) => !open && setDeleteId(null)}
        open={!!deleteId}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              service time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
