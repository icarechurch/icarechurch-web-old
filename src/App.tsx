import { Helmet } from "react-helmet-async";
import { Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTracker } from "@/components/PageTracker";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { useBibleVerseRotator } from "@/hooks/useBibleVerseRotator";
import {
  useEvents,
  useMinistries,
  useServiceTimes,
} from "@/hooks/useChurchData";
import { useInternetStatus } from "@/hooks/useInternetStatus";
import { useLoadingProgress } from "@/hooks/useLoadingProgress";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Giving from "./pages/Giving";
import Index from "./pages/Index";
import Ministries from "./pages/Ministries";
import Moderator from "./pages/Moderator";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Sermons from "./pages/Sermons";
import Services from "./pages/Services";
import UpdatePassword from "./pages/UpdatePassword";

// Component to check internet connectivity and initial data loading
function AppInitializer({ children }: { children: React.ReactNode }) {
  const { isOnline } = useInternetStatus();
  const currentVerse = useBibleVerseRotator();

  // Fetch critical data for initial load
  const ministriesQuery = useMinistries();
  const eventsQuery = useEvents();
  const serviceTimesQuery = useServiceTimes();

  const criticalQueries = [ministriesQuery, eventsQuery, serviceTimesQuery];
  const anyQueryLoading = criticalQueries.some((query) => query.isLoading);

  const { progress, hasInitialData, hasLoadedOnce } = useLoadingProgress(
    criticalQueries,
    isOnline,
  );

  const showLoading = !((isOnline && hasInitialData) || hasLoadedOnce);

  const loadingText = !isOnline
    ? "Connecting..."
    : anyQueryLoading
      ? "Loading church data..."
      : "Loading.";

  return (
    <>
      {showLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
          {/* Cross Icon */}
          <div className="mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-church-orange">
              <svg
                aria-labelledby="cross-icon-title"
                className="text-white"
                fill="none"
                height="32"
                role="img"
                viewBox="0 0 24 24"
                width="32"
              >
                <title id="cross-icon-title">Cross icon</title>
                <path
                  d="M12 2L12 22M2 12L22 12"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="3"
                />
              </svg>
            </div>
          </div>

          {/* Loading Text */}
          <div className="mb-6">
            <h2 className="font-medium text-gray-800 text-xl">{loadingText}</h2>
          </div>

          {/* Bible Verse */}
          <div className="mb-8 max-w-lg px-6 text-center">
            <p className="text-gray-600 text-sm italic leading-relaxed">
              {currentVerse.verse}
            </p>
            <p className="mt-2 text-gray-500 text-xs">
              - {currentVerse.reference}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="h-1 w-80 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-church-orange transition-all duration-300 ease-out"
              style={{ width: `${Math.max(progress, 5)}%` }}
            />
          </div>
        </div>
      )}
      {children}
    </>
  );
}

const App = () => (
  <ErrorBoundary>
    <TooltipProvider>
    <AuthProvider>
      <AppInitializer>
        <Toaster />
        <Sonner />
        <PageTracker />
        <ScrollToTop />
        <Helmet>
          <link href="/favicon.ico" rel="icon" type="image/x-icon" />
        </Helmet>
        <Routes>
          <Route element={<Index />} path="/" />
          <Route element={<About />} path="/about" />
          <Route element={<Services />} path="/services" />
          <Route element={<Ministries />} path="/ministries" />
          <Route element={<Events />} path="/events" />
          <Route element={<Sermons />} path="/sermons" />
          <Route element={<Contact />} path="/contact" />
          <Route element={<Giving />} path="/giving" />
          <Route element={<Gallery />} path="/gallery" />
          <Route element={<Auth />} path="/auth" />
          <Route element={<UpdatePassword />} path="/update-password" />
          <Route element={<Profile />} path="/profile" />
          <Route element={<Admin />} path="/admin" />
          <Route element={<Moderator />} path="/moderator" />
          <Route element={<NotFound />} path="*" />
        </Routes>
      </AppInitializer>
    </AuthProvider>
  </TooltipProvider>
</ErrorBoundary>
);

export default App;
