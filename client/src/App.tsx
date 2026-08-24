import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminRoute from "@/components/AdminRoute";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import FloatingChat from "./components/FloatingChat";
import { SiteContentProvider } from "./contexts/SiteContentContext";
import { SiteVisualsProvider } from "./contexts/SiteVisualsContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import About from "./pages/About";
import AdminTutorials from "./pages/AdminTutorials";
import AdminVisuals from "./pages/AdminVisuals";
import AdminContent from "./pages/AdminContent";
import AdminContacts from "./pages/AdminContacts";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminUsers from "./pages/AdminUsers";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import ServiceExpertiseDetail from "./pages/ServiceExpertiseDetail";
import Tutorials from "./pages/Tutorials";
import { trpc } from "./lib/trpc";

function VisitTracker() {
  const [location] = useLocation();
  const recordVisit = trpc.analytics.recordVisit.useMutation();

  useEffect(() => {
    if (location.startsWith("/admin")) return;
    const key = "propheties-anonymous-visitor";
    let visitorId = localStorage.getItem(key);
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(key, visitorId);
    }
    recordVisit.mutate({ visitorId, path: location });
  }, [location]);

  return null;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/services"} component={Services} />
      <Route path={"/services/:serviceSlug/:expertiseSlug"} component={ServiceExpertiseDetail} />
      <Route path={"/services/:slug"} component={ServiceDetail} />
      <Route path={"/a-propos"} component={About} />
      <Route path={"/tutoriels"} component={Tutorials} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/admin/connexion"} component={() => <AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path={"/admin"} component={() => <AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path={"/admin/demandes"} component={() => <AdminRoute><AdminContacts /></AdminRoute>} />
      <Route path={"/admin/tutoriels"} component={() => <AdminRoute><AdminTutorials /></AdminRoute>} />
      <Route path={"/admin/visuels"} component={() => <AdminRoute><AdminVisuals /></AdminRoute>} />
      <Route path={"/admin/visuals"} component={() => <AdminRoute><AdminVisuals /></AdminRoute>} />
      <Route path={"/admin/contenus"} component={() => <AdminRoute><AdminContent /></AdminRoute>} />
      <Route path={"/admin/administrateurs"} component={() => <AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <SiteVisualsProvider>
            <SiteContentProvider>
              <Toaster />
              <VisitTracker />
              <PrivateAwareContent />
            </SiteContentProvider>
          </SiteVisualsProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function PrivateAwareContent() {
  const [location] = useLocation();
  const isAdminPath = location.startsWith("/admin");

  useEffect(() => {
    let robots = document.querySelector('meta[name="robots"]');
    if (isAdminPath) {
      if (!robots) {
        robots = document.createElement("meta");
        robots.setAttribute("name", "robots");
        document.head.appendChild(robots);
      }
      robots.setAttribute("content", "noindex, nofollow, noarchive");
      return;
    }
    robots?.remove();
  }, [isAdminPath]);

  return <><Router />{!isAdminPath && <FloatingChat />}</>;
}

export default App;
