import { format } from "date-fns";
import { BookOpen, Calendar, Clock, Music, Play, Video } from "lucide-react";
import { FacebookLiveEmbed } from "@/components/FacebookLiveEmbed";
import { Layout } from "@/shared/components/layout/Layout";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { useChurchInfo, useSermons } from "@/hooks/useChurchData";

const Sermons = () => {
  const { data: sermons, isLoading } = useSermons();
  const { data: churchInfo } = useChurchInfo();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">Loading sermons...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-background py-20" id="hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 font-bold font-display text-4xl md:text-[3.75rem]">
            <span className="text-foreground">Sermons & </span>
            <span className="text-church-orange">Messages</span>
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
            Listen to God's Word as we dive deep into Scripture and discover how
            it applies to our daily lives
          </p>
        </div>
      </section>

      {/* Facebook Livestream Section */}
      <section className="bg-muted/30 py-12" id="livestream">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h2 className="mb-3 font-bold font-display text-3xl">
                <span className="text-foreground">Watch </span>
                <span className="text-church-orange">Live</span>
              </h2>
              <p className="text-muted-foreground">
                Join us live on Facebook for our services and special events
              </p>
            </div>

            <Card className="overflow-hidden">
              <CardContent className="bg-black p-0">
                <FacebookLiveEmbed
                  fallbackVideoUrl={
                    churchInfo?.fallback_stream_url || undefined
                  }
                  showText={false}
                />
              </CardContent>
            </Card>

            <p className="mt-4 text-center text-muted-foreground text-sm">
              Can't see the embed?{" "}
              <a
                className="text-church-orange hover:underline"
                href="https://www.facebook.com/icarefellowship"
                rel="noopener noreferrer"
                target="_blank"
              >
                Visit our Facebook page
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Sermons Section */}
      <section className="bg-background py-20" id="sermons-list">
        <div className="container mx-auto px-4">
          {sermons && sermons.length > 0 ? (
            <div className="mx-auto grid max-w-4xl gap-8">
              {sermons.map((sermon) => (
                <Card
                  className="overflow-hidden transition-shadow hover:shadow-lg"
                  key={sermon.id}
                >
                  <div className="md:flex">
                    {/* Thumbnail */}
                    <div className="md:w-1/3">
                      {sermon.thumbnail_url ? (
                        <div className="relative h-48 md:h-full">
                          <img
                            alt={sermon.title}
                            className="h-full w-full object-cover"
                            src={sermon.thumbnail_url}
                          />
                          {sermon.video_url && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="rounded-full bg-black/50 p-3 backdrop-blur-sm">
                                <Play className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex h-48 items-center justify-center bg-gradient-to-br from-church-navy to-church-teal md:h-full">
                          <BookOpen className="h-12 w-12 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 md:w-2/3">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-church-gold">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium text-sm">
                            {format(
                              new Date(sermon.sermon_date),
                              "MMMM d, yyyy"
                            )}
                          </span>
                        </div>
                        {sermon.is_featured && (
                          <Badge
                            className="bg-church-gold text-church-navy"
                            variant="default"
                          >
                            Featured
                          </Badge>
                        )}
                      </div>

                      <h2 className="mb-3 font-bold font-sans text-foreground text-xl md:text-2xl">
                        {sermon.title}
                      </h2>

                      <div className="mb-3 flex flex-wrap gap-4 text-muted-foreground text-sm">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{sermon.speaker}</span>
                        </div>
                        {sermon.duration_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{sermon.duration_minutes} min</span>
                          </div>
                        )}
                        {sermon.scripture_reference && (
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{sermon.scripture_reference}</span>
                          </div>
                        )}
                      </div>

                      {sermon.series_name && (
                        <Badge className="mb-3" variant="outline">
                          {sermon.series_name}
                        </Badge>
                      )}

                      {sermon.description && (
                        <p className="mb-4 line-clamp-2 text-muted-foreground">
                          {sermon.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3">
                        {sermon.video_url && (
                          <Button
                            asChild
                            className="bg-church-gold text-black hover:bg-church-gold/90"
                          >
                            <a
                              href={sermon.video_url}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              <Video className="mr-2 h-4 w-4" />
                              Watch Video
                            </a>
                          </Button>
                        )}
                        {sermon.audio_url && (
                          <Button asChild variant="outline">
                            <a
                              href={sermon.audio_url}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              <Music className="mr-2 h-4 w-4" />
                              Listen Audio
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <BookOpen className="mx-auto mb-6 h-16 w-16 text-muted-foreground" />
              <h2 className="mb-4 font-bold font-display text-2xl">
                No Sermons Available
              </h2>
              <p className="mx-auto max-w-md text-muted-foreground">
                We're working on adding sermon content. Please check back soon!
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Sermons;
