import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const AdminLayout = lazy(() =>
  import("../../admin/components/AdminLayout").then((m) => ({ default: m.AdminLayout }))
);

// Dummy user for testing — remove auth when ready for production
const testUser = {
  uid: "test-admin",
  email: "admin@wisdawn.com",
  displayName: "Admin",
  photoURL: null,
} as any;

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — WisDawn" }] }),
  component: AdminPage,
});

function AdminPage() {
  return (
    // Full viewport override — escapes MobileFrame sidebar/layout completely
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "var(--background)",
        overflow: "auto",
      }}
    >
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Loading admin panel…
            </div>
          </div>
        }
      >
        <AdminLayout user={testUser} onLogout={() => {}} />
      </Suspense>
    </div>
  );
}
