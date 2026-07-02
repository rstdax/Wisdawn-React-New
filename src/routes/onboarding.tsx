import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  Calendar,
  Code2,
  MapPin,
  User as UserIcon,
  Users,
  Shield,
  Mail,
  Lock,
  GraduationCap,
  Lightbulb,
  CheckCircle,
} from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { Wisby } from "@/components/wisby";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Get started — WisDawn" }] }),
  component: Onboarding,
});

type Data = {
  name: string;
  guardian: string;
  cls: "Class 9" | "Class 10" | "";
  track: "School (Science)" | "Coding Bootcamp" | "";
  dob: string;
  district: string;
  state: string;
  email: string;
};

const desktopTips = [
  {
    text: "Thousands of students are already learning, growing, and achieving their goals.",
    icon: <Lightbulb className="h-5 w-5 text-yellow-500 fill-yellow-100 shrink-0" />,
  },
  {
    text: "We'll personalize your learning experience to help you grow faster.",
    icon: <GraduationCap className="h-5 w-5 text-primary shrink-0" />,
  },
  {
    text: "Your guardian helps keep your learning on track.",
    icon: <Users className="h-5 w-5 text-primary shrink-0" />,
  },
  {
    text: "Class 9 & 10 students get curriculum-aligned learning materials.",
    icon: <span className="text-base shrink-0">📘</span>,
  },
  {
    text: "Pick between School Academics or Coding Bootcamps to begin.",
    icon: <Code2 className="h-5 w-5 text-primary shrink-0" />,
  },
  {
    text: "Personalization helps us customize the speed of lessons.",
    icon: <span className="text-base shrink-0">🎂</span>,
  },
  {
    text: "Compare your progress with students in your district and state.",
    icon: <MapPin className="h-5 w-5 text-primary shrink-0" />,
  },
  {
    text: "Double check your details before starting your learning.",
    icon: <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />,
  },
  {
    text: "You are ready to access your personalized learning dashboard!",
    icon: <span className="text-base shrink-0">🎉</span>,
  },
];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Data>({
    name: "",
    guardian: "",
    cls: "",
    track: "",
    dob: "",
    district: "",
    state: "",
    email: "",
  });
  const [error, setError] = useState("");
  const total = 9;

  const next = () => setStep((s) => Math.min(total, s + 1));
  const back = () => (step === 0 ? navigate({ to: "/" }) : setStep(step - 1));

  const validateStep = () => {
    switch (step) {
      case 0:
        // Welcome step: validate email on desktop if entered
        return "";
      case 1:
        return d.name.trim().length >= 2 ? "" : "Please enter your full name to continue.";
      case 2:
        return d.guardian.trim().length >= 2 ? "" : "Please add your guardian's name.";
      case 3:
        return d.cls ? "" : "Please choose your class.";
      case 4:
        return d.track ? "" : "Please pick a learning path.";
      case 5:
        return d.dob ? "" : "Please enter your date of birth.";
      case 6:
        return d.district.trim() && d.state.trim() ? "" : "Please share your district and state.";
      default:
        return "";
    }
  };

  const handleNext = () => {
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }
    setError("");
    if (step === total - 1) {
      navigate({ to: "/home" });
      return;
    }
    if (step === 7) {
      setStep(8);
      return;
    }
    next();
  };

  return (
    <MobileFrame>
      {/* ========================================================================= */}
      {/* DESKTOP SPLIT-SCREEN ONBOARDING LAYOUT (md and up) */}
      {/* ========================================================================= */}
      <div className="hidden md:flex min-h-screen w-full bg-background font-sans">
        {/* Left Side: Branding & Testimonials */}
        <div className="w-[40%] bg-[linear-gradient(180deg,rgba(117,95,255,0.08),rgba(255,255,255,0.92))] border-r border-border p-10 flex flex-col justify-between">
          {/* Top Logo */}
          <div>
            <Wisby variant="logo" className="w-32" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              Learn Today, Lead Tomorrow
            </p>
          </div>

          {/* Center Mascot Image */}
          <div className="flex flex-col items-center my-6">
            <h2 className="text-2xl font-extrabold text-foreground text-center mb-4 leading-tight">
              Welcome to WisDawn!
            </h2>
            <p className="text-xs text-muted-foreground text-center max-w-xs -mt-2 mb-6">
              Your smart learning companion for School, Coding &amp; Beyond.
            </p>
            <Wisby variant={step === 8 ? "cheer" : "thumbs"} className="w-56" />
          </div>

          {/* Bottom Tip Badge & Carousel indicator */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm flex gap-3 items-start">
              {desktopTips[step].icon}
              <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                {desktopTips[step].text}
              </p>
            </div>

            {/* Carousel step dots */}
            <div className="flex gap-1.5 justify-center py-1">
              {Array.from({ length: total }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    i === step ? "bg-primary w-4" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Step Active Input Card */}
        <div className="flex-1 flex flex-col justify-center items-center p-12 bg-slate-50/30 relative">
          {/* Top Login Redirect */}
          <div className="absolute top-8 right-12 flex items-center gap-2 text-xs font-semibold">
            <span className="text-muted-foreground">Already have an account?</span>
            <Link to="/" className="text-primary hover:underline">
              Log in
            </Link>
          </div>

          {/* Center Form Card */}
          <div className="w-full max-w-[460px] bg-card border border-border rounded-3xl p-8 shadow-xs flex flex-col min-h-[480px]">
            {/* Card Back button & Progress */}
            <div className="flex justify-between items-center mb-6">
              {step > 0 ? (
                <button
                  onClick={back}
                  className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted text-muted-foreground transition"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              ) : (
                <div className="w-8" />
              )}

              <div className="text-right">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Step {step + 1} of {total}
                </span>
                {/* Segmented Line Progress */}
                <div className="flex gap-1 mt-1.5 w-32 justify-end">
                  {Array.from({ length: total }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Step specific UI for Desktop */}
            <div className="flex-1 flex flex-col">
              {step === 0 && (
                <div className="space-y-5 flex-1 flex flex-col">
                  <div>
                    <h1 className="text-2xl font-extrabold text-foreground">
                      Hi there! I'm Wispy 🦉
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                      I'll guide you on your learning journey.
                    </p>
                  </div>

                  {/* Badge */}
                  <div className="rounded-2xl bg-primary-soft/50 border border-primary/5 p-4 flex gap-3 items-center">
                    <Shield className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex-1 text-[11px] text-muted-foreground leading-snug">
                      <strong>We'll set up a few things</strong> to personalize your experience.
                    </div>
                  </div>

                  {/* Buttons */}
                  <button
                    onClick={handleNext}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:scale-[1.01] transition"
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-bold text-primary">
                      G
                    </span>
                    Continue with Google
                  </button>

                  <div className="relative text-center my-1 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    <span className="bg-card px-2 relative z-10">or continue with email</span>
                    <hr className="absolute top-1.5 left-0 w-full border-border/60" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={d.email}
                        onChange={(e) => setD({ ...d, email: e.target.value })}
                        className="flex-1 bg-transparent placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5 flex-1 flex flex-col">
                  <div>
                    <h1 className="text-2xl font-extrabold text-foreground">
                      What's your <span className="text-primary">full name?</span>
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                      Let's start with the basics.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">
                      Full Name
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={d.name}
                        onChange={(e) => {
                          setD({ ...d, name: e.target.value });
                          if (error) setError("");
                        }}
                        className="flex-1 bg-transparent placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 flex-1 flex flex-col">
                  <div>
                    <h1 className="text-2xl font-extrabold text-foreground">
                      Who is your <span className="text-primary">guardian?</span>
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">We'll need their name.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">
                      Guardian's Name
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Enter guardian's name"
                        value={d.guardian}
                        onChange={(e) => {
                          setD({ ...d, guardian: e.target.value });
                          if (error) setError("");
                        }}
                        className="flex-1 bg-transparent placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5 flex-1 flex flex-col">
                  <div>
                    <h1 className="text-2xl font-extrabold text-foreground">
                      Which <span className="text-primary">class are you in?</span>
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">Choose your current class.</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {(["Class 9", "Class 10"] as const).map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setD({ ...d, cls: c });
                          if (error) setError("");
                        }}
                        className={`flex w-full items-center gap-4 rounded-2xl border bg-muted/10 px-5 py-4 text-left transition ${
                          d.cls === c
                            ? "border-primary bg-primary-soft/50 ring-2 ring-primary/10"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-card border border-border shadow-xs text-lg">
                          📘
                        </span>
                        <span className="font-bold text-sm text-foreground">{c}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5 flex-1 flex flex-col">
                  <div>
                    <h1 className="text-2xl font-extrabold text-foreground">
                      What would you like <span className="text-primary">to learn?</span>
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                      You can choose one for now.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => {
                        setD({ ...d, track: "School (Science)" });
                        if (error) setError("");
                      }}
                      className={`flex w-full items-center gap-4 rounded-2xl border bg-muted/10 px-5 py-4 text-left transition ${
                        d.track === "School (Science)"
                          ? "border-primary bg-primary-soft/50 ring-2 ring-primary/10"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-card border border-border shadow-xs text-primary">
                        <Atom className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground">School (Science)</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Physics, Chemistry, Biology &amp; more
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setD({ ...d, track: "Coding Bootcamp" });
                        if (error) setError("");
                      }}
                      className={`flex w-full items-center gap-4 rounded-2xl border bg-muted/10 px-5 py-4 text-left transition ${
                        d.track === "Coding Bootcamp"
                          ? "border-primary bg-primary-soft/50 ring-2 ring-primary/10"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-card border border-border shadow-xs text-primary">
                        <Code2 className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground">Coding Bootcamp</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Learn coding step by step
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-5 flex-1 flex flex-col">
                  <div>
                    <h1 className="text-2xl font-extrabold text-foreground">
                      When were you <span className="text-primary">born?</span>
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                      This helps us personalize your experience.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">
                      Date of Birth
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="date"
                        value={d.dob}
                        onChange={(e) => {
                          setD({ ...d, dob: e.target.value });
                          if (error) setError("");
                        }}
                        className="flex-1 bg-transparent focus:outline-none text-foreground font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-5 flex-1 flex flex-col">
                  <div>
                    <h1 className="text-2xl font-extrabold text-foreground">
                      Where do you <span className="text-primary">live?</span>
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">Tell us your location.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">
                        District
                      </label>
                      <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Select District"
                          value={d.district}
                          onChange={(e) => {
                            setD({ ...d, district: e.target.value });
                            if (error) setError("");
                          }}
                          className="flex-1 bg-transparent placeholder:text-muted-foreground focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">
                        State
                      </label>
                      <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Select State"
                          value={d.state}
                          onChange={(e) => {
                            setD({ ...d, state: e.target.value });
                            if (error) setError("");
                          }}
                          className="flex-1 bg-transparent placeholder:text-muted-foreground focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 7 && (
                <div className="space-y-4 flex-1 flex flex-col">
                  <div>
                    <h1 className="text-2xl font-extrabold text-foreground">
                      Review your <span className="text-primary">details</span>
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                      Please check if everything looks right.
                    </p>
                  </div>

                  <div className="space-y-2.5 rounded-2xl border border-border bg-muted/20 p-4 text-xs font-semibold text-muted-foreground">
                    <Row label="Full Name" value={d.name || "—"} />
                    <Row label="Guardian" value={d.guardian || "—"} />
                    <Row label="Class" value={d.cls || "—"} />
                    <Row label="Course Type" value={d.track || "—"} />
                    <Row label="Date of Birth" value={d.dob || "—"} />
                    <Row
                      label="Location"
                      value={[d.district, d.state].filter(Boolean).join(", ") || "—"}
                    />
                  </div>
                </div>
              )}

              {step === 8 && (
                <div className="space-y-5 flex-1 flex flex-col justify-center text-center">
                  <div className="flex justify-center mb-2">
                    <Wisby variant="cheer" className="w-48" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-extrabold text-foreground">
                      All set, {d.name || "friend"}! 🎉
                    </h1>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Your learning journey starts now. Ready to explore amazing lessons?
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error & Action buttons */}
            <div className="mt-6 pt-4 border-t border-border/60">
              {error && <p className="text-xs text-destructive font-semibold mb-3">{error}</p>}

              <div className="flex gap-3">
                {step === 7 && (
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-2xl border border-border bg-card py-3 text-xs font-bold text-muted-foreground hover:bg-muted/50 transition"
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-xs font-bold text-white shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50"
                >
                  {step === total - 1 ? "Go to Dashboard" : step === 7 ? "Finish ✓" : "Continue"}
                  {step !== 7 && step !== total - 1 && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>

              {/* Security footer text */}
              <div className="flex justify-center items-center gap-1.5 text-[9px] text-muted-foreground mt-4 font-bold uppercase tracking-wider">
                <Lock className="h-3 w-3" />
                <span>Your information is safe with us.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE ONBOARDING LAYOUT (less than md) */}
      {/* ========================================================================= */}
      <div className="md:hidden flex flex-1 flex-col">
        <header className="flex items-center px-5 pt-2">
          <button
            onClick={back}
            className="grid h-9 w-9 place-items-center rounded-full text-foreground active:bg-muted"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </header>
        <div className="flex flex-1 flex-col px-6 pb-6">
          {step === 0 && (
            <StepWrap>
              <h1 className="text-3xl font-extrabold leading-tight">
                <span className="text-primary">Hi there!</span>
                <br /> I&apos;m <span className="text-primary">Wisby</span> 🦉
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                I&apos;ll guide you on your learning journey.
              </p>
              <MascotArea
                variant="thumbs"
                bubble={"We'll set up a few things to personalize your experience."}
              />
            </StepWrap>
          )}
          {step === 1 && (
            <StepWrap>
              <Title bold="full name?">What&apos;s your</Title>
              <p className="mt-2 text-sm text-muted-foreground">
                Let&apos;s start with the basics.
              </p>
              <Field
                icon={<UserIcon className="h-4 w-4" />}
                placeholder="Enter your full name"
                value={d.name}
                onChange={(v) => {
                  setD({ ...d, name: v });
                  if (error) setError("");
                }}
              />
              <MascotArea />
            </StepWrap>
          )}
          {step === 2 && (
            <StepWrap>
              <Title bold="guardian?">Who is your</Title>
              <p className="mt-2 text-sm text-muted-foreground">We&apos;ll need their name.</p>
              <Field
                icon={<Users className="h-4 w-4" />}
                placeholder="Enter guardian's name"
                value={d.guardian}
                onChange={(v) => {
                  setD({ ...d, guardian: v });
                  if (error) setError("");
                }}
              />
              <MascotArea bubble={"They'll be part of your learning journey too."} />
            </StepWrap>
          )}
          {step === 3 && (
            <StepWrap>
              <Title bold="class are you in?">Which</Title>
              <p className="mt-2 text-sm text-muted-foreground">Choose your current class.</p>
              <div className="mt-6 space-y-3">
                {(["Class 9", "Class 10"] as const).map((c) => (
                  <Choice
                    key={c}
                    active={d.cls === c}
                    onClick={() => {
                      setD({ ...d, cls: c });
                      if (error) setError("");
                    }}
                    icon={<span className="text-lg">📘</span>}
                    title={c}
                  />
                ))}
              </div>
              <MascotArea bubble={"Great! We have content just for your class."} />
            </StepWrap>
          )}
          {step === 4 && (
            <StepWrap>
              <Title bold="to learn?">What would you like</Title>
              <p className="mt-2 text-sm text-muted-foreground">You can choose one for now.</p>
              <div className="mt-6 space-y-3">
                <Choice
                  active={d.track === "School (Science)"}
                  onClick={() => {
                    setD({ ...d, track: "School (Science)" });
                    if (error) setError("");
                  }}
                  icon={<Atom className="h-5 w-5 text-primary" />}
                  title="School (Science)"
                  sub="Physics, Chemistry, Biology & more"
                />
                <Choice
                  active={d.track === "Coding Bootcamp"}
                  onClick={() => {
                    setD({ ...d, track: "Coding Bootcamp" });
                    if (error) setError("");
                  }}
                  icon={<Code2 className="h-5 w-5 text-primary" />}
                  title="Coding Bootcamp"
                  sub="Learn coding step by step"
                />
              </div>
              <MascotArea bubble={"No worries! You can explore more later."} />
            </StepWrap>
          )}
          {step === 5 && (
            <StepWrap>
              <Title bold="born?">When were you</Title>
              <p className="mt-2 text-sm text-muted-foreground">
                This helps us personalize your experience.
              </p>
              <Field
                icon={<Calendar className="h-4 w-4" />}
                placeholder="Select your date of birth"
                type="date"
                value={d.dob}
                onChange={(v) => {
                  setD({ ...d, dob: v });
                  if (error) setError("");
                }}
              />
              <MascotArea bubble={"Happy early birthday! 🎂"} />
            </StepWrap>
          )}
          {step === 6 && (
            <StepWrap>
              <Title bold="live?">Where do you</Title>
              <p className="mt-2 text-sm text-muted-foreground">Tell us your location.</p>
              <Field
                icon={<MapPin className="h-4 w-4" />}
                placeholder="Select District"
                value={d.district}
                onChange={(v) => {
                  setD({ ...d, district: v });
                  if (error) setError("");
                }}
              />
              <Field
                icon={<MapPin className="h-4 w-4" />}
                placeholder="Select State"
                value={d.state}
                onChange={(v) => {
                  setD({ ...d, state: v });
                  if (error) setError("");
                }}
              />
              <MascotArea bubble={"So we can show you the best content near you."} />
            </StepWrap>
          )}
          {step === 7 && (
            <StepWrap>
              <h1 className="text-3xl font-extrabold">
                Review your <span className="text-primary">details</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Please check if everything looks right.
              </p>
              <div className="mt-5 space-y-3 rounded-2xl border border-border bg-card p-4 text-sm">
                <Row label="Full Name" value={d.name || "—"} />
                <Row label="Guardian" value={d.guardian || "—"} />
                <Row label="Class" value={d.cls || "—"} />
                <Row label="Course Type" value={d.track || "—"} />
                <Row label="Date of Birth" value={d.dob || "—"} />
                <Row
                  label="Location"
                  value={[d.district, d.state].filter(Boolean).join(", ") || "—"}
                />
              </div>
              <MascotArea bubble={"Looks perfect! You're all set to start learning."} />
            </StepWrap>
          )}
          {step === 8 && (
            <StepWrap>
              <div className="mt-8 text-center">
                <Wisby variant="cheer" className="mx-auto w-56" />
                <h1 className="mt-2 text-2xl font-extrabold">All set, {d.name || "friend"}! 🎉</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your learning journey starts now.
                </p>
                <div className="mt-8 rounded-2xl border border-border bg-card px-5 py-4 text-sm">
                  Ready to explore amazing lessons?
                </div>
              </div>
            </StepWrap>
          )}

          <div className="mt-auto pt-6">
            <Progress step={step} total={total} />
            {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
            <div className="mt-5 flex gap-3">
              {step === 7 && (
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold"
                >
                  Edit
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.99]"
              >
                {step === total - 1 ? "Go to Dashboard" : step === 7 ? "Finish ✓" : "Next"}
                {step !== 7 && step !== total - 1 && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}

function StepWrap({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 flex-col">{children}</div>;
}
function Title({ children, bold }: { children: ReactNode; bold: string }) {
  return (
    <h1 className="text-3xl font-extrabold leading-tight">
      {children} <span className="text-primary">{bold}</span>
    </h1>
  );
}
function Field({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  icon?: ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
      />
    </div>
  );
}
function Choice({
  active,
  onClick,
  icon,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  sub?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border bg-card px-4 py-3.5 text-left transition ${
        active ? "border-primary ring-2 ring-primary/20" : "border-border"
      }`}
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft">{icon}</span>
      <div className="min-w-0">
        <div className="font-semibold text-sm">{title}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
    </button>
  );
}
function Bubble({ children, small }: { children: ReactNode; small?: boolean }) {
  return (
    <div
      className={`mt-6 inline-block max-w-[80%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-2.5 ${
        small ? "text-xs" : "text-sm"
      } text-muted-foreground shadow-sm`}
    >
      {children}
    </div>
  );
}
function MascotArea({
  variant = "thumbs" as "thumbs" | "cheer",
  bubble,
  small,
}: {
  variant?: "thumbs" | "cheer";
  bubble?: string;
  small?: boolean;
}) {
  return (
    <div className="mt-2 flex flex-1 items-end justify-center pb-2">
      <div className="flex items-end gap-4">
        <Wisby variant={variant} className="w-56" />
        {bubble && (
          <div className="mb-6 max-w-xs">
            <Bubble small={small}>{bubble}</Bubble>
          </div>
        )}
      </div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-foreground/80">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
function Progress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
        />
      ))}
    </div>
  );
}
