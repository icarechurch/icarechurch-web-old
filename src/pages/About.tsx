import { Facebook, Mail, Phone} from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/shared/components/layout/Layout";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { CORE_VALUES } from "@/shared/constants/core-values";
import { usePastors } from "@/domains/pastors/hooks/usePastors";
import type { Pastor } from "@/domains/pastors/model/pastors.types";
import { MissionVision } from "./pageconstants/MissionVision";

export default function About() {
  const { data: pastors } = usePastors();
  const [selectedPastor, setSelectedPastor] = useState<Pastor | null>(null);

  return (
    <Layout>
      <Helmet>
        <title>About Us - I Care Center | The Refuge Church</title>
        <meta
          content="Learn about I Care Center - The Refuge Church in Olongapo City. Our mission is to share the Gospel, teach Biblical Truth, and provide a refuge for the lost."
          name="description"
        />
      </Helmet>
      {/* Hero */}
      <section className="hero-gradient py-20" id="hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 font-bold font-display text-4xl md:text-5xl">
            About <span className="text-gradient">Our Church</span>
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            For over 40+ years, I Care Center - Refuge has been a beacon of hope
            in our community.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding" id="story">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <img
                alt="Our church community"
                className="rounded-lg shadow-xl"
                src="/during worship.jpg"
              />
            </div>
            <div className="space-y-6">
              <h2 className="font-bold font-display text-3xl">Our Story</h2>
              <p className="text-muted-foreground">
                We're currently working on this page to better share the journey
                God has been leading our church through.
              </p>
              <p className="text-muted-foreground">
                Please check back soon to learn more about our beginnings, our
                mission, and the people who call this church home.
              </p>
              <p className="text-muted-foreground">
                We look forward to sharing our story with you soon. Until then,
                you are always welcome here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-secondary/30" id="mission">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <MissionVision />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding" id="values">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold font-display text-3xl md:text-4xl">
              Our Core Values
            </h2>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {CORE_VALUES.map((value) => (
              <Card className="border-none shadow-lg" key={value.title}>
                <CardContent className="space-y-4 p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-xl">{value.title}</h4>
                  <p className="text-muted-foreground">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pastors */}
      {pastors && pastors.length > 0 && (
        <section className="section-padding bg-secondary/30" id="pastor">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-bold font-display text-3xl md:text-4xl">
                Meet Our {pastors.length === 1 ? "Pastor" : "Pastors"}
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Our leadership team guides our congregation with compassion and
                dedication, helping us grow in spiritual maturity and community
                service.
              </p>
            </div>
            <div
              className={`mx-auto flex max-w-5xl flex-wrap justify-center gap-8 ${
                pastors.length === 1 ? "max-w-md" : ""
              }`}
            >
              {pastors.map((pastor) => (
                <Card
                  className="w-full max-w-sm border-none shadow-lg md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]"
                  key={pastor.id}
                >
                  <CardContent className="space-y-4 p-8 text-center">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                      {pastor.image_url ? (
                        <img
                          alt={pastor.name}
                          className="h-24 w-24 rounded-full object-cover"
                          src={pastor.image_url}
                        />
                      ) : (
                        <span className="font-bold font-display text-3xl text-primary">
                          {pastor.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl">{pastor.name}</h3>
                      {pastor.title && (
                        <p className="text-primary text-sm">{pastor.title}</p>
                      )}
                    </div>
                    <Button
                      onClick={() => setSelectedPastor(pastor)}
                      variant="outline"
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pastor Details Modal */}
      <Dialog
        onOpenChange={(open) => !open && setSelectedPastor(null)}
        open={!!selectedPastor}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {selectedPastor?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedPastor && (
            <div className="space-y-6">
              {/* Pastor Image */}
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
                {selectedPastor.image_url ? (
                  <img
                    alt={selectedPastor.name}
                    className="h-32 w-32 rounded-full object-cover"
                    src={selectedPastor.image_url}
                  />
                ) : (
                  <span className="font-bold font-display text-5xl text-primary">
                    {selectedPastor.name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Title */}
              {selectedPastor.title && (
                <p className="text-center text-primary">
                  {selectedPastor.title}
                </p>
              )}

              {/* Bio */}
              {selectedPastor.bio && (
                <div className="space-y-2">
                  <h4 className="font-semibold">About</h4>
                  <p className="text-muted-foreground text-sm">
                    {selectedPastor.bio}
                  </p>
                </div>
              )}

              {/* Contact Details */}
              <div className="space-y-3">
                {selectedPastor.phone && (
                  <a
                    className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-primary"
                    href={`tel:${selectedPastor.phone}`}
                  >
                    <Phone className="h-5 w-5" />
                    <span>{selectedPastor.phone}</span>
                  </a>
                )}
                {selectedPastor.email && (
                  <a
                    className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-primary"
                    href={`mailto:${selectedPastor.email}`}
                  >
                    <Mail className="h-5 w-5" />
                    <span>{selectedPastor.email}</span>
                  </a>
                )}
                {selectedPastor.facebook_url && (
                  <a
                    className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-primary"
                    href={selectedPastor.facebook_url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Facebook className="h-5 w-5" />
                    <span>Facebook Profile</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
