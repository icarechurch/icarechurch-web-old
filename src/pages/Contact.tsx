import { Car, Clock, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/shared/components/layout/Layout";
import { Map } from "@/components/Map";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { useChurchInfo } from "@/hooks/useChurchData";

export default function Contact() {
  const { data: churchInfo } = useChurchInfo();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you for your message! We will get back to you soon.");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="hero-gradient py-20" id="hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 font-bold font-display text-4xl md:text-[3.15rem]">
            Get In <span className="text-gradient">Touch</span>
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            We're here to help and would love to connect with you. Reach out
            with questions, prayer requests, or just to say hello.
          </p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="section-padding" id="contact-info">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-8">
              {/* Contact Info Card */}
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <h2 className="mb-6 font-bold font-display text-2xl">
                    Contact Information
                  </h2>

                  <div className="space-y-6">
                    {churchInfo?.phone && (
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Phone</h4>
                          <p className="text-muted-foreground">
                            {churchInfo.phone}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Call us anytime
                          </p>
                        </div>
                      </div>
                    )}

                    {churchInfo?.email && (
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Email</h4>
                          <p className="text-muted-foreground">
                            {churchInfo.email}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            We'd love to hear from you
                          </p>
                        </div>
                      </div>
                    )}

                    {churchInfo?.office_hours && (
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Office Hours</h4>
                          <p className="whitespace-pre-line text-muted-foreground">
                            {churchInfo.office_hours}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Visit Us Card */}
              <Card className="overflow-hidden border-none shadow-lg">
                <CardContent className="p-6 pb-2">
                  <h2 className="mb-4 font-bold font-display text-2xl">
                    Visit Us
                  </h2>
                  {churchInfo?.address && (
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Address</h4>
                        <p className="text-muted-foreground">
                          {churchInfo.address}
                        </p>
                        <p className="text-muted-foreground">
                          {churchInfo.city}, {churchInfo.state} {churchInfo.zip}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Free Parking Badge */}
                  <div className="mt-4 flex items-center gap-3 rounded-lg bg-church-gold/10 p-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-church-gold/20">
                      <Car className="h-5 w-5 text-church-gold-dark" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        Free Parking Available
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Ample parking space for all visitors
                      </p>
                    </div>
                  </div>
                </CardContent>
                <Map
                  address="2057 Jose Abad Santos Avenue, Brgy. Old Cabalan, Olongapo City, Zambales 2200"
                  className="rounded-lg"
                  latitude={14.848_607}
                  longitude={120.312_585}
                />
                <div className="p-4">
                  <Button
                    className="w-full"
                    onClick={() =>
                      window.open(
                        "https://www.google.com/maps/dir/?api=1&destination=14.848607,120.312585",
                        "_blank"
                      )
                    }
                  >
                    <MapPin className="mr-2 h-4 w-4" /> Get Directions
                  </Button>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="border-none shadow-lg">
                <CardContent className="p-8">
                  <h2 className="mb-6 font-bold font-display text-2xl">
                    Send us a Message (Coming soon!)
                  </h2>
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block font-medium text-sm">
                          First Name
                        </label>
                        <Input
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                          required
                          value={formData.firstName}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block font-medium text-sm">
                          Last Name
                        </label>
                        <Input
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                          required
                          value={formData.lastName}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block font-medium text-sm">
                        Email
                      </label>
                      <Input
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        type="email"
                        value={formData.email}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-medium text-sm">
                        Phone (Optional)
                      </label>
                      <Input
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        type="tel"
                        value={formData.phone}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-medium text-sm">
                        Subject
                      </label>
                      <Input
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        required
                        value={formData.subject}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-medium text-sm">
                        Message
                      </label>
                      <Textarea
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        required
                        rows={5}
                        value={formData.message}
                      />
                    </div>
                    <Button className="w-full" type="submit">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
