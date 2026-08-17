import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { LayoutGroup } from "framer-motion";
import { BottomNav } from "../components/bottom-nav";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { auth } from "../lib/firebase";

// Routes that do NOT require authentication
const PUBLIC_ROUTES = ["/", "/onboarding", "/admin", "/auth"];

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: "#F4F7FB",
        color: "#0F172A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        margin: 0,
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #E2E8F0",
          borderRadius: "1.5rem",
          boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          maxWidth: "28rem",
          width: "100%",
          textAlign: "center",
          padding: "2.5rem 2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#4F46E5",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          Wisdawn
        </div>

        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.025em", margin: "0 0 0.5rem" }}>
          This page didn't load
        </h1>
        <p style={{ color: "#64748B", fontSize: "0.875rem", fontWeight: 500, margin: "0 0 2rem", lineHeight: 1.5 }}>
          Something went wrong on our end. You can try refreshing or head back home to continue learning.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => { router.invalidate(); reset(); }}
            style={{
              padding: "0.625rem 1.25rem",
              borderRadius: "9999px",
              fontSize: "0.875rem",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              border: "1px solid transparent",
              background: "#4F46E5",
              color: "#fff",
              boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
              transition: "all 0.2s ease-in-out",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#4338CA"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#4F46E5"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{
              padding: "0.625rem 1.25rem",
              borderRadius: "9999px",
              fontSize: "0.875rem",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              border: "1px solid #E2E8F0",
              background: "#ffffff",
              color: "#0F172A",
              boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
              transition: "all 0.2s ease-in-out",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#F8FAFC"; (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.05)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#ffffff"; (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)"; }}
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function PendingComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-3 text-sm font-medium text-muted-foreground shadow-sm">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
        Loading your learning space…
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  pendingComponent: PendingComponent,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" }, // Prevents zoom on mobile inputs
      { name: "theme-color", content: "#ffffff" }, // Required for PWA
      { title: "WisDawn — Learn Today, Lead Tomorrow" },
      {
        name: "description",
        content: "Your smart learning companion for School Science & Coding.",
      },
      { name: "author", content: "WisDawn" },
      { property: "og:title", content: "WisDawn — Learn Today, Lead Tomorrow" },
      {
        property: "og:description",
        content: "Your smart learning companion for School Science & Coding.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@WisDawn" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      // 🚀 THESE ARE THE CRUCIAL PWA LINKS THAT WERE MISSING 🚀
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/pwa-192x192.png" } 
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to content
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function ThemeManager() {
  const location = useLocation();
  const search = location.search as Record<string, string | undefined>;
  
  useEffect(() => {
    const track = search?.track || (typeof window !== "undefined" ? localStorage.getItem("wisdawn_track") : null) || "school";
    if (track === "coding") {
      document.documentElement.setAttribute("data-theme", "bootcamp");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    if (location.pathname === "/") {
      document.documentElement.setAttribute("data-landing", "true");
    } else {
      document.documentElement.removeAttribute("data-landing");
    }
  }, [search?.track, location.pathname]);

  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LayoutGroup>
        <div id="main-content" className="min-h-screen">
          <AuthGuard>
            <ThemeManager />
            <Outlet />
            <BottomNav />
          </AuthGuard>
        </div>
      </LayoutGroup>
    </QueryClientProvider>
  );
}

// ── Auth Guard ────────────────────────────────────────────────────────────────
function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isPublic = PUBLIC_ROUTES.some(
    (route) => location.pathname === route || location.pathname.startsWith(route + "/")
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setAuthChecked(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!isLoggedIn && !isPublic) {
      // Redirect unauthenticated users to login
      router.navigate({ to: "/" });
    }
  }, [authChecked, isLoggedIn, isPublic, location.pathname]);

  // Show children while auth state is being determined. 
  // Pages like /home and /learn have their own skeleton loaders based on useAuth loading state.
  if (!authChecked) {
    return <>{children}</>;
  }

  // Block protected page render until redirect happens
  if (!isLoggedIn && !isPublic) {
    return <PendingComponent />;
  }

  return <>{children}</>;
}
