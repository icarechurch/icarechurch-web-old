import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

const HISTORY_IMAGE_DIRECTORY =
  "/history%20of%20i%20care%20center%20-%20olongapo";

const HISTORY_IMAGES = Array.from({ length: 15 }, (_, index) => {
  const photoNumber = index + 1;

  return {
    alt: `I Care Center history photo ${photoNumber}`,
    src: `${HISTORY_IMAGE_DIRECTORY}/${photoNumber}.jpg`,
  };
});

export function HistoryGallery() {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-4">
      {HISTORY_IMAGES.map((image, index) => (
        <Dialog key={image.src}>
          <DialogTrigger asChild>
            <button
              aria-label={`Open ${image.alt}`}
              className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-3xl bg-church-cream text-left shadow-lg transition duration-500 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold focus-visible:ring-offset-2"
              type="button"
            >
              <img
                alt={image.alt}
                className="block h-auto w-full object-contain transition duration-700 group-hover:scale-105"
                loading={index === 0 ? "eager" : "lazy"}
                src={image.src}
              />
              <span className="absolute inset-0 bg-gradient-to-t from-church-navy/45 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl border-none bg-transparent p-0 shadow-none">
            <DialogHeader className="sr-only">
              <DialogTitle>{image.alt}</DialogTitle>
            </DialogHeader>
            <img
              alt={image.alt}
              className="max-h-[85vh] w-full rounded-2xl object-contain shadow-2xl"
              src={image.src}
            />
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
