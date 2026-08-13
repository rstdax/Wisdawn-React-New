import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { saveOnboardingData } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Code2,
  MapPin,
  User as UserIcon,
  Users,
  GraduationCap,
  Atom,
  Check,
  CheckCircle2,
  Sparkles,
  PartyPopper,
} from "lucide-react";
import { format } from "date-fns";
import { MobileFrame } from "@/components/mobile-frame";
import { Wisby } from "@/components/wisby";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Get started — Wisdawn" }] }),
  component: Onboarding,
});

/* -------------------------------------------------------------------------- */
/* DATA                                                                       */
/* -------------------------------------------------------------------------- */

const ASSAM_DISTRICTS = [
  "Bajali",
  "Baksa",
  "Barpeta",
  "Biswanath",
  "Bongaigaon",
  "Cachar",
  "Charaideo",
  "Chirang",
  "Darrang",
  "Dhemaji",
  "Dhubri",
  "Dibrugarh",
  "Dima Hasao",
  "Goalpara",
  "Golaghat",
  "Hailakandi",
  "Hojai",
  "Jorhat",
  "Kamrup",
  "Kamrup Metropolitan (Guwahati)",
  "Karbi Anglong",
  "Karimganj",
  "Kokrajhar",
  "Lakhimpur",
  "Majuli",
  "Morigaon (Marigaon)",
  "Nagaon",
  "Nalbari",
  "Sivasagar",
  "Sonitpur",
  "South Salmara–Mankachar",
  "Tamulpur",
  "Tinsukia",
  "Udalguri",
  "West Karbi Anglong",
];

type Data = {
  name: string;
  guardian: string;
  cls: "Class 9" | "Class 10" | "";
  track: "School Academy" | "Coding Bootcamp" | "";
  dob: string;
  district: string;
  state: string;
  email: string;
};

const TOTAL_STEPS = 9;

const spring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 30,
  mass: 0.7,
};

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 70 : -70,
    opacity: 0,
    scale: 0.97,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -70 : 70,
    opacity: 0,
    scale: 0.97,
  }),
};

/* -------------------------------------------------------------------------- */
/* AUDIO + HAPTICS                                                            */
/* -------------------------------------------------------------------------- */

const playTone = (
  frequency: number,
  type: OscillatorType = "sine",
  duration = 0.1,
  volume = 0.035,
) => {
  if (typeof window === "undefined") return;

  const AudioContextClass =
    window.AudioContext ||
    (window as Window & typeof globalThis & {
      webkitAudioContext?: new () => AudioContext;
    }).webkitAudioContext;

  if (!AudioContextClass) return;

  try {
    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration,
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Audio is an enhancement; never let it break onboarding.
  }
};

const playTap = () => playTone(620, "sine", 0.07, 0.025);
const playSelect = () => playTone(760, "sine", 0.09, 0.03);

const playSuccess = () => {
  playTone(523.25, "sine", 0.1, 0.045);
  setTimeout(() => playTone(659.25, "sine", 0.1, 0.045), 90);
  setTimeout(() => playTone(783.99, "sine", 0.24, 0.045), 180);
};

const vibrate = (pattern: number | number[] = 30) => {
  if (typeof window !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

/* -------------------------------------------------------------------------- */
/* MAIN                                                                        */
/* -------------------------------------------------------------------------- */

function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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

  const update = <K extends keyof Data>(key: K, value: Data[K]) => {
    setD((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const goForward = () => {
    playTap();
    vibrate(30);
    setDirection(1);
    setStep((current) => Math.min(TOTAL_STEPS - 1, current + 1));
  };

  const goBack = () => {
    playTap();
    vibrate(18);

    if (step === 0) {
      navigate({ to: "/" });
      return;
    }

    setDirection(-1);
    setStep((current) => Math.max(0, current - 1));
  };

  const validate = () => {
    switch (step) {
      case 1:
        return d.name.trim().length >= 2
          ? ""
          : "Tell Wispy your name first.";
      case 2:
        return d.guardian.trim().length >= 2
          ? ""
          : "Please add your guardian's name.";
      case 3:
        return d.cls ? "" : "Pick your current class.";
      case 4:
        return d.track ? "" : "Choose a learning path.";
      case 5:
        return d.dob ? "" : "Choose your date of birth.";
      case 6:
        return d.district && d.state
          ? ""
          : "Choose your district and state.";
      default:
        return "";
    }
  };

  const finish = async () => {
    playSuccess();
    vibrate([50, 40, 80]);

    if (user) {
      setSaving(true);

      try {
        await saveOnboardingData(user.uid, {
          name: d.name,
          guardian: d.guardian,
          cls: d.cls,
          track: d.track,
          dob: d.dob,
          district: d.district,
          state: d.state,
        });
      } catch (err) {
        console.error("Failed to save onboarding data:", err);
      } finally {
        setSaving(false);
      }
    }

    // Keep this enabled in production.
    navigate({ to: "/home", replace: true });
  };

  const handleContinue = async () => {
    const message = validate();

    if (message) {
      setError(message);
      vibrate([18, 35, 18]);
      return;
    }

    setError("");

    if (step === TOTAL_STEPS - 1) {
      await finish();
      return;
    }

    goForward();
  };

  return (
    <MobileFrame>
      <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white text-slate-950">
        {/* ---------------------------------------------------------------- */}
        {/* TOP BAR                                                          */}
        {/* ---------------------------------------------------------------- */}

        <header className="relative z-30 flex items-center gap-3 px-5 pb-2 pt-5">
          <motion.button
            whileTap={{ scale: 0.82 }}
            onClick={goBack}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 stroke-[2.7]" />
          </motion.button>

          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{
                width: `${((step + 1) / TOTAL_STEPS) * 100}%`,
              }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
          </div>

          <span className="min-w-[36px] text-right text-[11px] font-extrabold text-slate-400">
            {step + 1}/{TOTAL_STEPS}
          </span>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* CONTENT                                                           */}
        {/* ---------------------------------------------------------------- */}

        <main className="relative min-h-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={spring}
              className="absolute inset-0 overflow-y-auto px-6 pb-32 pt-5"
            >
              {step === 0 && (
                <WelcomeStep onStart={goForward} />
              )}

              {step === 1 && (
                <NameStep
                  value={d.name}
                  onChange={(value) => update("name", value)}
                />
              )}

              {step === 2 && (
                <GuardianStep
                  value={d.guardian}
                  onChange={(value) => update("guardian", value)}
                />
              )}

              {step === 3 && (
                <ClassStep
                  value={d.cls}
                  onChange={(value) => {
                    playSelect();
                    vibrate(28);
                    update("cls", value);
                  }}
                />
              )}

              {step === 4 && (
                <TrackStep
                  value={d.track}
                  onChange={(value) => {
                    playSelect();
                    vibrate(28);
                    update("track", value);
                  }}
                />
              )}

              {step === 5 && (
                <DobStep
                  value={d.dob}
                  onChange={(value) => {
                    playSelect();
                    vibrate(28);
                    update("dob", value);
                  }}
                />
              )}

              {step === 6 && (
                <LocationStep
                  district={d.district}
                  state={d.state}
                  onDistrictChange={(value) => {
                    playSelect();
                    vibrate(25);
                    update("district", value);
                  }}
                  onStateChange={(value) => {
                    playSelect();
                    vibrate(25);
                    update("state", value);
                  }}
                />
              )}

              {step === 7 && (
                <ReviewStep
                  data={d}
                  onEdit={(target) => {
                    playTap();
                    vibrate(20);
                    setDirection(-1);
                    setStep(target);
                  }}
                />
              )}

              {step === 8 && (
                <SuccessStep name={d.name} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ---------------------------------------------------------------- */}
        {/* BOTTOM CTA                                                       */}
        {/* ---------------------------------------------------------------- */}

        <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-white via-white to-transparent px-6 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-10">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 text-center text-[13px] font-bold text-red-500"
            >
              {error}
            </motion.div>
          )}

          {step === 0 ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={goForward}
              className="h-[54px] w-full rounded-2xl bg-primary text-[16px] font-extrabold text-white shadow-[0_7px_18px_rgba(59,102,245,0.22)]"
            >
              Let's go! <span className="ml-1">→</span>
            </motion.button>
          ) : step === 7 ? (
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  playTap();
                  vibrate(20);
                  setDirection(-1);
                  setStep(1);
                }}
                className="h-[54px] flex-1 rounded-2xl border-2 border-slate-100 bg-white text-[15px] font-extrabold text-primary"
              >
                Edit
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleContinue}
                disabled={saving}
                className="h-[54px] flex-[1.5] rounded-2xl bg-primary text-[16px] font-extrabold text-white shadow-[0_7px_18px_rgba(59,102,245,0.22)] disabled:opacity-60"
              >
                {saving ? "Saving..." : "Finish! 🎉"}
              </motion.button>
            </div>
          ) : step === 8 ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate({ to: "/home", replace: true })}
              className="h-[54px] w-full rounded-2xl bg-primary text-[16px] font-extrabold text-white shadow-[0_7px_18px_rgba(59,102,245,0.22)]"
            >
              Start learning →
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleContinue}
              className="h-[54px] w-full rounded-2xl bg-primary text-[16px] font-extrabold text-white shadow-[0_7px_18px_rgba(59,102,245,0.22)]"
            >
              Continue <span className="ml-1">→</span>
            </motion.button>
          )}
        </div>
      </div>
    </MobileFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* WELCOME                                                                    */
/* -------------------------------------------------------------------------- */

function WelcomeStep({ onStart }: { onStart: () => void }) {
  return (
    <section className="flex min-h-full flex-col items-center text-center">
      <div className="w-full pt-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.05 }}
        >
          <p className="text-[13px] font-extrabold uppercase tracking-[0.16em] text-primary">
            Welcome to Wisdawn
          </p>

          <h1 className="mt-3 text-[36px] font-black leading-[1.04] tracking-[-0.04em] text-slate-950">
            Learning should
            <br />
            feel <span className="text-primary">fun.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-[290px] text-[15px] font-medium leading-relaxed text-slate-500">
            Meet Wispy. Your little learning buddy is ready to help you get
            started.
          </p>
        </motion.div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center py-5">
        <FloatingDots />

        <motion.div
          initial={{ y: 45, opacity: 0, scale: 0.88 }}
          animate={{ y: [10, -8, 10], opacity: 1, scale: 1 }}
          transition={{
            opacity: { duration: 0.45 },
            scale: { ...spring, delay: 0.05 },
            y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
          }}
          className="relative z-10 w-[235px]"
        >
          <Wisby
            variant="thumbs"
            className="w-full object-contain drop-shadow-xl"
          />

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...spring, delay: 0.45 }}
            className="absolute -right-2 top-5 grid h-12 w-12 place-items-center rounded-full bg-white shadow-[0_8px_28px_rgba(0,0,0,0.10)]"
          >
            <Sparkles className="h-5 w-5 text-primary" />
          </motion.div>
        </motion.div>
      </div>

      <button
        onClick={onStart}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* NAME / GUARDIAN                                                            */
/* -------------------------------------------------------------------------- */

function NameStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <QuestionLayout
      eyebrow="Let's get to know you"
      title={
        <>
          What's your
          <br />
          <span className="text-primary">name?</span>
        </>
      }
      subtitle="Wispy needs a name to call you."
      mascot="thumbs"
    >
      <InputBubble
        icon={<UserIcon className="h-5 w-5" />}
        placeholder="Your full name"
        value={value}
        onChange={onChange}
        autoFocus
      />
    </QuestionLayout>
  );
}

function GuardianStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <QuestionLayout
      eyebrow="One more thing"
      title={
        <>
          Who is your
          <br />
          <span className="text-primary">guardian?</span>
        </>
      }
      subtitle="We'll keep this information safe and use it for your learning profile."
      mascot="thumbs"
    >
      <InputBubble
        icon={<Users className="h-5 w-5" />}
        placeholder="Guardian's name"
        value={value}
        onChange={onChange}
        autoFocus
      />
    </QuestionLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* CLASS                                                                      */
/* -------------------------------------------------------------------------- */

function ClassStep({
  value,
  onChange,
}: {
  value: Data["cls"];
  onChange: (value: "Class 9" | "Class 10") => void;
}) {
  return (
    <QuestionLayout
      eyebrow="Your learning level"
      title={
        <>
          Which class
          <br />
          are you in?
        </>
      }
      subtitle="We'll personalize your learning path around this."
      mascot="thumbs"
    >
      <div className="mt-7 space-y-3">
        <ChoiceCard
          selected={value === "Class 9"}
          icon={<span className="text-[26px]">📘</span>}
          title="Class 9"
          description="I'm studying in Class 9"
          onClick={() => onChange("Class 9")}
        />

        <ChoiceCard
          selected={value === "Class 10"}
          icon={<span className="text-[26px]">🎓</span>}
          title="Class 10"
          description="I'm studying in Class 10"
          onClick={() => onChange("Class 10")}
        />
      </div>

      <ReactionBubble>
        {value
          ? "Nice! Wispy knows what to prepare for you. ✨"
          : "Pick one and let's keep going!"}
      </ReactionBubble>
    </QuestionLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* TRACK                                                                      */
/* -------------------------------------------------------------------------- */

function TrackStep({
  value,
  onChange,
}: {
  value: Data["track"];
  onChange: (value: "School Academy" | "Coding Bootcamp") => void;
}) {
  return (
    <QuestionLayout
      eyebrow="Choose your adventure"
      title={
        <>
          What do you want
          <br />
          <span className="text-primary">to learn?</span>
        </>
      }
      subtitle="You can explore everything else later."
      mascot="thumbs"
    >
      <div className="mt-7 space-y-3">
        <ChoiceCard
          selected={value === "School Academy"}
          icon={<Atom className="h-7 w-7 text-emerald-500" />}
          title="School Academy"
          description="Subjects, concepts & exam prep"
          onClick={() => onChange("School Academy")}
        />

        <ChoiceCard
          selected={value === "Coding Bootcamp"}
          icon={<Code2 className="h-7 w-7 text-violet-500" />}
          title="Coding Bootcamp"
          description="Build websites and learn to code"
          onClick={() => onChange("Coding Bootcamp")}
        />
      </div>

      <ReactionBubble>
        {value
          ? "Great choice! This is going to be fun. 🚀"
          : "There is no wrong choice here!"}
      </ReactionBubble>
    </QuestionLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* DOB                                                                        */
/* -------------------------------------------------------------------------- */

function DobStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <QuestionLayout
      eyebrow="Personalize your journey"
      title={
        <>
          When were
          <br />
          <span className="text-primary">you born?</span>
        </>
      }
      subtitle="This helps us tailor your experience."
      mascot="thumbs"
    >
      <div className="relative mt-20">
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...spring, delay: 0.1 }}
          className="absolute -top-20 left-1/2 z-0 -translate-x-1/2"
        >
          <Wisby
            variant="thumbs"
            className="w-[105px] object-contain drop-shadow-md"
          />
        </motion.div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "relative z-10 h-[62px] w-full justify-start rounded-2xl border-2 bg-white px-5 text-left shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:bg-white",
                value
                  ? "border-primary/30 text-slate-950"
                  : "border-slate-100 text-slate-400",
              )}
            >
              <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
              <span className="font-bold">
                {value
                  ? format(new Date(value), "MMMM d, yyyy")
                  : "Select your date of birth"}
              </span>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-auto rounded-2xl border-slate-100 p-0 shadow-xl"
            align="center"
          >
            <Calendar
              mode="single"
              selected={value ? new Date(value) : undefined}
              onSelect={(date) => {
                onChange(date ? format(date, "yyyy-MM-dd") : "");
              }}
              initialFocus
              captionLayout="dropdown"
              fromYear={1990}
              toYear={new Date().getFullYear()}
            />
          </PopoverContent>
        </Popover>
      </div>

      <ReactionBubble>
        {value
          ? "Perfect! One little detail done. 🎯"
          : "Don't worry, this takes just one tap."}
      </ReactionBubble>
    </QuestionLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* LOCATION                                                                   */
/* -------------------------------------------------------------------------- */

function LocationStep({
  district,
  state,
  onDistrictChange,
  onStateChange,
}: {
  district: string;
  state: string;
  onDistrictChange: (value: string) => void;
  onStateChange: (value: string) => void;
}) {
  return (
    <QuestionLayout
      eyebrow="Almost there"
      title={
        <>
          Where do
          <br />
          you <span className="text-primary">live?</span>
        </>
      }
      subtitle="This helps us understand our Wisdawn community."
      mascot="thumbs"
    >
      <div className="mt-7 space-y-3">
        <LocationSelect
          icon={<MapPin className="h-5 w-5" />}
          placeholder="Select your district"
          value={district}
          onValueChange={onDistrictChange}
        >
          {ASSAM_DISTRICTS.map((districtName) => (
            <SelectItem
              key={districtName}
              value={districtName}
              className="py-3 font-bold"
            >
              {districtName}
            </SelectItem>
          ))}
        </LocationSelect>

        <LocationSelect
          icon={<MapPin className="h-5 w-5" />}
          placeholder="Select your state"
          value={state}
          onValueChange={onStateChange}
        >
          <SelectItem value="Assam" className="py-3 font-bold">
            Assam
          </SelectItem>
        </LocationSelect>
      </div>

      <ReactionBubble>
        {district && state
          ? `Awesome! ${district}, ${state}. 📍`
          : "Wherever you are, Wispy is coming with you."}
      </ReactionBubble>
    </QuestionLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* REVIEW                                                                     */
/* -------------------------------------------------------------------------- */

function ReviewStep({
  data,
  onEdit,
}: {
  data: Data;
  onEdit: (step: number) => void;
}) {
  return (
    <section>
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
          className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/10"
        >
          <CheckCircle2 className="h-7 w-7 text-primary" />
        </motion.div>

        <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-primary">
          One last check
        </p>

        <h1 className="mt-3 text-[32px] font-black leading-tight tracking-[-0.035em]">
          Ready to meet
          <br />
          your <span className="text-primary">new routine?</span>
        </h1>

        <p className="mx-auto mt-3 max-w-[300px] text-[14px] font-medium leading-relaxed text-slate-500">
          Make sure everything looks right. You can edit anything before
          starting.
        </p>
      </div>

      <div className="mt-7 space-y-2">
        <ReviewRow
          icon={<UserIcon className="h-4 w-4" />}
          label="Name"
          value={data.name || "—"}
          onClick={() => onEdit(1)}
        />

        <ReviewRow
          icon={<Users className="h-4 w-4" />}
          label="Guardian"
          value={data.guardian || "—"}
          onClick={() => onEdit(2)}
        />

        <ReviewRow
          icon={<GraduationCap className="h-4 w-4" />}
          label="Class"
          value={data.cls || "—"}
          onClick={() => onEdit(3)}
        />

        <ReviewRow
          icon={<Atom className="h-4 w-4" />}
          label="Learning path"
          value={data.track || "—"}
          onClick={() => onEdit(4)}
        />

        <ReviewRow
          icon={<CalendarIcon className="h-4 w-4" />}
          label="Date of birth"
          value={
            data.dob ? format(new Date(data.dob), "MMM d, yyyy") : "—"
          }
          onClick={() => onEdit(5)}
        />

        <ReviewRow
          icon={<MapPin className="h-4 w-4" />}
          label="Location"
          value={[data.district, data.state].filter(Boolean).join(", ") || "—"}
          onClick={() => onEdit(6)}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-5 flex items-center gap-3 rounded-2xl bg-primary/5 p-4"
      >
        <Wisby
          variant="thumbs"
          className="w-[62px] shrink-0 object-contain"
        />
        <div>
          <p className="text-[13px] font-extrabold text-slate-900">
            Looks perfect!
          </p>
          <p className="mt-0.5 text-[12px] font-medium leading-snug text-slate-500">
            Wispy is ready. Are you?
          </p>
        </div>
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* SUCCESS                                                                    */
/* -------------------------------------------------------------------------- */

function SuccessStep({ name }: { name: string }) {
  const firstName = name.trim().split(/\s+/)[0] || "friend";

  return (
    <section className="flex min-h-full flex-col items-center justify-center text-center">
      <CelebrationParticles />

      <motion.div
        initial={{ scale: 0.55, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }}
        transition={{
          opacity: { duration: 0.35 },
          scale: { ...spring },
          y: {
            delay: 0.35,
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="relative z-10 w-[245px]"
      >
        <Wisby
          variant="cheer"
          className="w-full object-contain drop-shadow-xl"
        />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...spring, delay: 0.65 }}
          className="absolute -left-1 top-3 grid h-12 w-12 place-items-center rounded-full bg-white shadow-[0_8px_28px_rgba(0,0,0,0.10)]"
        >
          <PartyPopper className="h-5 w-5 text-primary" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, ...spring }}
      >
        <p className="mt-7 text-[12px] font-extrabold uppercase tracking-[0.18em] text-primary">
          You're all set!
        </p>

        <h1 className="mt-2 text-[34px] font-black tracking-[-0.04em]">
          Let's do this,
          <br />
          <span className="text-primary">{firstName}! 🎉</span>
        </h1>

        <p className="mx-auto mt-3 max-w-[285px] text-[15px] font-medium leading-relaxed text-slate-500">
          Your Wisdawn journey starts now. Wispy will be right there with you.
        </p>
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* SHARED COMPONENTS                                                          */
/* -------------------------------------------------------------------------- */

function QuestionLayout({
  eyebrow,
  title,
  subtitle,
  mascot,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  mascot: "thumbs" | "cheer";
  children: ReactNode;
}) {
  return (
    <section className="flex min-h-full flex-col">
      <div>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[12px] font-extrabold uppercase tracking-[0.15em] text-primary"
        >
          {eyebrow}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-3 text-[34px] font-black leading-[1.08] tracking-[-0.04em] text-slate-950"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-3 max-w-[320px] text-[14px] font-medium leading-relaxed text-slate-500"
        >
          {subtitle}
        </motion.p>
      </div>

      <div className="flex-1">{children}</div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, ...spring }}
        className="mt-auto flex items-end justify-end pt-8"
      >
        <Wisby
          variant={mascot}
          className="w-[104px] object-contain drop-shadow-md"
        />
      </motion.div>
    </section>
  );
}

function InputBubble({
  icon,
  placeholder,
  value,
  onChange,
  autoFocus,
}: {
  icon: ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...spring, delay: 0.12 }}
      className="relative mt-16"
    >
      <div className="absolute -top-16 left-1/2 -translate-x-1/2">
        <Wisby
          variant="thumbs"
          className="w-[105px] object-contain drop-shadow-md"
        />
      </div>

      <label className="relative z-10 flex min-h-[64px] items-center gap-3 rounded-2xl border-2 border-slate-100 bg-white px-5 shadow-[0_10px_35px_rgba(0,0,0,0.055)] transition-all focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/10">
        <span className="text-primary">{icon}</span>

        <input
          autoFocus={autoFocus}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[16px] font-bold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-medium"
        />
      </label>
    </motion.div>
  );
}

function ChoiceCard({
  selected,
  icon,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.975 }}
      animate={{
        scale: selected ? 1.01 : 1,
      }}
      onClick={onClick}
      className={cn(
        "relative flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
        selected
          ? "border-primary bg-primary/[0.045] shadow-[0_8px_28px_rgba(59,102,245,0.10)]"
          : "border-slate-100 bg-white shadow-[0_5px_20px_rgba(0,0,0,0.035)]",
      )}
    >
      <motion.div
        animate={{
          scale: selected ? [1, 1.12, 1] : 1,
          rotate: selected ? [0, -4, 4, 0] : 0,
        }}
        transition={{ duration: 0.35 }}
        className={cn(
          "grid h-12 w-12 shrink-0 place-items-center rounded-xl",
          selected ? "bg-white" : "bg-slate-50",
        )}
      >
        {icon}
      </motion.div>

      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-extrabold text-slate-900">{title}</p>
        <p className="mt-0.5 text-[12px] font-medium text-slate-500">
          {description}
        </p>
      </div>

      <motion.div
        initial={false}
        animate={{
          scale: selected ? 1 : 0.88,
          opacity: selected ? 1 : 0.35,
        }}
      >
        {selected ? (
          <div className="grid h-7 w-7 place-items-center rounded-full bg-primary text-white">
            <Check className="h-4 w-4 stroke-[3]" />
          </div>
        ) : (
          <div className="h-7 w-7 rounded-full border-2 border-slate-200" />
        )}
      </motion.div>
    </motion.button>
  );
}

function LocationSelect({
  icon,
  placeholder,
  value,
  onValueChange,
  children,
}: {
  icon: ReactNode;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border-2 border-slate-100 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.035)]">
      <Select value={value || undefined} onValueChange={onValueChange}>
        <SelectTrigger className="h-[62px] border-0 bg-transparent px-5 font-bold shadow-none focus:ring-0">
          <div className="flex min-w-0 items-center gap-3">
            <span className="text-primary">{icon}</span>
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>

        <SelectContent className="max-h-[300px] rounded-2xl border-slate-100 shadow-xl">
          {children}
        </SelectContent>
      </Select>
    </div>
  );
}

function ReactionBubble({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.25, ...spring }}
      className="mt-6 rounded-2xl rounded-br-md bg-slate-50 px-4 py-3 text-[12px] font-bold leading-snug text-slate-600"
    >
      {children}
    </motion.div>
  );
}

function ReviewRow({
  icon,
  label,
  value,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left shadow-[0_4px_18px_rgba(0,0,0,0.025)]"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/5 text-primary">
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <span className="mt-0.5 block truncate text-[13px] font-extrabold text-slate-900">
          {value}
        </span>
      </span>

      <span className="text-[11px] font-extrabold text-primary">Edit</span>
    </motion.button>
  );
}

function FloatingDots() {
  return (
    <>
      <motion.span
        animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[12%] top-[20%] h-3 w-3 rounded-full bg-primary/15"
      />
      <motion.span
        animate={{ y: [0, 9, 0], rotate: [0, -8, 0] }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
        className="absolute right-[13%] top-[27%] h-5 w-5 rounded-full bg-primary/10"
      />
      <motion.span
        animate={{ y: [0, -7, 0] }}
        transition={{
          duration: 2.1,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4,
        }}
        className="absolute bottom-[22%] left-[17%] h-4 w-4 rounded-full bg-primary/10"
      />
    </>
  );
}

function CelebrationParticles() {
  const particles = [
    { left: "8%", top: "18%", delay: 0 },
    { left: "21%", top: "9%", delay: 0.12 },
    { left: "77%", top: "12%", delay: 0.22 },
    { left: "90%", top: "27%", delay: 0.08 },
    { left: "12%", top: "55%", delay: 0.18 },
    { left: "85%", top: "58%", delay: 0.3 },
  ];

  return (
    <>
      {particles.map((particle, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.4, 1, 0.7],
            y: [0, -18, 5],
            rotate: [0, 80, 160],
          }}
          transition={{
            duration: 1.8,
            delay: particle.delay,
            repeat: Infinity,
            repeatDelay: 0.8,
          }}
          className="absolute z-0 text-primary"
          style={{
            left: particle.left,
            top: particle.top,
          }}
        >
          {index % 2 === 0 ? "✦" : "•"}
        </motion.span>
      ))}
    </>
  );
}
