import { Car, Clock, Mail, MapPin, Phone } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { contactApi } from "@/domains/contact/api/contact.api";
import type { ContactMessageInput } from "@/domains/contact/model/contact.types";
import { useChurchInfo } from "@/domains/church-info/hooks/useChurchInfo";
import { Layout } from "@/shared/components/layout/Layout";
import { Map } from "@/user/contact/components/Map";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

const EMPTY_FORM_DATA: ContactMessageInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  website: "",
};

export default function Contact() {
  const { data: churchInfo } = useChurchInfo();
  const [formData, setFormData] = useState<ContactMessageInput>(EMPTY_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormMessage("");

    try {
      await contactApi.sendMessage(formData);
      const successMessage =
        "Thank you for your message! We will get back to you soon.";
      setFormData(EMPTY_FORM_DATA);
      setFormMessage(successMessage);
      toast.success(successMessage);
    } catch {
      const errorMessage = "Unable to send your message right now.";
      setFormMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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
                        "_blank",
                        "noopener,noreferrer",
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
                    Send us a Message
                  </h2>
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          className="mb-1 block font-medium text-sm"
                          htmlFor="firstName"
                        >
                          First Name
                        </label>
                        <Input
                          id="firstName"
                          name="firstName"
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              firstName: event.target.value,
                            }))
                          }
                          required
                          value={formData.firstName}
                        />
                      </div>
                      <div>
                        <label
                          className="mb-1 block font-medium text-sm"
                          htmlFor="lastName"
                        >
                          Last Name
                        </label>
                        <Input
                          id="lastName"
                          name="lastName"
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              lastName: event.target.value,
                            }))
                          }
                          required
                          value={formData.lastName}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className="mb-1 block font-medium text-sm"
                        htmlFor="email"
                      >
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        onChange={(event) =>
                          setFormData((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        required
                        type="email"
                        value={formData.email}
                      />
                    </div>
                    <div>
                      <label
                        className="mb-1 block font-medium text-sm"
                        htmlFor="phone"
                      >
                        Phone (Optional)
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        onChange={(event) =>
                          setFormData((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                        type="tel"
                        value={formData.phone}
                      />
                    </div>
                    <div>
                      <label
                        className="mb-1 block font-medium text-sm"
                        htmlFor="subject"
                      >
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        onChange={(event) =>
                          setFormData((current) => ({
                            ...current,
                            subject: event.target.value,
                          }))
                        }
                        required
                        value={formData.subject}
                      />
                    </div>
                    <div>
                      <label
                        className="mb-1 block font-medium text-sm"
                        htmlFor="message"
                      >
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        onChange={(event) =>
                          setFormData((current) => ({
                            ...current,
                            message: event.target.value,
                          }))
                        }
                        required
                        rows={5}
                        value={formData.message}
                      />
                    </div>
                    <div aria-hidden="true" className="absolute -left-[9999px]">
                      <label htmlFor="website">Website</label>
                      <Input
                        autoComplete="off"
                        id="website"
                        name="website"
                        onChange={(event) =>
                          setFormData((current) => ({
                            ...current,
                            website: event.target.value,
                          }))
                        }
                        tabIndex={-1}
                        value={formData.website}
                      />
                    </div>
                    {formMessage && (
                      <p aria-live="polite" className="text-sm" role="status">
                        {formMessage}
                      </p>
                    )}
                    <Button
                      className="w-full"
                      disabled={isSubmitting}
                      type="submit"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
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
