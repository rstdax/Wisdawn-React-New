import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
};

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
  });
  const total = 9;

  const next = () => setStep((s) => Math.min(total, s + 1));
  const back = () => (step === 0 ? navigate({ to: "/" }) : setStep(step - 1));

  return (
    <MobileFrame>
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
            <Bubble>We&apos;ll set up a few things to personalize your experience.</Bubble>
            <MascotArea variant="thumbs" />
          </StepWrap>
        )}
        {step === 1 && (
          <StepWrap>
            <Title bold="full name?">What&apos;s your</Title>
            <p className="mt-2 text-sm text-muted-foreground">Let&apos;s start with the basics.</p>
            <Field
              icon={<UserIcon className="h-4 w-4" />}
              placeholder="Enter your full name"
              value={d.name}
              onChange={(v) => setD({ ...d, name: v })}
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
              onChange={(v) => setD({ ...d, guardian: v })}
            />
            <Bubble small>They&apos;ll be part of your learning journey too.</Bubble>
            <MascotArea />
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
                  onClick={() => setD({ ...d, cls: c })}
                  icon={<span className="text-lg">📘</span>}
                  title={c}
                />
              ))}
            </div>
            <Bubble small>Great! We have content just for your class.</Bubble>
            <MascotArea />
          </StepWrap>
        )}
        {step === 4 && (
          <StepWrap>
            <Title bold="to learn?">What would you like</Title>
            <p className="mt-2 text-sm text-muted-foreground">You can choose one for now.</p>
            <div className="mt-6 space-y-3">
              <Choice
                active={d.track === "School (Science)"}
                onClick={() => setD({ ...d, track: "School (Science)" })}
                icon={<Atom className="h-5 w-5 text-primary" />}
                title="School (Science)"
                sub="Physics, Chemistry, Biology & more"
              />
              <Choice
                active={d.track === "Coding Bootcamp"}
                onClick={() => setD({ ...d, track: "Coding Bootcamp" })}
                icon={<Code2 className="h-5 w-5 text-primary" />}
                title="Coding Bootcamp"
                sub="Learn coding step by step"
              />
            </div>
            <Bubble small>No worries! You can explore more later.</Bubble>
            <MascotArea />
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
              onChange={(v) => setD({ ...d, dob: v })}
            />
            <Bubble small>Happy early birthday! 🎂</Bubble>
            <MascotArea />
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
              onChange={(v) => setD({ ...d, district: v })}
            />
            <Field
              icon={<MapPin className="h-4 w-4" />}
              placeholder="Select State"
              value={d.state}
              onChange={(v) => setD({ ...d, state: v })}
            />
            <Bubble small>So we can show you the best content near you.</Bubble>
            <MascotArea />
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
            <Bubble small>Looks perfect! You&apos;re all set to start learning.</Bubble>
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
              onClick={() =>
                step === total - 1 ? navigate({ to: "/home" }) : step === 7 ? setStep(8) : next()
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.99]"
            >
              {step === total - 1 ? "Go to Dashboard" : step === 7 ? "Finish ✓" : "Next"}
              {step !== 7 && step !== total - 1 && <ArrowRight className="h-4 w-4" />}
            </button>
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
function MascotArea({ variant = "thumbs" as "thumbs" | "cheer" }) {
  return (
    <div className="mt-2 flex flex-1 items-end justify-center pb-2">
      <Wisby variant={variant} className="w-56" />
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
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
