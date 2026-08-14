import { Image as ImageIcon, Loader2 } from "lucide-react";
import { Layout } from "@/shared/components/layout/Layout";
import { Card } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/shared/components/ui/dialog";
import { Marquee } from "@/shared/components/ui/marquee";
import { useGallery } from "@/domains/gallery/hooks/useGallery";

const Gallery = () => {
  const { data: images, isLoading } = useGallery();

  const firstRow = images ? images.slice(0, Math.ceil(images.length / 2)) : [];
  const secondRow = images ? images.slice(Math.ceil(images.length / 2)) : [];

  return (
    <Layout>
      <section className="bg-white py-20 text-foreground" id="hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6 animate-fade-in font-bold font-display text-4xl md:text-[3.75rem]">
            <span className="text-black">Photo</span>{" "}
            <span className="text-church-orange">Gallery</span>
          </h1>
          <p className="mx-auto max-w-2xl text-black text-xl">
            Glimpses of our life together in worship and community
          </p>
        </div>
      </section>

      <section
        className="overflow-hidden bg-background py-20"
        id="gallery-grid"
      >
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-church-orange" />
            </div>
          ) : images && images.length > 0 ? (
            <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
              <Marquee className="[--duration:20s]" pauseOnHover>
                {firstRow.map((image) => (
                  <GalleryCard image={image} key={image.id} />
                ))}
              </Marquee>
              <Marquee className="[--duration:20s]" pauseOnHover reverse>
                {secondRow.map((image) => (
                  <GalleryCard image={image} key={image.id} />
                ))}
              </Marquee>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background" />
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-church-cream">
                <ImageIcon className="h-10 w-10 text-church-navy/50" />
              </div>
              <h3 className="mb-2 font-bold font-display text-2xl text-foreground">
                Gallery Coming Soon
              </h3>
              <p className="text-muted-foreground">
                We haven't uploaded any photos yet. Check back later!
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

const GalleryCard = ({ image }: { image: any }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Card className="mx-4 w-96 cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="group/card relative aspect-video">
          <img
            alt={image.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-110"
            src={image.image_url}
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
            <h3 className="translate-y-4 font-bold font-display text-white text-xl transition-transform duration-300 group-hover/card:translate-y-0">
              {image.title}
            </h3>
            {image.description && (
              <p className="mt-2 translate-y-4 text-sm text-white/80 transition-transform delay-75 duration-300 group-hover/card:translate-y-0">
                {image.description}
              </p>
            )}
          </div>
        </div>
      </Card>
    </DialogTrigger>
    <DialogContent className="w-full max-w-4xl overflow-hidden border-none bg-transparent p-0 shadow-none">
      <div className="relative flex h-full w-full items-center justify-center">
        <img
          alt={image.title}
          className="h-auto max-h-[85vh] w-full rounded-lg object-contain shadow-2xl"
          src={image.image_url}
        />
        {image.description && (
          <div className="absolute right-0 bottom-0 left-0 rounded-b-lg bg-black/60 p-4 text-white backdrop-blur-sm">
            <h3 className="font-bold text-lg">{image.title}</h3>
            <p className="text-sm text-white/90">{image.description}</p>
          </div>
        )}
      </div>
    </DialogContent>
  </Dialog>
);

export default Gallery;
