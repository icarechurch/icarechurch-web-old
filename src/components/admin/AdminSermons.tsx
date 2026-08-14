import { format } from "date-fns";
import {
  BookOpen,
  Calendar,
  Clock,
  Edit,
  Music,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
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
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  type Sermon,
  type SermonInsert,
  useSermonMutations,
  useSermons,
} from "@/hooks/useChurchData";

const INITIAL_FORM_DATA: SermonInsert = {
  title: "",
  description: "",
  speaker: "",
  sermon_date: "",
  video_url: "",
  audio_url: "",
  scripture_reference: "",
  series_name: "",
  thumbnail_url: "",
  duration_minutes: null,
  is_featured: false,
};

export function AdminSermons() {
  const { data: sermons, isLoading } = useSermons();
  const { createSermon, updateSermon, deleteSermon } = useSermonMutations();
  const [isOpen, setIsOpen] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SermonInsert>(INITIAL_FORM_DATA);

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setEditingSermon(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(formData.title && formData.speaker && formData.sermon_date)) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingSermon) {
        await updateSermon.mutateAsync({ id: editingSermon.id, ...formData });
        toast.success("Sermon updated successfully");
      } else {
        await createSermon.mutateAsync(formData);
        toast.success("Sermon created successfully");
      }
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast.error(
        editingSermon ? "Failed to update sermon" : "Failed to create sermon"
      );
    }
  };

  const handleEdit = (sermon: Sermon) => {
    setFormData({
      title: sermon.title,
      description: sermon.description || "",
      speaker: sermon.speaker,
      sermon_date: sermon.sermon_date,
      video_url: sermon.video_url || "",
      audio_url: sermon.audio_url || "",
      scripture_reference: sermon.scripture_reference || "",
      series_name: sermon.series_name || "",
      thumbnail_url: sermon.thumbnail_url || "",
      duration_minutes: sermon.duration_minutes,
      is_featured: sermon.is_featured,
    });
    setEditingSermon(sermon);
    setIsOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSermon.mutateAsync(deleteId);
      toast.success("Sermon deleted successfully");
    } catch (error) {
      toast.error("Failed to delete sermon");
    } finally {
      setDeleteId(null);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
      </div>
    );
  }

  const sermonCount = sermons?.length || 0;

  return (
    <div className="max-w-full space-y-6 overflow-x-hidden pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="break-words font-bold font-display text-xl md:text-2xl">
            Sermons
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your church sermons and messages
          </p>
        </div>
        <Dialog onOpenChange={handleOpenChange} open={isOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Sermon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSermon ? "Edit Sermon" : "Add New Sermon"}
              </DialogTitle>
            </DialogHeader>
            <SermonForm
              editingSermon={editingSermon}
              formData={formData}
              isSubmitting={createSermon.isPending || updateSermon.isPending}
              onFormChange={setFormData}
              onOpenChange={handleOpenChange}
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      {sermonCount > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-xs md:text-sm">
              Total Sermons
            </CardTitle>
            <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="break-all font-bold text-lg md:text-2xl">
              {sermonCount}
            </div>
            <p className="line-clamp-2 text-muted-foreground text-xs">
              Sermons in your library
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sermons Grid */}
      <div className="space-y-3 md:space-y-4">
        {sermonCount === 0 ? (
          <Card>
            <CardContent className="py-8 text-center md:py-12">
              <BookOpen className="mx-auto mb-3 h-12 w-12 text-muted-foreground md:mb-4" />
              <p className="font-medium text-muted-foreground">
                No sermons added yet
              </p>
              <p className="text-muted-foreground text-xs md:text-sm">
                Start by creating your first sermon
              </p>
            </CardContent>
          </Card>
        ) : (
          sermons?.map((sermon) => (
            <SermonCard
              key={sermon.id}
              onDelete={() => handleDeleteClick(sermon.id)}
              onEdit={() => handleEdit(sermon)}
              sermon={sermon}
            />
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        onOpenChange={(open) => !open && setDeleteId(null)}
        open={!!deleteId}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              sermon and all associated data.
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

interface SermonFormProps {
  editingSermon: Sermon | null;
  formData: SermonInsert;
  isSubmitting: boolean;
  onFormChange: (data: SermonInsert) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

function SermonForm({
  editingSermon,
  formData,
  isSubmitting,
  onFormChange,
  onOpenChange,
  onSubmit,
}: SermonFormProps) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
            required
            value={formData.title}
          />
        </div>
        <div>
          <Label htmlFor="speaker">Speaker *</Label>
          <Input
            id="speaker"
            onChange={(e) =>
              onFormChange({ ...formData, speaker: e.target.value })
            }
            required
            value={formData.speaker}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="sermon_date">Sermon Date *</Label>
          <Input
            id="sermon_date"
            onChange={(e) =>
              onFormChange({ ...formData, sermon_date: e.target.value })
            }
            required
            type="date"
            value={formData.sermon_date}
          />
        </div>
        <div>
          <Label htmlFor="duration_minutes">Duration (minutes)</Label>
          <Input
            id="duration_minutes"
            onChange={(e) =>
              onFormChange({
                ...formData,
                duration_minutes: e.target.value
                  ? Number.parseInt(e.target.value)
                  : null,
              })
            }
            type="number"
            value={formData.duration_minutes || ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="scripture_reference">Scripture Reference</Label>
          <Input
            id="scripture_reference"
            onChange={(e) =>
              onFormChange({
                ...formData,
                scripture_reference: e.target.value,
              })
            }
            placeholder="e.g., John 3:16"
            value={formData.scripture_reference}
          />
        </div>
        <div>
          <Label htmlFor="series_name">Series Name</Label>
          <Input
            id="series_name"
            onChange={(e) =>
              onFormChange({ ...formData, series_name: e.target.value })
            }
            value={formData.series_name}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          onChange={(e) =>
            onFormChange({ ...formData, description: e.target.value })
          }
          placeholder="Add a description of the sermon..."
          rows={3}
          value={formData.description}
        />
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="video_url">Video URL</Label>
          <Input
            id="video_url"
            onChange={(e) =>
              onFormChange({ ...formData, video_url: e.target.value })
            }
            placeholder="https://youtube.com/watch?v=..."
            type="url"
            value={formData.video_url}
          />
        </div>
        <div>
          <Label htmlFor="audio_url">Audio URL</Label>
          <Input
            id="audio_url"
            onChange={(e) =>
              onFormChange({ ...formData, audio_url: e.target.value })
            }
            placeholder="https://example.com/sermon.mp3"
            type="url"
            value={formData.audio_url}
          />
        </div>
        <div>
          <Label htmlFor="thumbnail_url">Thumbnail Image URL</Label>
          <Input
            id="thumbnail_url"
            onChange={(e) =>
              onFormChange({
                ...formData,
                thumbnail_url: e.target.value,
              })
            }
            placeholder="https://example.com/image.jpg"
            type="url"
            value={formData.thumbnail_url}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.is_featured}
          id="is_featured"
          onCheckedChange={(checked) =>
            onFormChange({ ...formData, is_featured: checked })
          }
        />
        <Label htmlFor="is_featured">Featured sermon</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button disabled={isSubmitting} type="submit">
          {editingSermon ? "Update Sermon" : "Add Sermon"}
        </Button>
        <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface SermonCardProps {
  sermon: Sermon;
  onEdit: () => void;
  onDelete: () => void;
}

function SermonCard({ sermon, onEdit, onDelete }: SermonCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              <h3 className="break-words font-semibold text-base md:text-lg">
                {sermon.title}
              </h3>
              {sermon.is_featured && (
                <Badge className="bg-church-gold text-church-navy shrink-0">
                  Featured
                </Badge>
              )}
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2 text-muted-foreground text-xs md:gap-4 md:grid-cols-4 md:text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {format(new Date(sermon.sermon_date), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4 shrink-0" />
                <span className="truncate">{sermon.speaker}</span>
              </div>
              {sermon.duration_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>{sermon.duration_minutes} min</span>
                </div>
              )}
              {sermon.scripture_reference && (
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span className="truncate">{sermon.scripture_reference}</span>
                </div>
              )}
            </div>

            {sermon.series_name && (
              <Badge className="mb-2" variant="outline">
                {sermon.series_name}
              </Badge>
            )}

            {sermon.description && (
              <p className="mb-3 line-clamp-2 text-muted-foreground text-xs md:text-sm">
                {sermon.description}
              </p>
            )}

            <div className="flex gap-2 flex-wrap">
              {sermon.video_url && (
                <Badge className="text-xs" variant="secondary">
                  <Video className="mr-1 h-3 w-3" />
                  Video
                </Badge>
              )}
              {sermon.audio_url && (
                <Badge className="text-xs" variant="secondary">
                  <Music className="mr-1 h-3 w-3" />
                  Audio
                </Badge>
              )}
            </div>
          </div>

          <div className="ml-0 flex gap-2 shrink-0 sm:ml-4">
            <Button
              aria-label="Edit sermon"
              onClick={onEdit}
              size="sm"
              variant="outline"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              aria-label="Delete sermon"
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={onDelete}
              size="sm"
              variant="outline"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
