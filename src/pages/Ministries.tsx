import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { useMinistries } from "@/hooks/useChurchData";

export default function Ministries() {
  const { data: ministries, isLoading } = useMinistries();

  const churchMinistries =
    ministries?.filter((m) => m.category === "ministry" || !m.category) || [];
  const outreaches = ministries?.filter((m) => m.category === "outreach") || [];

  return (
    <Layout>
      {/* Hero */}
      <section className="hero-gradient py-20" id="hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 font-bold font-display text-4xl md:text-[3.15rem]">
            Our <span className="text-gradient">Ministries</span>
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Discover the many ways you can connect, serve, and grow in your
            faith journey with us.
          </p>
        </div>
      </section>

      {/* Ministries List */}
      <section className="section-padding" id="ministries-list">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground">
              Loading ministries...
            </div>
          ) : ministries && ministries.length > 0 ? (
            <div className="space-y-16">
              {/* Church Ministries Section */}
              <div className="space-y-6" id="church-ministries">
                <h2 className="text-center font-bold font-display text-3xl md:text-left">
                  Church Ministries
                </h2>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {churchMinistries.map((ministry) => (
                    <Card
                      className="flex h-full flex-col overflow-hidden border-none shadow-lg transition-shadow hover:shadow-xl"
                      id={ministry.id}
                      key={ministry.id}
                    >
                      {ministry.image_url ? (
                        <img
                          alt={ministry.name}
                          className="h-48 w-full object-cover"
                          src={ministry.image_url}
                        />
                      ) : (
                        <div className="flex h-48 w-full items-center justify-center bg-secondary">
                          <Users className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                      <CardContent className="flex-1 space-y-4 p-6">
                        <h3 className="font-bold font-sans text-xl">
                          {ministry.name}
                        </h3>
                        {ministry.description && (
                          <p className="text-muted-foreground">
                            {ministry.description}
                          </p>
                        )}
                        {ministry.leader && (
                          <p className="text-sm">
                            <strong>Leader:</strong> {ministry.leader}
                          </p>
                        )}
                        {ministry.meeting_time && (
                          <div className="text-sm">
                            <strong>Schedule:</strong>
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
                  ))}
                  {churchMinistries.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground">
                      No ministries found.
                    </div>
                  )}
                </div>
              </div>

              {/* Outreaches Section */}
              <div className="space-y-6" id="outreaches">
                <h2 className="text-center font-bold font-display text-3xl md:text-left">
                  Outreaches
                </h2>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {outreaches.map((ministry) => (
                    <Card
                      className="flex h-full flex-col overflow-hidden border-none shadow-lg transition-shadow hover:shadow-xl"
                      id={ministry.id}
                      key={ministry.id}
                    >
                      {ministry.image_url ? (
                        <img
                          alt={ministry.name}
                          className="h-48 w-full object-cover"
                          src={ministry.image_url}
                        />
                      ) : (
                        <div className="flex h-48 w-full items-center justify-center bg-secondary">
                          <Users className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                      <CardContent className="flex-1 space-y-4 p-6">
                        <h3 className="font-bold font-sans text-xl">
                          {ministry.name}
                        </h3>
                        {ministry.description && (
                          <p className="text-muted-foreground">
                            {ministry.description}
                          </p>
                        )}
                        {ministry.leader && (
                          <p className="text-sm">
                            <strong>Leader:</strong> {ministry.leader}
                          </p>
                        )}
                        {ministry.meeting_time && (
                          <div className="text-sm">
                            <strong>Schedule:</strong>
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
                  ))}
                  {outreaches.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground">
                      No outreaches found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="mx-auto mb-4 h-16 w-16 opacity-50" />
              <p>No ministries listed yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Get Involved CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 font-bold font-display text-3xl">Get Involved</h2>
          <p className="mx-auto mb-8 max-w-2xl opacity-90">
            Interested in joining a ministry or starting a new one? We'd love to
            hear from you and help you find your place to serve.
          </p>
          <Button
            asChild
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            size="lg"
          >
            <Link to="/contact#hero">Contact Us</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
