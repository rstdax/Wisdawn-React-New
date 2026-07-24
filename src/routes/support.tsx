import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { useState } from "react";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Help & Support — WisDawn" }] }),
  component: Support,
});

function Support() {
  const navigate = useNavigate();
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketStatus, setTicketStatus] = useState<"idle" | "submitting" | "success">("idle");

  return (
    <MobileFrame>
      <header className="flex md:hidden items-center gap-3 px-5 pt-2 pb-4">
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="grid h-9 w-9 place-items-center rounded-full active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-bold">Help & Support</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="hidden md:block mb-6 pt-6">
          <button
            onClick={() => navigate({ to: "/profile" })}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition mb-4 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Profile
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" /> Help & Support
          </h1>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm mt-4 md:mt-0">
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
        </div>
      </div>
    </MobileFrame>
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
