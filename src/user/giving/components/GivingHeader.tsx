import { Heart } from "lucide-react";

export const GivingHeader = () => {
  return (
    <div
      className="mb-12 space-y-4 text-center md:mb-16"
      id="ways-to-give"
    >
      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Heart className="h-8 w-8 text-primary" />
      </div>
      <h1 className="font-bold font-display text-4xl tracking-tight md:text-5xl">
        Ways We <span className="text-church-orange">Give</span>
      </h1>
      <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
        Your generous giving helps us continue our mission to serve the
        community and spread hope. Thank you for your support!
      </p>
    </div>
  );
};
