import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — WisDawn" }] }),
  component: AdminRedirect,
});

function AdminRedirect() {
  // Admin panel has moved to admin-standalone — redirect there
  if (typeof window !== "undefined") {
    window.location.href = "https://wisdawn-admin.web.app";
  }
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Redirecting to admin panel…</p>
    </div>
  );
}
