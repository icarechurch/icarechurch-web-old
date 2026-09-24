import { Helmet } from "react-helmet-async";
import { ErrorBoundary } from "@/shared/components/system/ErrorBoundary";
import { AppInitializer } from "@/app/initialization/AppInitializer";
import { PageTracker } from "@/app/initialization/PageTracker";
import ScrollToTop from "@/shared/components/navigation/ScrollToTop";
import { AppProviders } from "@/app/providers/AppProviders";
import { AppRoutes } from "@/app/router/routes";

const App = () => (
  <ErrorBoundary>
    <AppProviders>
      <AppInitializer>
        <PageTracker />
        <ScrollToTop />
        <Helmet>
          <link href="/favicon.ico" rel="icon" type="image/x-icon" />
        </Helmet>
        <AppRoutes />
      </AppInitializer>
    </AppProviders>
</ErrorBoundary>
);

export default App;
