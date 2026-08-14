import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  type Ministry,
  type MinistryInsert,
  useMinistries,
  useMinistryMutations,
} from "@/hooks/useChurchData";
import {
  CATEGORY_LABELS,
  DEFAULT_FORM_STATE,
  DELETE_CONFIRMATION,
  EMPTY_STATES,
  FORM_FIELDS,
  IMAGE_UPLOAD_CONFIG,
  MINISTRY_CATEGORIES,
  SECTION_TITLES,
  TOAST_MESSAGES,
} from "./adminconstants/ministries/adminministries";
import { ImageUpload } from "./ImageUpload";
import { SortableMinistryCard } from "./SortableMinistryCard";

export function AdminMinistries() {
  const { data: ministries, isLoading } = useMinistries();
  const { createMinistry, updateMinistry, deleteMinistry, updateSortOrder } =
    useMinistryMutations();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Ministry | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM_STATE);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const resetForm = () => {
    setForm(DEFAULT_FORM_STATE);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error(TOAST_MESSAGES.NAME_REQUIRED);
      return;
    }
    try {
      if (editing) {
        await updateMinistry.mutateAsync({ id: editing.id, ...form });
        toast.success(TOAST_MESSAGES.UPDATED_SUCCESS);
      } else {
        // Get max sort order for the new item to put it at the end
        const currentMaxSort = ministries?.length
          ? Math.max(...ministries.map((m) => m.sort_order || 0))
          : 0;
        await createMinistry.mutateAsync({
          ...form,
          sort_order: currentMaxSort + 1,
        } as MinistryInsert);
        toast.success(TOAST_MESSAGES.CREATED_SUCCESS);
      }
      setOpen(false);
      resetForm();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : TOAST_MESSAGES.ERROR_DEFAULT);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMinistry.mutateAsync(deleteId);
      toast.success(TOAST_MESSAGES.DELETED_SUCCESS);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : TOAST_MESSAGES.ERROR_DEFAULT);
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (m: Ministry) => {
    setEditing(m);
    setForm({
      name: m.name,
      description: m.description || "",
      leader: m.leader || "",
      meeting_time: m.meeting_time || "",
      image_url: m.image_url || "",
      category: m.category || MINISTRY_CATEGORIES.MINISTRY,
    });
    setOpen(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !ministries) return;

    const oldIndex = ministries.findIndex((m) => m.id === active.id);
    const newIndex = ministries.findIndex((m) => m.id === over.id);

    // Optimistic update logic could go here, but for now we'll just trigger the mutation
    const newOrder = arrayMove(ministries, oldIndex, newIndex);

    // We need to re-assign sort_orders based on the new array order
    // Note: We are reordering the ENTIRE list, but visually we might be dragging within a category.
    // However, if we want to allow dragging BETWEEN categories, we need to handle that.
    // For simplicity, let's assume we just update the sort_order of the items based on the new list.
    // Accessing the sub-lists might be safer if we only allow sorting WITHIN categories.
    // Let's implement sorting WITHIN categories for now.

    // Check if both items are in the same category
    const activeItem = ministries.find((m) => m.id === active.id);
    const overItem = ministries.find((m) => m.id === over.id);

    if (activeItem?.category !== overItem?.category) return; // Don't allow cross-category dragging for now

    const categoryItems = ministries.filter(
      (m) => m.category === activeItem?.category
    );
    const oldCatIndex = categoryItems.findIndex((m) => m.id === active.id);
    const newCatIndex = categoryItems.findIndex((m) => m.id === over.id);

    const newCatOrder = arrayMove(categoryItems, oldCatIndex, newCatIndex);

    const updates = newCatOrder.map((m, index) => ({
      id: m.id,
      sort_order: index + 1,
    }));

    updateSortOrder.mutate(updates);
  };

  const churchMinistries =
    ministries?.filter((m) => m.category === MINISTRY_CATEGORIES.MINISTRY || !m.category) || [];
  const outreaches = ministries?.filter((m) => m.category === MINISTRY_CATEGORIES.OUTREACH) || [];

  return (
    <div className="max-w-full space-y-6 overflow-x-hidden pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="break-words font-bold font-display text-xl md:text-2xl">
            {SECTION_TITLES.MAIN_TITLE}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            {SECTION_TITLES.MAIN_DESCRIPTION}
          </p>
        </div>
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
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-base md:text-lg">
                {editing ? FORM_FIELDS.DIALOG_TITLE_EDIT : FORM_FIELDS.DIALOG_TITLE_ADD}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs md:text-sm">{FORM_FIELDS.CATEGORY_LABEL}</Label>
                <RadioGroup
                  className="flex gap-4"
                  onValueChange={(v: typeof MINISTRY_CATEGORIES[keyof typeof MINISTRY_CATEGORIES]) =>
                    setForm({ ...form, category: v })
                  }
                  value={form.category}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="cat-ministry" value={MINISTRY_CATEGORIES.MINISTRY} />
                    <Label className="text-xs md:text-sm" htmlFor="cat-ministry">{CATEGORY_LABELS.ministry}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="cat-outreach" value={MINISTRY_CATEGORIES.OUTREACH} />
                    <Label className="text-xs md:text-sm" htmlFor="cat-outreach">{CATEGORY_LABELS.outreach}</Label>
                  </div>
                </RadioGroup>
              </div>

              <Input
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={FORM_FIELDS.NAME_PLACEHOLDER}
                value={form.name}
              />
              <Textarea
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder={FORM_FIELDS.DESCRIPTION_PLACEHOLDER}
                value={form.description}
              />
              <Input
                onChange={(e) => setForm({ ...form, leader: e.target.value })}
                placeholder={FORM_FIELDS.LEADER_PLACEHOLDER}
                value={form.leader}
              />
              <Input
                onChange={(e) =>
                  setForm({ ...form, meeting_time: e.target.value })
                }
                placeholder={FORM_FIELDS.MEETING_TIME_PLACEHOLDER}
                value={form.meeting_time}
              />
              <div>
                <Label className="mb-2 block text-xs md:text-sm">{FORM_FIELDS.IMAGE_LABEL}</Label>
                <ImageUpload
                  folder={IMAGE_UPLOAD_CONFIG.FOLDER}
                  onChange={(url) => setForm({ ...form, image_url: url })}
                  value={form.image_url}
                />
              </div>
              <Button className="w-full text-xs md:text-sm" onClick={handleSave}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
        </div>
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <div className="space-y-8">
            <section>
              <h3 className="mb-3 font-display font-semibold text-base md:mb-4 md:text-lg">
                {SECTION_TITLES.CHURCH_MINISTRIES}
              </h3>
              <SortableContext
                items={churchMinistries.map((m) => m.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {churchMinistries.map((m) => (
                    <SortableMinistryCard
                      key={m.id}
                      ministry={m}
                      onDelete={handleDeleteClick}
                      onEdit={openEdit}
                    />
                  ))}
                  {churchMinistries.length === 0 && (
                    <p className="col-span-full text-muted-foreground text-sm md:text-base">
                      {EMPTY_STATES.NO_CHURCH_MINISTRIES}
                    </p>
                  )}
                </div>
              </SortableContext>
            </section>

            <section>
              <h3 className="mb-3 font-display font-semibold text-base md:mb-4 md:text-lg">
                {SECTION_TITLES.OUTREACHES}
              </h3>
              <SortableContext
                items={outreaches.map((m) => m.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {outreaches.map((m) => (
                    <SortableMinistryCard
                      key={m.id}
                      ministry={m}
                      onDelete={handleDeleteClick}
                      onEdit={openEdit}
                    />
                  ))}
                  {outreaches.length === 0 && (
                    <p className="col-span-full text-muted-foreground text-sm md:text-base">
                      {EMPTY_STATES.NO_OUTREACHES}
                    </p>
                  )}
                </div>
              </SortableContext>
            </section>
          </div>
        </DndContext>
      )}

      <AlertDialog
        onOpenChange={(open) => !open && setDeleteId(null)}
        open={!!deleteId}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base md:text-lg">{DELETE_CONFIRMATION.TITLE}</AlertDialogTitle>
            <AlertDialogDescription className="text-xs md:text-sm">
              {DELETE_CONFIRMATION.DESCRIPTION}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs md:text-sm">{DELETE_CONFIRMATION.CANCEL}</AlertDialogCancel>
            <AlertDialogAction
              className="text-xs md:text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              {DELETE_CONFIRMATION.DELETE}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
