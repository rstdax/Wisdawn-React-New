import { useState } from "react";
import type { User } from "firebase/auth";
import {
  LayoutDashboard, BookOpen, Video, FileText,
  MessageSquare, Users, LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import { SubjectsPanel } from "./SubjectsPanel";
import { ChaptersPanel } from "./ChaptersPanel";
import { ResourcesPanel } from "./ResourcesPanel";
import { QAPanel } from "./QAPanel";
import { DiscussionsPanel } from "./DiscussionsPanel";
import { DashboardPanel } from "./DashboardPanel";

type Panel = "dashboard" | "subjects" | "chapters" | "resources" | "qa" | "discussions";

const navItems: { id: Panel; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "subjects", label: "Subjects", icon: BookOpen },
  { id: "chapters", label: "Chapters & Videos", icon: Video },
  { id: "resources", label: "Resources", icon: FileText },
  { id: "qa", label: "Q&A", icon: MessageSquare },
  { id: "discussions", label: "Discussions", icon: Users },
];

const SIDEBAR_W = 256; // px

export function AdminLayout({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [active, setActive] = useState<Panel>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navTo = (id: Panel) => { setActive(id); setSidebarOpen(false); };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "inherit" }}>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 30, background: "rgba(0,0,0,0.4)" }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        width: SIDEBAR_W,
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        borderRight: "1px solid #e5e7eb",
        zIndex: 40,
        transform: sidebarOpen ? "translateX(0)" : undefined,
        boxShadow: sidebarOpen ? "4px 0 24px rgba(0,0,0,0.12)" : "none",
        transition: "transform 0.3s",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontWeight: 800, color: "var(--color-primary, #6366f1)", fontSize: 18, margin: 0 }}>WisDawn</p>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 2, margin: 0 }}>Admin Panel</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ display: sidebarOpen ? "grid" : "none", placeItems: "center", height: 32, width: 32, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer" }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => navTo(id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 16, border: "none",
                cursor: "pointer", textAlign: "left", marginBottom: 4,
                fontWeight: 600, fontSize: 14,
                background: active === id ? "var(--color-primary, #6366f1)" : "transparent",
                color: active === id ? "#fff" : "#6b7280",
                transition: "all 0.15s",
              }}
            >
              <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
              {label}
              {active === id && <ChevronRight style={{ width: 14, height: 14, marginLeft: "auto", opacity: 0.7 }} />}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ borderTop: "1px solid #e5e7eb", padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            {user.photoURL
              ? <img src={user.photoURL} alt="avatar" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
              : <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-primary,#6366f1)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12 }}>{user.displayName?.[0] ?? "A"}</div>
            }
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.displayName}</p>
              <p style={{ fontSize: 10, color: "#9ca3af", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
            </div>
          </div>
          <button onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 16, border: "none", background: "transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#9ca3af" }}>
            <LogOut style={{ width: 14, height: 14 }} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content — always offset by sidebar width ── */}
      <div style={{ marginLeft: SIDEBAR_W, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", minWidth: 0 }}>
        {/* Topbar */}
        <header style={{ display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid #e5e7eb", background: "#fff", padding: "14px 20px", position: "sticky", top: 0, zIndex: 20 }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ display: "none", placeItems: "center", width: 32, height: 32, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer" }}
          >
            <Menu style={{ width: 16, height: 16 }} />
          </button>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
            {navItems.find((n) => n.id === active)?.label ?? "Admin"}
          </h2>
        </header>

        {/* Panel */}
        <main style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
          {active === "dashboard" && <DashboardPanel onNavigate={navTo} />}
          {active === "subjects" && <SubjectsPanel />}
          {active === "chapters" && <ChaptersPanel />}
          {active === "resources" && <ResourcesPanel />}
          {active === "qa" && <QAPanel />}
          {active === "discussions" && <DiscussionsPanel />}
        </main>
      </div>
    </div>
  );
}
