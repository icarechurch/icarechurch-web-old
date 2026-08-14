import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/shared/components/ui/button";

const NotFound = () => {
  return (
    <Layout>
      {/* 404 Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-church-navy via-church-navy/95 to-church-gold/20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=1920')] bg-center bg-cover opacity-30" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mb-8">
            <h1 className="mb-4 font-bold font-display text-9xl text-church-gold drop-shadow-lg md:text-[120px]">
              404
            </h1>
            <p className="mb-6 font-bold font-display text-3xl text-white md:text-5xl">
              This Page Has Gone Astray
            </p>
            <p className="mx-auto mb-6 max-w-2xl text-white/80 text-xl italic md:text-2xl">
              "What man of you, having a hundred sheep, if he has lost one of
              them, does not leave the ninety-nine in the open country, and go
              after the one that is lost, until he finds it?"
            </p>
            <p className="mb-8 font-serif text-church-gold text-lg">
              - Luke 15:4
            </p>
            <p className="mx-auto mb-8 max-w-xl text-white/70">
              Like a lost sheep, the page you are looking for has wandered off.
              Let us guide you back to the safety of the fold.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              asChild
              className="bg-church-gold font-semibold text-church-navy hover:bg-church-gold/90"
              size="lg"
            >
              <Link className="flex items-center gap-2" to="/">
                <Home className="h-5 w-5" />
                Return to the Fold
              </Link>
            </Button>
            <Button
              asChild
              className="border-white text-black hover:bg-white/10 hover:text-white"
              size="lg"
              variant="outline"
            >
              <Link to="/about">Join the Flock</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
