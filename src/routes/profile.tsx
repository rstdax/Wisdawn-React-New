import { createFileRoute, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode, useEffect } from "react";
import {
  Bell,
  Download,
  Bookmark,
  Award,
  Settings,
  ChevronRight,
  User as UserIcon,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { signOutUser } from "@/lib/auth";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — WisDawn" }] }),
  component: Profile,
});

function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const search = location.search as Record<string, string | undefined>;
  const { initials, displayName, displayEmail, profile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [selectedItem, setSelectedItem] = useState("Study Reminders");

  // Messages / Chat State
  const [chats, setChats] = useState([
    {
      id: "wisby",
      name: "Wisby AI Companion",
      avatar: "🤖",
      lastMessage: "Hey Rahul! Ready to finish Chapter 2 Chemical Reactions today?",
      time: "10:30 AM",
      unread: true,
      messages: [
        { sender: "other", text: "Hello Rahul! Welcome to Wisdawn. I am Wisby, your learning partner.", time: "Yesterday" },
        { sender: "user", text: "Hi Wisby! Can you help me study Chemistry?", time: "Yesterday" },
        { sender: "other", text: "Absolutely! I can explain concepts, quiz you, or help you solve equations.", time: "Yesterday" },
        { sender: "other", text: "Hey Rahul! Ready to finish Chapter 2 Chemical Reactions today?", time: "10:30 AM" }
      ]
    },
    {
      id: "amit",
      name: "Dr. Amit (Chemistry)",
      avatar: "👨‍🏫",
      lastMessage: "Great job on the practice test. Let me know if you have questions.",
      time: "Yesterday",
      unread: false,
      messages: [
        { sender: "user", text: "Hello Sir, I finished the homework on balancing equations.", time: "Yesterday" },
        { sender: "other", text: "Great job on the practice test. Let me know if you have questions.", time: "Yesterday" }
      ]
    },
    {
      id: "group",
      name: "Class 10 Study Group",
      avatar: "👥",
      lastMessage: "Who's up for a study session tonight at 8?",
      time: "2 days ago",
      unread: false,
      messages: [
        { sender: "other", senderName: "Sneha", text: "Did anyone solve question 4 on page 24?", time: "2 days ago" },
        { sender: "other", senderName: "Aman", text: "Yes, I got 12g as the answer.", time: "2 days ago" },
        { sender: "other", senderName: "Sneha", text: "Ah, thanks! I made a calculation error.", time: "2 days ago" },
        { sender: "other", senderName: "Aman", text: "Who's up for a study session tonight at 8?", time: "2 days ago" }
      ]
    }
  ]);
  const [activeChatId, setActiveChatId] = useState("wisby");
  const [newMessageText, setNewMessageText] = useState("");

  // Help & Support Form State
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketStatus, setTicketStatus] = useState<"idle" | "submitting" | "success">("idle");

  // Sync name with loaded profile — only update when profile actually loads
  useEffect(() => {
    if (!loading && displayName && displayName !== "Learner") {
      setName(displayName);
    }
  }, [loading, displayName]);

  // Sync selected tab with search parameters if provided
  useEffect(() => {
    if (search?.tab) {
      const tabName = search.tab.toString();
      const matched = [
        "Study Reminders",
        "Downloads",
        "Bookmarks",
        "Achievements",
        "Messages",
        "Help & Support",
        "Settings",
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
        <p className="text-xs text-muted-foreground">Manage your settings and achievements</p>
      </div>

      {/* RESPONSIVE LAYOUT BODY */}
      <div className="flex-1 overflow-y-auto md:overflow-visible pb-6 px-5 md:px-0 pt-4">
        {/* DESKTOP HEADER */}
        <div className="hidden md:block mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <UserIcon className="h-6 w-6 text-primary" /> Profile &amp; Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your settings, badges, and learning reports
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
                  onClick={() => setIsEditing((value) => !value)}
                  className="rounded-full bg-card px-3 py-1.5 text-[10px] font-bold text-muted-foreground border border-border transition hover:bg-muted shrink-0"
                >
                  {isEditing ? "Save" : "Edit Profile"}
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
                icon={<Bell className="h-4 w-4" />}
                label="Study Reminders"
                active={selectedItem === "Study Reminders"}
                onClick={() => setSelectedItem("Study Reminders")}
              />
              <Item
                icon={<Download className="h-4 w-4" />}
                label="Downloads"
                active={selectedItem === "Downloads"}
                onClick={() => setSelectedItem("Downloads")}
              />
              <Item
                icon={<Bookmark className="h-4 w-4" />}
                label="Bookmarks"
                active={selectedItem === "Bookmarks"}
                onClick={() => setSelectedItem("Bookmarks")}
              />
              <Item
                icon={<Award className="h-4 w-4" />}
                label="Achievements"
                active={selectedItem === "Achievements"}
                onClick={() => setSelectedItem("Achievements")}
              />
              <Item
                icon={<MessageSquare className="h-4 w-4" />}
                label="Messages"
                active={selectedItem === "Messages"}
                onClick={() => setSelectedItem("Messages")}
              />
              <Item
                icon={<HelpCircle className="h-4 w-4" />}
                label="Help & Support"
                active={selectedItem === "Help & Support"}
                onClick={() => setSelectedItem("Help & Support")}
              />
              <Item
                icon={<Settings className="h-4 w-4" />}
                label="Settings"
                active={selectedItem === "Settings"}
                onClick={() => setSelectedItem("Settings")}
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

              {selectedItem === "Study Reminders" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Daily study reminders</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Receive gentle nudges for your next class or practice set.
                      </p>
                    </div>
                    <button
                      onClick={() => setRemindersEnabled((value) => !value)}
                      className={`rounded-full px-4 py-2 text-xs font-bold transition shadow-xs ${
                        remindersEnabled
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {remindersEnabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-primary-soft/50 border border-primary/5 text-xs text-muted-foreground font-medium">
                    {remindersEnabled
                      ? "Notifications will be delivered to your device at 9:00 AM daily."
                      : "Reminders are paused. You will not receive any daily study streaks warnings."}
                  </div>
                </div>
              )}

              {selectedItem === "Downloads" && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-foreground">Offline Saved Materials</p>

                  <div className="space-y-3">
                    <DownloadRow
                      title="1. Introduction to Chemical Reactions"
                      type="PDF"
                      size="1.2 MB"
                    />
                    <DownloadRow title="2. Types of Chemical Reactions" type="Video" size="16:25" />
                    <DownloadRow title="3. HTML Basics Lesson 1" type="PDF" size="842 KB" />
                    <DownloadRow title="4. Web Dev Python Intro" type="Video" size="14:10" />
                  </div>

                  <p className="text-xs text-muted-foreground pt-2">
                    Total offline cache storage used: <strong>48 MB</strong>. You can clear the
                    cache in Settings.
                  </p>
                </div>
              )}

              {selectedItem === "Bookmarks" && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Bookmarked Chapters</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <BookmarkCard
                      title="Chemical Reactions"
                      desc="Class 10 Science"
                      to="/chapter/chemical-reactions"
                    />
                    <BookmarkCard
                      title="Cell Structure &amp; Division"
                      desc="Class 9 Science"
                      to="/learn"
                    />
                    <BookmarkCard
                      title="Python basics for beginners"
                      desc="Coding Bootcamp"
                      to="/learn"
                    />
                  </div>
                </div>
              )}

              {selectedItem === "Achievements" && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-foreground">Your Achievements Badges</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <BadgeCard
                      title="5-Day Streak"
                      desc="Active study streak unlocked"
                      points="+50 XP"
                      icon="🔥"
                    />
                    <BadgeCard
                      title="Quiz Master"
                      desc="Score 90% in MCQs quiz"
                      points="+100 XP"
                      icon="🏆"
                    />
                    <BadgeCard
                      title="Perfect Science"
                      desc="Completed Physics Class 10"
                      points="+150 XP"
                      icon="🔬"
                    />
                  </div>
                </div>
              )}

              {selectedItem === "Messages" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[400px]">
                  {/* Chat conversations list */}
                  <div className="md:col-span-1 border-r border-border/60 pr-4 overflow-y-auto space-y-2 h-full">
                    {chats.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => {
                          setActiveChatId(chat.id);
                          // Clear unread status
                          setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: false } : c));
                        }}
                        className={`flex items-start gap-3 w-full p-2.5 rounded-xl text-left transition ${activeChatId === chat.id ? "bg-primary-soft text-primary font-semibold" : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        <div className="text-xl bg-card border border-border/60 rounded-xl p-2 h-10 w-10 flex items-center justify-center shrink-0 shadow-xs">
                          {chat.avatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-baseline">
                            <span className={`text-xs truncate ${chat.unread ? "font-bold text-foreground" : "font-semibold"}`}>
                              {chat.name}
                            </span>
                            <span className="text-[9px] text-muted-foreground shrink-0">{chat.time}</span>
                          </div>
                          <p className="text-[10px] truncate text-muted-foreground mt-0.5">{chat.lastMessage}</p>
                        </div>
                        {chat.unread && (
                          <span className="h-2 w-2 rounded-full bg-destructive mt-2 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Active chat window */}
                  <div className="md:col-span-2 flex flex-col h-full min-h-[300px]">
                    {/* Chat messages */}
                    <div className="flex-1 overflow-y-auto space-y-3 pb-4 pr-1">
                      {chats.find((c) => c.id === activeChatId)?.messages.map((msg, idx) => {
                        const isUser = msg.sender === "user";
                        return (
                          <div
                            key={idx}
                            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                          >
                            <div className="max-w-[80%]">
                              {!isUser && "senderName" in msg && (
                                <span className="text-[9px] text-muted-foreground ml-2 mb-0.5 block font-bold">
                                  {msg.senderName}
                                </span>
                              )}
                              <div
                                className={`p-3 rounded-2xl text-xs ${isUser
                                  ? "bg-primary text-primary-foreground rounded-tr-none"
                                  : "bg-muted text-foreground rounded-tl-none border border-border/30"
                                  }`}
                              >
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                              </div>
                              <span className="text-[9px] text-muted-foreground mt-1 ml-1 block text-right">
                                {msg.time}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chat Input form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newMessageText.trim()) return;

                        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        // Append user message
                        setChats(prev => prev.map(c => {
                          if (c.id === activeChatId) {
                            return {
                              ...c,
                              lastMessage: newMessageText,
                              time: timeString,
                              messages: [
                                ...c.messages,
                                { sender: "user", text: newMessageText, time: timeString }
                              ]
                            };
                          }
                          return c;
                        }));

                        const userQuery = newMessageText;
                        setNewMessageText("");

                        // Add a mock response from Wisby AI if active chat is wisby
                        if (activeChatId === "wisby") {
                          setTimeout(() => {
                            setChats(prev => prev.map(c => {
                              if (c.id === "wisby") {
                                const botMsg = {
                                  sender: "other",
                                  text: `I'm on it! Let me help you with: "${userQuery}". You can also check out the 'Learn' tab for more courses!`,
                                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                };
                                return {
                                  ...c,
                                  lastMessage: botMsg.text,
                                  time: botMsg.time,
                                  messages: [...c.messages, botMsg]
                                };
                              }
                              return c;
                            }));
                          }, 1000);
                        }
                      }}
                      className="border-t border-border pt-3 flex gap-2"
                    >
                      <input
                        type="text"
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                      />
                      <button
                        type="submit"
                        className="bg-primary hover:bg-primary/90 text-white rounded-xl px-4 py-2 text-xs font-semibold shadow-xs"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {selectedItem === "Help & Support" && (
                <div className="space-y-6 text-xs text-muted-foreground">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* FAQs Accordion */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-foreground mb-3 font-semibold">Frequently Asked Questions</h3>
                      <div className="space-y-3">
                        <FAQItem
                          question="How do I study offline?"
                          answer="Go to the Profile tab, select Downloads, and you will see your saved offline materials. You can download lessons by clicking the download icon next to any chapter."
                        />
                        <FAQItem
                          question="How is my Rank calculated?"
                          answer="Your rank is updated daily based on the total XP points you earn from completing quizzes, viewing lessons, and maintaining your daily study streak."
                        />
                        <FAQItem
                          question="Can I reset my progress?"
                          answer="Yes, you can reset your progress for specific subjects or your entire account in the Settings tab, under the Privacy options."
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

              {selectedItem === "Settings" && (
                <div className="space-y-4 text-xs font-semibold text-muted-foreground">
                  <p className="text-sm font-bold text-foreground mb-1">
                    Account &amp; Language Settings
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/40">
                      <span>Interface Language</span>
                      <select className="bg-card border border-border rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-bold">
                        <option>English</option>
                        <option>Assamese (অসমীয়া)</option>
                        <option>Hindi (हिंदी)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/40">
                      <span>Dark Theme</span>
                      <button className="rounded-full bg-muted border border-border px-3.5 py-1.5 font-bold text-muted-foreground hover:bg-muted/80">
                        System Default
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/40">
                      <span>Privacy Settings</span>
                      <button className="text-primary hover:underline">Manage Privacy</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
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

function DownloadRow({ title, type, size }: { title: string; type: string; size: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/40 text-xs">
      <div className="flex items-center gap-3">
        <span className="bg-primary-soft text-primary font-bold px-2 py-0.5 rounded text-[10px]">
          {type}
        </span>
        <span className="font-semibold text-foreground truncate">{title}</span>
      </div>
      <span className="text-muted-foreground font-bold">{size}</span>
    </div>
  );
}

function BookmarkCard({ title, desc, to }: { title: string; desc: string; to: string }) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      className="block rounded-2xl border border-border bg-card p-4 transition hover:shadow-xs"
    >
      <p className="text-xs font-bold text-foreground leading-tight">{title}</p>
      <p className="text-[10px] text-muted-foreground mt-1 font-semibold">{desc}</p>
    </Link>
  );
}

function BadgeCard({
  title,
  desc,
  points,
  icon,
}: {
  title: string;
  desc: string;
  points: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center flex flex-col items-center shadow-xs">
      <span className="text-2xl mb-1">{icon}</span>
      <p className="text-xs font-bold text-foreground leading-tight">{title}</p>
      <p className="text-[9px] text-muted-foreground mt-1 leading-snug">{desc}</p>
      <span className="text-[9px] font-extrabold text-primary bg-primary-soft px-2 py-0.5 rounded-md mt-3 block">
        {points}
      </span>
    </div>
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
