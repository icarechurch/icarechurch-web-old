import { format } from "date-fns";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { useEvents } from "@/hooks/useChurchData";

export default function Events() {
  const { data: events, isLoading } = useEvents();

  return (
    <Layout>
      {/* Hero */}
      <section className="hero-gradient py-20" id="hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 font-bold font-display text-4xl md:text-[3.15rem]">
            Upcoming <span className="text-gradient">Events</span>
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Stay connected with what's happening in our church community. Join
            us for special services, fellowship events, and opportunities to
            grow together.
          </p>
        </div>
      </section>

      {/* Events List */}
      <section className="section-padding" id="events-list">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground">Loading events...</p>
              </div>
            </div>
          ) : events && events.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card
                  className="group overflow-hidden border-none shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  key={event.id}
                >
                  {/* Event Image with Date Badge */}
                  <div className="relative">
                    {event.image_url ? (
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <Calendar className="h-16 w-16 text-primary/20" />
                      </div>
                    )}

                    {/* Floating Date Badge */}
                    <div className="absolute top-4 left-4 flex h-16 w-16 flex-col items-center justify-center rounded-xl bg-background/95 shadow-lg backdrop-blur-sm">
                      <span className="font-bold text-2xl leading-none text-primary">
                        {format(new Date(event.event_date), "d")}
                      </span>
                      <span className="text-xs uppercase leading-none text-muted-foreground mt-1">
                        {format(new Date(event.event_date), "MMM")}
                      </span>
                    </div>
                  </div>

                  {/* Event Details */}
                  <CardContent className="space-y-4 p-6">
                    <div>
                      <h3 className="font-bold font-sans text-xl leading-tight line-clamp-2 mb-3">
                        {event.title}
                      </h3>

                      <div className="space-y-2 text-muted-foreground text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {format(new Date(event.event_date), "EEEE, MMM d, yyyy")}
                          </span>
                        </div>

                        {event.event_time && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span className="line-clamp-1">{event.event_time}</span>
                          </div>
                        )}

                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center space-y-4 max-w-md mx-auto px-4">
                <div className="inline-flex rounded-full bg-secondary/50 p-6">
                  <Calendar className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">No Upcoming Events</h3>
                  <p className="text-muted-foreground text-sm">
                    There are no events scheduled at this time. Check back soon for exciting upcoming events!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section-padding bg-secondary/30" id="newsletter">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 font-bold font-display text-3xl">Stay Updated</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Subscribe to our newsletter to receive updates about upcoming
            events, special services, and church news.
          </p>
        </div>
      </section>
    </Layout>
  );
}
