import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Star,
  Sparkles,
  BookOpen,
  Menu,
  Lightbulb,
  Sun,
  Heart,
  Zap,
  MapPin,
  User,
  PawPrint,
  Home,
  Trophy,
  Rocket,
  CheckCircle2,
  Search,
  Quote,
  Feather,
} from "lucide-react";

/* ----------------------------------------------------------------------
   Reusable image placeholder
---------------------------------------------------------------------- */
type ImagePlaceholderProps = {
  label: string;
  className?: string;
  rounded?: string;
};

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  label,
  className = "",
  rounded = "rounded-2xl",
}) => (
  <div
    className={`flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-50 to-amber-50 border-2 border-dashed border-indigo-200 text-indigo-300 text-center px-3 select-none ${rounded} ${className}`}
  >
    <span className="text-xs sm:text-sm font-medium leading-snug">
      {label}
      <br />
      <span className="text-[10px] sm:text-xs text-indigo-300/80">
        (image placeholder)
      </span>
    </span>
  </div>
);

/* ----------------------------------------------------------------------
   Section banner
---------------------------------------------------------------------- */
type BannerProps = {
  children: React.ReactNode;
  color: "blue" | "purple" | "tan";
  icon?: React.ReactNode;
  className?: string;
};

const bannerColors: Record<BannerProps["color"], string> = {
  blue: "bg-[#3557E8]",
  purple: "bg-[#6B4FD8]",
  tan: "bg-[#E8B94A]",
};

const Banner: React.FC<BannerProps> = ({ children, color, icon, className = "" }) => (
  <div className={`relative inline-flex ${className}`}>
    <div
      className={`${bannerColors[color]} text-white font-semibold text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-md flex items-center gap-2 whitespace-nowrap`}
      style={{
        clipPath: "polygon(0% 0%, 96% 0%, 100% 50%, 96% 100%, 0% 100%)",
      }}
    >
      {icon}
      {children}
    </div>
  </div>
);

/* ----------------------------------------------------------------------
   Panel wrapper
---------------------------------------------------------------------- */
const Panel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <section
    className={`bg-white/90 backdrop-blur-sm rounded-[28px] shadow-[0_8px_30px_rgba(80,80,160,0.08)] border border-indigo-50 p-6 sm:p-8 md:p-10 ${className}`}
  >
    {children}
  </section>
);

/* ------------------------------------------------------------------- */
/* Header                                                               */
/* ------------------------------------------------------------------- */
const Header: React.FC = () => (
  <header className="w-full">
    <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#3557E8] flex items-center justify-center text-white font-black text-lg">
          W
        </div>
        <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#161642]">
          WISDAWN
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <button className="bg-[#3557E8] hover:bg-[#2a46c9] transition-colors text-white font-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base shadow-md">
          Get Started
        </button>
        <button
          aria-label="Open menu"
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-indigo-100 text-[#161642]"
        >
          <Menu size={20} />
        </button>
      </div>
    </div>
  </header>
);

/* ------------------------------------------------------------------- */
/* 1. Meet Wispy                                                        */
/* ------------------------------------------------------------------- */
const MeetWispy: React.FC = () => (
  <Panel className="overflow-hidden">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
      <div>
        <h1 className="flex flex-wrap items-center gap-2 text-4xl sm:text-5xl font-extrabold text-[#161642]">
          <Sparkles className="text-amber-400" size={26} />
          Meet
          <span className="text-[#3557E8]">Wispy</span>
          <Sparkles className="text-amber-400" size={26} />
        </h1>

        <p className="mt-4 flex items-start gap-2 text-indigo-500/80 text-base sm:text-lg italic">
          <Feather className="mt-1 shrink-0 text-indigo-300" size={18} />
          The wise little owl who makes learning an exciting adventure!
          <Heart className="mt-1 shrink-0 text-indigo-300" size={16} />
        </p>

        <div className="relative mt-6 bg-[#FBF3E1] border border-amber-100 rounded-2xl p-6 shadow-sm">
          <div
            className="absolute -top-3 -left-2 w-9 h-12 bg-[#3557E8] flex items-start justify-center pt-1.5 rounded-t-sm"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)" }}
          >
            <Star className="text-amber-300 fill-amber-300" size={16} />
          </div>
          <p className="text-[#3a3a5c] text-sm sm:text-base leading-relaxed pl-4">
            Hi! I'm Wispy – the heart and soul of Wisdawn. I'm here to
            guide you, cheer for you, and make every step of your
            learning journey fun, engaging and meaningful!{" "}
            <Heart className="inline text-[#3557E8] fill-[#3557E8]" size={14} />
          </p>
        </div>
      </div>

      <div className="relative flex justify-center md:justify-end">
        <ImagePlaceholder
          label="Wispy — thumbs-up hero pose"
          className="w-64 h-64 sm:w-80 sm:h-80"
          rounded="rounded-[32px]"
        />
      </div>
    </div>
  </Panel>
);

/* ------------------------------------------------------------------- */
/* 2. Wispy's Wisdom Story                                              */
/* ------------------------------------------------------------------- */
const WisdomStory: React.FC = () => (
  <Panel>
    <Banner color="purple" icon={<Sparkles size={16} />} className="mb-6">
      Wispy's Wisdom Story
    </Banner>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div className="space-y-4 text-[#3a3a5c] text-sm sm:text-base leading-relaxed">
        <p>
          In a magical forest where knowledge grew like stars, there
          lived a little owl named Wispy.
        </p>
        <p>
          He was different from other owls – he didn't just love wisdom,
          he loved sharing it!
        </p>
        <p>
          Wispy saw many young minds struggling, feeling bored or
          confused. He wanted to change that.
        </p>
        <p>
          So, he spread his wings and created Wisdawn – a place where
          learning feels like an adventure, not a burden.
        </p>
        <p className="font-bold text-[#3557E8]">That place is Wisdawn. ✨</p>
      </div>

      <div className="flex justify-center">
        <ImagePlaceholder
          label="Wispy reading by lantern light (framed photo)"
          className="w-full max-w-sm h-64 sm:h-72 rotate-1"
          rounded="rounded-xl"
        />
      </div>
    </div>
  </Panel>
);

/* ------------------------------------------------------------------- */
/* 3. How the Name "Wisdawn" Was Born                                   */
/* ------------------------------------------------------------------- */
const NameOrigin: React.FC = () => (
  <Panel>
    <Banner color="blue" icon={<Sparkles size={16} />} className="mb-6">
      How the Name &quot;Wisdawn&quot; Was Born ✨
    </Banner>

    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full bg-blue-50 rounded-2xl p-5 text-center">
          <Lightbulb className="mx-auto text-amber-400" size={28} />
          <h3 className="mt-2 font-bold text-[#161642]">Wisdom</h3>
          <p className="text-xs sm:text-sm text-indigo-500/70 mt-1">
            The light of knowledge that guides us.
          </p>
        </div>

        <span className="text-2xl font-bold text-indigo-300">+</span>

        <div className="flex-1 w-full bg-amber-50 rounded-2xl p-5 text-center">
          <Sun className="mx-auto text-amber-400" size={28} />
          <h3 className="mt-2 font-bold text-[#161642]">Dawn</h3>
          <p className="text-xs sm:text-sm text-indigo-500/70 mt-1">
            A new beginning, full of hope and possibilities.
          </p>
        </div>

        <span className="text-2xl font-bold text-indigo-300">=</span>

        <div className="flex-1 w-full bg-indigo-50 rounded-2xl p-5 text-center">
          <div className="mx-auto w-8 h-8 rounded-md bg-[#3557E8] flex items-center justify-center text-white font-black text-sm">
            W
          </div>
          <h3 className="mt-2 font-bold text-[#161642]">Wisdawn</h3>
          <p className="text-xs sm:text-sm text-indigo-500/70 mt-1">
            Where wisdom meets a new dawn for every learner.
          </p>
        </div>
      </div>

      <div className="relative bg-[#FBF3E1] border border-amber-100 rounded-2xl p-5 max-w-xs mx-auto shadow-sm">
        <div className="absolute -top-3 -right-3 w-8 h-6 bg-purple-300/80 rotate-12 rounded-sm" />
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center shrink-0">
            <span className="text-[#3557E8] font-black">W</span>
            <Sparkles className="text-amber-400 -ml-1 -mt-3" size={10} />
          </div>
          <p className="text-sm text-[#3a3a5c] leading-relaxed">
            Wisdawn is more than a name. It's a promise – to help every
            student{" "}
            <span className="text-[#3557E8] font-semibold">
              shine brighter
            </span>{" "}
            every day. <Heart className="inline text-[#3557E8]" size={12} />
          </p>
        </div>
      </div>
    </div>
  </Panel>
);

/* ------------------------------------------------------------------- */
/* 4. Wispy's Portfolio                                                 */
/* ------------------------------------------------------------------- */
const PortfolioRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <span className="text-[#3557E8]">{icon}</span>
    <span className="w-24 sm:w-28 font-semibold text-[#161642] text-sm shrink-0">
      {label}
    </span>
    <span className="text-sm text-[#3a3a5c]">{value}</span>
  </div>
);

const Portfolio: React.FC = () => (
  <Panel>
    <Banner color="tan" icon={<MapPin size={16} />} className="mb-6">
      Wispy's Portfolio
    </Banner>

    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-8 items-center">
      <div className="space-y-4">
        <PortfolioRow icon={<User size={16} />} label="Name" value="Wispy" />
        <PortfolioRow icon={<PawPrint size={16} />} label="Species" value="Owl" />
        <PortfolioRow icon={<Star size={16} />} label="Role" value="Learning Guide & Motivator" />
        <PortfolioRow icon={<Home size={16} />} label="Home" value="The Wisdawn Forest" />
      </div>

      <div className="space-y-4">
        <PortfolioRow icon={<Heart size={16} />} label="Loves" value="Books, Code, Science & Curious Minds" />
        <PortfolioRow icon={<Zap size={16} />} label="Superpower" value="Turning complex things into simple fun!" />
      </div>

      <div className="flex justify-center">
        <ImagePlaceholder
          label="Wispy with magnifying glass"
          className="w-40 h-40 rounded-full"
          rounded="rounded-full"
        />
      </div>
    </div>
  </Panel>
);

/* ------------------------------------------------------------------- */
/* 5. Value Pillars                                                     */
/* ------------------------------------------------------------------- */
const pillars = [
  { icon: <Lightbulb size={20} />, text: "Explains tough topics in simple ways." },
  { icon: <CheckCircle2 size={20} />, text: "Suggests the best lessons for you." },
  { icon: <Heart size={20} />, text: "Cheer you up when you're stuck." },
  { icon: <Trophy size={20} />, text: "Celebrates your progress & wins." },
  { icon: <Rocket size={20} />, text: "Inspires curiosity every single day." },
];

const ValuePillars: React.FC = () => (
  <Panel>
    <Banner color="purple" icon={<Sparkles size={16} />} className="mb-6">
      Wispy's Value Pillars ✨
    </Banner>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
      {pillars.map((p, i) => (
        <div key={i} className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-[#3557E8]">
            {p.icon}
          </div>
          <p className="text-xs sm:text-sm text-[#3a3a5c] leading-snug">{p.text}</p>
        </div>
      ))}
    </div>
  </Panel>
);

/* ------------------------------------------------------------------- */
/* 6. Wispy in Action!                                                  */
/* ------------------------------------------------------------------- */
const actions = [
  { label: "Learning together", icon: <BookOpen size={12} /> },
  { label: "Solving problems", icon: <Zap size={12} /> },
  { label: "Exploring new things", icon: <Search size={12} /> },
  { label: "Sharing knowledge", icon: <BookOpen size={12} /> },
  { label: "Celebrating wins", icon: <Trophy size={12} /> },
  { label: "Always by your side", icon: <Heart size={12} /> },
];

const InAction: React.FC = () => (
  <Panel>
    <Banner color="blue" icon={<Sparkles size={16} />} className="mb-6">
      Wispy in Action! ✨
    </Banner>

    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-5">
      {actions.map((a, i) => (
        <div key={i} className="flex flex-col items-center text-center gap-2">
          <ImagePlaceholder
            label={a.label}
            className="w-full aspect-square"
            rounded="rounded-xl"
          />
          <span className="text-xs sm:text-sm font-medium text-[#161642]">
            {a.label}
          </span>
        </div>
      ))}
    </div>
  </Panel>
);

/* ------------------------------------------------------------------- */
/* 7. Closing Quote                                                     */
/* ------------------------------------------------------------------- */
const ClosingQuote: React.FC = () => (
  <Panel className="bg-[#FBF3E1]/70">
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-center">
      <div>
        <Quote className="text-amber-300" size={28} />
        <p className="text-lg sm:text-xl italic text-[#3a3a5c] leading-relaxed mt-2">
          "I may be a small owl, but my dream is big – to make learning
          magical for every student!"
        </p>
        <p className="mt-3 font-bold text-[#161642] flex items-center gap-1">
          — Wispy <Heart className="text-[#3557E8]" size={16} />
        </p>
      </div>

      <ImagePlaceholder
        label="Wispy writing with quill"
        className="w-40 h-40 sm:w-48 sm:h-48"
      />
    </div>
  </Panel>
);

/* ------------------------------------------------------------------- */
/* TanStack Router Route Registration & Main Page Component             */
/* ------------------------------------------------------------------- */
export const Route = createFileRoute("/wispy")({
  head: () => ({ meta: [{ title: "Meet Wispy — WisDawn" }] }),
  component: WispyPage,
});

function WispyPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#F4F5FF] via-white to-[#F4F5FF]">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 space-y-6 sm:space-y-8">
        <MeetWispy />
        <WisdomStory />
        <NameOrigin />
        <Portfolio />
        <ValuePillars />
        <InAction />
        <ClosingQuote />
      </main>
    </div>
  );
}

export default WispyPage;