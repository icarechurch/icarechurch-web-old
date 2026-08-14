import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { Ministry } from "@/domains/ministries/model/ministries.types";
import { CARD_LABELS } from "./adminconstants/ministries/adminministries";

export function SortableMinistryCard({
  ministry,
  onEdit,
  onDelete,
}: {
  ministry: Ministry;
  onEdit: (m: Ministry) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: ministry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div className="mb-4" ref={setNodeRef} style={style}>
      <Card className="overflow-hidden">
        {ministry.image_url && (
          <div className="relative h-24 w-full">
            <img
              alt={ministry.name}
              className="h-full w-full object-cover"
              src={ministry.image_url}
            />
            <div
              {...attributes}
              {...listeners}
              className="absolute top-2 right-2 cursor-grab rounded bg-black/50 p-1 text-white hover:bg-black/70"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          </div>
        )}
        {!ministry.image_url && (
          <div className="flex h-8 w-full justify-end bg-muted p-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab rounded p-1 hover:bg-muted-foreground/20"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        )}
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-base md:text-lg">{ministry.name}</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => onEdit(ministry)}
              size="icon"
              variant="ghost"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => onDelete(ministry.id)}
              size="icon"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 text-muted-foreground text-xs md:text-sm">
          {ministry.leader && <p>{CARD_LABELS.LEADER}: {ministry.leader}</p>}
          {ministry.meeting_time && (
            <div>
              <span className="font-medium">{CARD_LABELS.SCHEDULE}</span>
              <div className="mt-1 space-y-0.5">
                {ministry.meeting_time
                  .split(/[\n,;]+/)
                  .map((line) => line.trim())
                  .filter((line) => line.length > 0)
                  .map((line, index) => (
                    <p key={`${line}-${index}`}>{line}</p>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
