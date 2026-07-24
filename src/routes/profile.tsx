import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode, useEffect } from "react";
import {
  ChevronRight,
  User as UserIcon,
  HelpCircle,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { signOutUser, saveOnboardingData } from "@/lib/auth";

const ASSAM_DISTRICTS = [
  "Bajali","Baksa","Barpeta","Biswanath","Bongaigaon","Cachar",
  "Charaideo","Chirang","Darrang","Dhemaji","Dhubri","Dibrugarh",
  "Dima Hasao","Goalpara","Golaghat","Hailakandi","Hojai","Jorhat",
  "Kamrup","Kamrup Metropolitan (Guwahati)","Karbi Anglong","Karimganj",
  "Kokrajhar","Lakhimpur","Majuli","Morigaon (Marigaon)","Nagaon",
  "Nalbari","Sivasagar","Sonitpur","South Salmara–Mankachar",
  "Tamulpur","Tinsukia","Udalguri","West Karbi Anglong",
];

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — WisDawn" }] }),
  component: Profile,
});

function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const search = location.search as Record<string, string | undefined>;
  const { initials, displayName, displayEmail, profile, loading, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [editForm, setEditForm] = useState({ name: "", guardian: "", cls: "", dob: "", district: "", state: "", track: "" });
  const [saving, setSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Help & Support");

  // Help & Support Form State
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketStatus, setTicketStatus] = useState<"idle" | "submitting" | "success">("idle");

  // Sync name with loaded profile — only update when profile actually loads
  useEffect(() => {
    if (!loading && displayName && displayName !== "Learner") {
      setName(displayName);
    }
    if (!loading && profile) {
      setEditForm({
        name: profile.name || displayName || "",
        guardian: profile.guardian || "",
        cls: profile.cls || "",
        dob: profile.dob || "",
        district: profile.district || "",
        state: profile.state || "",
        track: profile.track || "",
      });
    }
  }, [loading, displayName, profile]);

  // Sync selected tab with search parameters if provided
  useEffect(() => {
    if (search?.tab) {
      const tabName = search.tab.toString();
      const matched = [
        "Help & Support",
      ].find((t) => {
        if (t === "Help & Support" && tabName.toLowerCase() === "help") return true;
        return t.toLowerCase() === tabName.toLowerCase();
      });
      if (matched) setSelectedItem(matched);
    }
  }, [search?.tab]);

  const handleSignOut = async () => {
    await signOutUser();
    navigate({ to: "/" });
  };

  return (
    <MobileFrame>
      {/* MOBILE-ONLY HEADER */}
      <div className="px-5 pt-3 md:hidden">
        <h1 className="text-2xl font-extrabold">Profile</h1>
        <p className="text-xs text-muted-foreground">Manage your profile and support</p>
      </div>

      {/* RESPONSIVE LAYOUT BODY */}
      <div className="flex-1 overflow-y-auto md:overflow-visible pb-6 px-5 md:px-0 pt-4">
        {/* DESKTOP HEADER */}
        <div className="hidden md:block mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <UserIcon className="h-6 w-6 text-primary" /> Profile
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your profile, learning stats, and support
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDE: USER DETAILS CARD & MENU LIST */}
          <div className="lg:col-span-1 space-y-4">
            {/* USER CARD */}
            <div className="rounded-3xl bg-primary-soft p-5 border border-primary/10">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary text-base font-bold text-primary-foreground">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  ) : (
                    <p className="truncate text-base font-bold text-foreground">{name}</p>
                  )}
                  <p className="truncate text-xs text-muted-foreground mt-0.5">{displayEmail}</p>
                  <span className="mt-2 inline-block rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                    {profile?.track || "Active Learner"}
                  </span>
                </div>
                <button
                  onClick={() => { setIsEditing(true); }}
                  className="rounded-full bg-card px-3 py-1.5 text-[10px] font-bold text-muted-foreground border border-border transition hover:bg-muted shrink-0"
                >
                  Edit Profile
                </button>
              </div>

              {/* Profile Stats Grid */}
              <div className="mt-5 grid grid-cols-4 gap-2 text-center">
                <Stat label="Courses" value={String(profile?.stats?.courses ?? 0)} />
                <Stat label="Badges" value={String(profile?.stats?.badges ?? 0)} />
                <Stat label="XP Points" value={(profile?.stats?.xp ?? 0).toLocaleString()} />
                <Stat label="Rank" value={profile?.stats?.rank ? `#${profile.stats.rank}` : "—"} />
              </div>
            </div>

            {/* SELECTION ITEMS LIST */}
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
              <Item
                icon={<HelpCircle className="h-4 w-4" />}
                label="Help & Support"
                active={selectedItem === "Help & Support"}
                onClick={() => setSelectedItem("Help & Support")}
              />
            </ul>

            <button
              onClick={handleSignOut}
              className="block w-full rounded-2xl border border-destructive/20 bg-destructive/5 py-3.5 text-center text-xs font-semibold text-destructive transition hover:bg-destructive/10"
            >
              Sign out
            </button>
          </div>

          {/* RIGHT SIDE: DETAIL PANEL CARD (Master-Detail side-by-side layout on desktop) */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs min-h-[300px]">
              <h2 className="text-base font-bold text-foreground mb-4 border-b border-border/80 pb-3 uppercase tracking-wider text-xs">
                {selectedItem}
              </h2>



              {selectedItem === "Help & Support" && (
                <div className="space-y-6 text-xs text-muted-foreground">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* FAQs Accordion */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-foreground mb-3 font-semibold">Frequently Asked Questions</h3>
                      <div className="space-y-3">
                        <FAQItem
                          question="How is my Rank calculated?"
                          answer="Your rank is updated daily based on the total XP points you earn from completing quizzes, viewing lessons, and maintaining your daily study streak."
                        />
                        <FAQItem
                          question="Can I reset my progress?"
                          answer="You can request progress updates or account resets by contacting our support team below."
                        />
                      </div>
                    </div>

                    {/* Support Ticket Form */}
                    <div className="bg-muted/10 border border-border/40 rounded-2xl p-4">
                      <h3 className="text-sm font-bold text-foreground mb-3">Contact Support</h3>
                      {ticketStatus === "success" ? (
                        <div className="text-center py-6 space-y-2">
                          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 text-lg">
                            ✓
                          </div>
                          <p className="font-bold text-foreground">Ticket Submitted!</p>
                          <p className="text-[10px] text-muted-foreground">We've received your query. Our support team will email you back within 24 hours.</p>
                          <button
                            onClick={() => setTicketStatus("idle")}
                            className="text-xs font-semibold text-primary underline pt-2 block mx-auto cursor-pointer"
                          >
                            Send another message
                          </button>
                        </div>
                      ) : (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!ticketSubject.trim() || !ticketMessage.trim()) return;
                            setTicketStatus("submitting");
                            setTimeout(() => {
                              setTicketStatus("success");
                              setTicketSubject("");
                              setTicketMessage("");
                            }, 800);
                          }}
                          className="space-y-3 text-xs"
                        >
                          <div>
                            <label className="block font-bold text-foreground mb-1">Subject</label>
                            <input
                              type="text"
                              value={ticketSubject}
                              onChange={(e) => setTicketSubject(e.target.value)}
                              placeholder="e.g. Account setup, Billing issue..."
                              className="w-full bg-card border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                              required
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-foreground mb-1">Message</label>
                            <textarea
                              value={ticketMessage}
                              onChange={(e) => setTicketMessage(e.target.value)}
                              placeholder="Describe your problem or request in detail..."
                              rows={3}
                              className="w-full bg-card border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={ticketStatus === "submitting"}
                            className="w-full bg-primary hover:bg-primary/95 text-white rounded-xl py-2 font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                          >
                            {ticketStatus === "submitting" ? "Submitting..." : "Submit Ticket"}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* Other Channels */}
                  <div className="pt-4 border-t border-border/60 flex flex-wrap gap-4 items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground text-xs">Still need help?</p>
                      <p className="text-[10px] text-muted-foreground">Reach us via email at support@wisdawn.com or call +1 (800) 555-LEARN.</p>
                    </div>
                    <div className="text-[10px] text-muted-foreground bg-primary-soft/50 border border-primary/10 rounded-xl px-3 py-1.5 font-medium">
                      Support Hours: Mon-Fri, 9:00 AM - 6:00 PM EST
                    </div>
                  </div>
                </div>
              )}

              {selectedItem === "Edit Profile" && (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-foreground">Personal Information</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Full Name</label>
                      <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Guardian Name</label>
                      <input value={editForm.guardian} onChange={(e) => setEditForm({ ...editForm, guardian: e.target.value })}
                        className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Class</label>
                      <select value={editForm.cls} onChange={(e) => setEditForm({ ...editForm, cls: e.target.value })}
                        className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option value="">Select Class</option>
                        <option value="Class 9">Class 9</option>
                        <option value="Class 10">Class 10</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Date of Birth</label>
                      <input type="date" value={editForm.dob} onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                        className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">State</label>
                      <select value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                        className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option value="">Select State</option>
                        <option value="Assam">Assam</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">District</label>
                      <select value={editForm.district} onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                        className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option value="">Select District</option>
                        {ASSAM_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Track</label>
                      <select value={editForm.track} onChange={(e) => setEditForm({ ...editForm, track: e.target.value })}
                        className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option value="">Select Track</option>
                        <option value="School Academy">School Academy</option>
                        <option value="Coding Bootcamp">Coding Bootcamp</option>
                      </select>
                    </div>
                  </div>
                  <button
                    disabled={saving}
                    onClick={async () => {
                      if (!user) return;
                      setSaving(true);
                      try {
                        await saveOnboardingData(user.uid, {
                          name: editForm.name,
                          guardian: editForm.guardian,
                          cls: editForm.cls,
                          track: editForm.track,
                          dob: editForm.dob,
                          district: editForm.district,
                          state: editForm.state,
                        });
                        setName(editForm.name);
                        setSelectedItem("Help & Support");
                        setIsEditing(false);
                      } finally {
                        setSaving(false);
                      }
                    }}
                    className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              )}


            </div>
          </div>
        </div>
      </div>
      

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-foreground">Edit Profile</h2>
              <button onClick={() => setIsEditing(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-muted hover:bg-muted/80 transition">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Full Name</label>
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Guardian Name</label>
                <input value={editForm.guardian} onChange={(e) => setEditForm({ ...editForm, guardian: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Class</label>
                <select value={editForm.cls} onChange={(e) => setEditForm({ ...editForm, cls: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Select Class</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Date of Birth</label>
                <input type="date" value={editForm.dob} onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">State</label>
                <select value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Select State</option>
                  <option value="Assam">Assam</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">District</label>
                <select value={editForm.district} onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Select District</option>
                  {ASSAM_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Track</label>
                <select value={editForm.track} onChange={(e) => setEditForm({ ...editForm, track: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Select Track</option>
                  <option value="School Academy">School Academy</option>
                  <option value="Coding Bootcamp">Coding Bootcamp</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setIsEditing(false)}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted transition">
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={async () => {
                  if (!user) return;
                  setSaving(true);
                  try {
                    await saveOnboardingData(user.uid, {
                      name: editForm.name,
                      guardian: editForm.guardian,
                      cls: editForm.cls,
                      track: editForm.track,
                      dob: editForm.dob,
                      district: editForm.district,
                      state: editForm.state,
                    });
                    setName(editForm.name);
                    setIsEditing(false);
                  } finally {
                    setSaving(false);
                  }
                }}
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileFrame>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card p-2 border border-border/60">
      <p className="text-sm font-extrabold text-primary">{value}</p>
      <p className="text-[9px] text-muted-foreground font-medium mt-0.5">{label}</p>
    </div>
  );
}

function Item({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold transition ${
          active
            ? "bg-primary-soft text-primary font-bold"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        }`}
      >
        <span
          className={`grid h-8 w-8 place-items-center rounded-lg ${active ? "bg-primary text-white" : "bg-primary-soft text-primary"}`}
        >
          {icon}
        </span>
        <span className="flex-1">{label}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    </li>
  );
}



function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-border/85 bg-card rounded-2xl overflow-hidden transition-all duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-3.5 text-left text-xs font-bold text-foreground hover:bg-muted/40 transition cursor-pointer"
      >
        <span>{question}</span>
        <span className={`text-muted-foreground text-sm font-semibold transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}>
          ›
        </span>
      </button>
      {isOpen && (
        <div className="p-3.5 pt-0 text-[11px] text-muted-foreground border-t border-border/20 bg-muted/10 leading-relaxed animate-fade-in">
          {answer}
        </div>
      )}
    </div>
  );
}
