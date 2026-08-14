import { Accessibility, Baby, Clock, MapPin, Users } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { expectItems } from "@/constant/expect-items";
import { useServiceTimes } from "@/hooks/useChurchData";

export default function Services() {
  const { data: serviceTimes, isLoading } = useServiceTimes();

  return (
    <Layout>
      <Helmet>
        <title>Service Times - I Care Center | The Refuge Church</title>
        <meta
          content="Join us for worship at I Care Center. View our service times, what to expect, and how to find us in Olongapo City."
          name="description"
        />
      </Helmet>
      {/* Hero */}
      <section className="hero-gradient py-20" id="hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 font-bold font-display text-4xl md:text-[3.15rem]">
            <span className="text-gradient">Service</span> Times
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            We offer multiple opportunities throughout the week to worship,
            learn, and grow together in community.
          </p>
        </div>
      </section>

      {/* Service Times */}
      <section className="section-padding" id="service-times">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground">
              Loading services...
            </div>
          ) : (
            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
              {serviceTimes?.map((service) => (
                <Card
                  className="w-full border-none shadow-lg transition-shadow hover:shadow-xl"
                  key={service.id}
                >
                  <CardContent className="space-y-4 p-5 md:p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      {service.audience && (
                        <div className="ml-2 flex items-center gap-1 text-right text-muted-foreground text-sm">
                          <Users className="h-4 w-4 shrink-0" />
                          {service.audience}
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold font-sans text-xl md:text-2xl">
                      {service.name}
                    </h3>
                    <p className="font-bold text-2xl text-primary md:text-3xl">
                      {service.time}
                    </p>
                    {service.description && (
                      <p className="text-muted-foreground">
                        {service.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* What to Expect */}
      <section
        className="section-padding bg-gradient-to-b from-white to-secondary/20"
        id="expect"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-2 font-semibold text-primary text-sm">
                First Time?
              </span>
              <h2 className="mb-4 font-bold font-display text-3xl md:text-4xl">
                What to Expect
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                We want your first visit to feel comfortable and welcoming.
                Here's what you can look forward to.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {expectItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    className="group relative overflow-hidden border-none bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                    key={item.number}
                  >
                    {/* Gradient accent bar */}
                    <div
                      className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${item.gradient}`}
                    />

                    <CardContent className="p-6 md:p-8">
                      <div className="flex items-start gap-4">
                        {/* Icon container */}
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${item.bgGlow} transition-transform duration-300 group-hover:scale-110`}
                        >
                          <Icon
                            className="h-7 w-7"
                            style={{ color: item.iconColor }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r ${item.gradient} font-bold text-white text-xs`}
                            >
                              {item.number}
                            </span>
                            <h4 className="font-bold text-lg">{item.title}</h4>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section-padding bg-secondary/30" id="location">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-12">
            <div className="space-y-6 text-center">
              <h2 className="font-bold font-display text-3xl">
                Planning to visit?
              </h2>
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <Link to="/contact#visit-us">
                  <Button
                    className="font-semibold text-lg"
                    size="lg"
                    variant="default"
                  >
                    View Our Location
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="group border-none text-center shadow-md transition-all hover:shadow-lg">
                <CardContent className="space-y-4 p-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-church-gold/20 transition-transform group-hover:scale-110">
                    <Accessibility className="h-6 w-6 text-church-gold-dark" />
                  </div>
                  <div>
                    <h4 className="mb-2 font-bold text-lg">Accessibility</h4>
                    <p className="text-muted-foreground text-sm">
                      Our facilities are fully wheelchair accessible with
                      designated seating.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group border-none text-center shadow-md transition-all hover:shadow-lg">
                <CardContent className="space-y-4 p-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-church-gold/20 transition-transform group-hover:scale-110">
                    <Baby className="h-6 w-6 text-church-gold-dark" />
                  </div>
                  <div>
                    <h4 className="mb-2 font-bold text-lg">Kids Ministry</h4>
                    <p className="text-muted-foreground text-sm">
                      Safe, fun, and engaging spaces for children of all ages
                      during service.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
// Force rebuild
