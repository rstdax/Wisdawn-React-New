import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, type ReactNode } from "react";
import {
  PlayCircle, Trophy, Award, CheckCircle2, FlaskConical, Atom, TestTube,
  Code2, MonitorPlay, Cpu, Users, BookOpen, GraduationCap,
  Quote, ArrowRight, Sparkles, Medal, Lightbulb, Heart, Rocket, Menu, Star, CheckCircle, BarChart3, Globe,
  Instagram, Youtube, Linkedin, Twitter, Calculator, X, Compass, Ruler
} from "lucide-react";
import wisdawnLogo from "@/assets/logo.jpeg";
import wisbyThumbs from "@/assets/wisby-thumbs.png";
import wisbyCodingHero from "@/assets/wisby-coding-hero.png";
import codewarPhoto from "@/assets/codewar-photo.png";
import chemistryImage from "@/assets/chemistry.png";
import pythonIcon from "@/assets/python-icon.webp";
import javascriptIcon from "@/assets/javscript-icon.webp";
import reactIcon from "@/assets/react-icon.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WisDawn — Where Learning Meets Innovation" },
      {
        name: "description",
        content: "Wisdawn is an award winning educational platform that makes learning Science exciting and Coding empowering.",
      },
    ],
  }),
  component: LandingPage,
});

/* ------------------------------------------------------------------ */
/*  Scroll Reveal Hook & Component (On-Scroll Animations)             */
/* ------------------------------------------------------------------ */

function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "down" | "none";
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  const directionClasses = {
    up: "translate-y-12",
    down: "-translate-y-12",
    left: "-translate-x-12",
    right: "translate-x-12",
    none: "",
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0 translate-x-0" : `opacity-0 ${directionClasses[direction]}`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Geometric Patterns & Vector School Artifact Backgrounds           */
/* ------------------------------------------------------------------ */

function FullWidthSideWiseAnimations() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-[1]">
      {/* Top band moving right */}
      <div className="absolute top-[15%] w-[200vw] h-[300px] flex animate-wd-slide-right opacity-[0.12]">
        <div className="w-[100vw] h-full bg-gradient-to-r from-blue-200/0 via-blue-400 to-blue-200/0 blur-3xl rounded-full" />
        <div className="w-[100vw] h-full bg-gradient-to-r from-blue-200/0 via-blue-400 to-blue-200/0 blur-3xl rounded-full" />
      </div>
      {/* Middle band moving left */}
      <div className="absolute top-[45%] w-[200vw] h-[400px] flex animate-wd-slide-left opacity-[0.08]">
        <div className="w-[100vw] h-full bg-gradient-to-r from-indigo-200/0 via-indigo-500 to-indigo-200/0 blur-3xl rounded-full" />
        <div className="w-[100vw] h-full bg-gradient-to-r from-indigo-200/0 via-indigo-500 to-indigo-200/0 blur-3xl rounded-full" />
      </div>
      {/* Bottom band moving right */}
      <div className="absolute top-[75%] w-[200vw] h-[300px] flex animate-wd-slide-right-slow opacity-[0.12]">
        <div className="w-[100vw] h-full bg-gradient-to-r from-purple-200/0 via-purple-400 to-purple-200/0 blur-3xl rounded-full" />
        <div className="w-[100vw] h-full bg-gradient-to-r from-purple-200/0 via-purple-400 to-purple-200/0 blur-3xl rounded-full" />
      </div>
    </div>
  );
}

function AnimatedGeometricCones({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute left-0 right-0 top-0 overflow-hidden pointer-events-none z-0 flex justify-between opacity-30 ${className}`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 100 120"
          className="w-12 h-16 sm:w-16 sm:h-20 text-blue-400/40 animate-pulse"
          style={{ animationDelay: `${i * 200}ms` }}
        >
          <polygon points="50,0 100,120 0,120" fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}

function HexagonPatternGrid({ className = "" }: { className?: string }) {
  return (
    <svg className={`absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] ${className}`} xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <path d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M50 0 L50 100 M93.3 25 L6.7 75 M93.3 75 L6.7 25" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  );
}

function CompassDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="30" cy="9" r="4" stroke="currentColor" strokeWidth="2.2" />
      <path d="M30 13 L14 64" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30 13 L46 60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 64 L21 66.5 M46 60 L39.5 63" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 57 A10 10 0 0 0 40 57" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 3.5" />
    </svg>
  );
}

function ProtractorDoodle({ className = "" }: { className?: string }) {
  const ticks = Array.from({ length: 9 }).map((_, i) => {
    const angle = (Math.PI / 8) * i;
    const x1 = 50 + 34 * Math.cos(Math.PI - angle);
    const y1 = 55 - 34 * Math.sin(Math.PI - angle);
    const x2 = 50 + 41 * Math.cos(Math.PI - angle);
    const y2 = 55 - 41 * Math.sin(Math.PI - angle);
    return { x1, y1, x2, y2 };
  });
  return (
    <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M9 55 A41 41 0 0 1 91 55" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="9" y1="55" x2="91" y2="55" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {ticks.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      ))}
      <circle cx="50" cy="55" r="2.5" fill="currentColor" />
    </svg>
  );
}

function GlobeDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="40" cy="38" r="30" stroke="currentColor" strokeWidth="2.2" />
      <path d="M10 38 H70" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 3" />
      <ellipse cx="40" cy="38" rx="16" ry="29" stroke="currentColor" strokeWidth="1.8" />
      <path d="M40 68 V82 M25 82 H55" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function SetSquareDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M4 46 L4 6 L52 46 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="4" y1="15" x2="11" y2="15" stroke="currentColor" strokeWidth="1.5" />
      <line x1="4" y1="24" x2="11" y2="24" stroke="currentColor" strokeWidth="1.5" />
      <line x1="4" y1="33" x2="11" y2="33" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function RulerDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 92 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="2" y="2" width="88" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={10 + i * 9} y1="2" x2={10 + i * 9} y2={i % 2 === 0 ? 13 : 8} stroke="currentColor" strokeWidth="1.4" />
      ))}
    </svg>
  );
}

function PencilDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M10 2 L16 10 L16 48 L10 58 L4 48 L4 10 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <line x1="4" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="1.5" />
      <line x1="10" y1="2" x2="10" y2="15" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function AtomOrbitDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <ellipse cx="50" cy="50" rx="46" ry="18" stroke="currentColor" strokeWidth="1.8" />
      <ellipse cx="50" cy="50" rx="46" ry="18" stroke="currentColor" strokeWidth="1.8" transform="rotate(60 50 50)" />
      <ellipse cx="50" cy="50" rx="46" ry="18" stroke="currentColor" strokeWidth="1.8" transform="rotate(120 50 50)" />
      <circle cx="50" cy="50" r="5" fill="currentColor" />
    </svg>
  );
}

function MicroscopeDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M20 62 H44 M32 62 V48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 48 C 45 48, 48 30, 36 20" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <rect x="22" y="10" width="12" height="24" rx="2" transform="rotate(-15 22 10)" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="20" cy="42" r="6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CircuitDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M8 18 H38 V48 H68 V78 H92" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 78 H44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="18" r="3.5" fill="currentColor" />
      <circle cx="38" cy="48" r="3.5" fill="currentColor" />
      <circle cx="68" cy="78" r="3.5" fill="currentColor" />
      <circle cx="92" cy="78" r="3.5" fill="currentColor" />
      <circle cx="18" cy="78" r="3.5" fill="currentColor" />
    </svg>
  );
}

function DotGrid({ className = "", size = 22 }: { className?: string; size?: number }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none absolute ${className}`}
      style={{
        backgroundImage: "radial-gradient(currentColor 1.5px, transparent 1.5px)",
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}

function Doodle({ children, className = "", anim = "wd-float" }: { children: ReactNode; className?: string; anim?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none select-none absolute ${anim} ${className}`}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Device Breakpoint Vectors Scenes                                  */
/* ------------------------------------------------------------------ */

function HeroDoodles() {
  return (
    <>
      {/* Smartphone View Vectors */}
      <div className="block sm:hidden absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <DotGrid className="top-2 right-0 h-28 w-28 text-blue-300/60" size={14} />
        <Doodle anim="wd-float" className="top-2 left-2 h-8 w-8 text-blue-400/80">
          <PencilDoodle className="w-full h-full -rotate-12" />
        </Doodle>
        <Doodle anim="wd-spin-slow" className="bottom-12 left-4 h-10 w-10 text-amber-400/70">
          <GlobeDoodle className="w-full h-full" />
        </Doodle>
        <Doodle anim="wd-float-rev" className="top-1/2 right-2 h-8 w-8 text-indigo-400/70">
          <CompassDoodle className="w-full h-full" />
        </Doodle>
      </div>

      {/* Tablet View Vectors */}
      <div className="hidden sm:block lg:hidden absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <DotGrid className="-top-4 left-1/3 h-44 w-44 text-indigo-200/60" size={20} />
        <Doodle anim="wd-float-slow" className="top-4 left-2 h-16 w-16 text-blue-400/70">
          <CompassDoodle className="w-full h-full" />
        </Doodle>
        <Doodle anim="wd-spin-slow" className="top-12 right-6 h-16 w-16 text-emerald-400/70">
          <GlobeDoodle className="w-full h-full" />
        </Doodle>
        <Doodle anim="wd-drift" className="bottom-20 right-4 h-10 w-28 text-indigo-300/70 -rotate-6">
          <RulerDoodle className="w-full h-full" />
        </Doodle>
        <Doodle anim="wd-float" className="top-1/2 left-6 h-12 w-12 text-purple-400/70">
          <MicroscopeDoodle className="w-full h-full" />
        </Doodle>
      </div>

      {/* Desktop View Vectors */}
      <div className="hidden lg:block absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <DotGrid className="-top-10 left-0 h-72 w-[30rem] text-indigo-300/40" size={26} />
        <Doodle anim="wd-spin-slow-rev" className="-top-6 -left-10 h-32 w-32 text-blue-400/70">
          <CompassDoodle className="w-full h-full" />
        </Doodle>
        <Doodle anim="wd-float" className="bottom-2 -left-6 h-20 w-36 text-indigo-300/70">
          <ProtractorDoodle className="w-full h-full" />
        </Doodle>
        <Doodle anim="wd-float-rev" className="top-1/3 left-[40%] h-16 w-28 text-slate-400/60 -rotate-6">
          <RulerDoodle className="w-full h-full" />
        </Doodle>
        <Doodle anim="wd-spin-slow" className="top-2 right-6 h-28 w-28 text-sky-400/70">
          <GlobeDoodle className="w-full h-full" />
        </Doodle>
        <Doodle anim="wd-float-slow" className="bottom-10 right-[28%] h-16 w-16 text-emerald-400/70">
          <SetSquareDoodle className="w-full h-full" />
        </Doodle>
        <Doodle anim="wd-pulse-soft" className="top-16 right-[42%] h-8 w-8 text-amber-400">
          <Star className="w-full h-full fill-amber-200" />
        </Doodle>
      </div>
    </>
  );
}

interface TrophyConnectorProps {
  logoSrc: string;
  logoAlt?: string;
  className?: string;
}

function TrophyConnector({ logoSrc, logoAlt = "Logo", className = "" }: TrophyConnectorProps) {
  return (
    <div className={`relative flex items-center justify-center w-full max-w-md h-24 ${className}`}>
      <svg className="hidden md:block absolute inset-0 w-full h-full" viewBox="0 0 500 100" fill="none" preserveAspectRatio="none">
        <path d="M 10 60 Q 50 20, 90 55 T 170 45 T 200 50" stroke="#3B82F6" strokeWidth="2.5" strokeDasharray="6 6" strokeLinecap="round" fill="none" />
        <path d="M 200 50 C 230 65, 250 75, 280 55 C 310 40, 330 50, 350 55 C 365 58, 378 48, 390 35" stroke="#3B82F6" strokeWidth="2.5" strokeDasharray="6 6" strokeLinecap="round" fill="none" />
        <line x1="390" y1="35" x2="470" y2="35" stroke="#3B82F6" strokeWidth="2.5" strokeDasharray="6 6" strokeLinecap="round" />
        <path d="M 470 35 L 485 35 M 478 28 L 485 35 L 478 42" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div className="z-10 flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white shadow-xl ring-4 ring-blue-50 p-2 overflow-hidden transform hover:scale-110 transition-transform">
        <img src={logoSrc} alt={logoAlt} className="w-full h-full object-cover rounded-full" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Landing Page Component                                       */
/* ------------------------------------------------------------------ */

function LandingPage() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="landing-page min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 font-sans text-slate-900 selection:bg-blue-200 overflow-x-hidden flex flex-col items-center relative">

      {/* Embedded Dynamic Vector, Geometry & Scroll Animations */}
      <style>{`
        @keyframes wd-float-kf { 0%, 100% { transform: translateY(0px) rotate(var(--wd-rot, 0deg)); } 50% { transform: translateY(-16px) rotate(var(--wd-rot, 0deg)); } }
        @keyframes wd-float-rev-kf { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(16px); } }
        @keyframes wd-drift-kf { 0%, 100% { transform: translateX(0px); } 50% { transform: translateX(18px); } }
        @keyframes wd-spin-kf { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes wd-spin-rev-kf { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes wd-pulse-kf { 0%, 100% { opacity: .4; transform: scale(1); } 50% { opacity: .9; transform: scale(1.08); } }
        @keyframes wd-slide-right-loop { 0% { transform: translateX(-50%); } 100% { transform: translateX(0%); } }
        @keyframes wd-slide-left-loop { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        
        .wd-float { animation: wd-float-kf 6s ease-in-out infinite; }
        .wd-float-slow { animation: wd-float-kf 9s ease-in-out infinite; }
        .wd-float-rev { animation: wd-float-rev-kf 7s ease-in-out infinite; }
        .wd-drift { animation: wd-drift-kf 8s ease-in-out infinite; }
        .wd-spin-slow { animation: wd-spin-kf 24s linear infinite; }
        .wd-spin-slow-rev { animation: wd-spin-rev-kf 28s linear infinite; }
        .wd-pulse-soft { animation: wd-pulse-kf 4.5s ease-in-out infinite; }
        .animate-wd-slide-right { animation: wd-slide-right-loop 25s linear infinite; }
        .animate-wd-slide-left { animation: wd-slide-left-loop 30s linear infinite; }
        .animate-wd-slide-right-slow { animation: wd-slide-right-loop 35s linear infinite; }
      `}</style>

      {/* Global Background Geometric Pattern & Sidewise Animations */}
      <HexagonPatternGrid />
      <FullWidthSideWiseAnimations />

      {/* Navbar Header */}
      <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-lg z-50 border-b border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 md:px-10 lg:px-16 max-w-[1536px] mx-auto">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate({ to: "/" })}>
            <img src={wisdawnLogo} alt="Wisdawn Logo" className="w-10 h-10 md:w-11 md:h-11 object-cover rounded-xl shadow-md ring-2 ring-blue-500/20" />
            <span className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              Wisdawn
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-8 font-bold text-sm text-slate-600">
            <a href="#" className="text-blue-600 font-extrabold relative py-1 border-b-2 border-blue-600">Home</a>
            <a href="#about" className="hover:text-blue-600 transition-colors py-1">About Us</a>
            <a href="#offerings" className="hover:text-blue-600 transition-colors py-1">Features</a>
            <a href="#courses" className="hover:text-blue-600 transition-colors py-1">Courses</a>
            <a href="#achievements" className="hover:text-blue-600 transition-colors py-1">Achievements</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/auth"
              className="hidden md:flex px-6 py-2.5 rounded-full border-2 border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all"
            >
              Log In
            </Link>
            <Link
              to="/auth"
              className="hidden sm:flex px-6 py-2.5 rounded-full bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 transition-all"
            >
              Get Started
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Smartphone Dynamic Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden flex flex-col px-6 pb-6 pt-3 bg-white/95 backdrop-blur-xl border-t border-slate-100 gap-3 text-base font-bold text-slate-800 shadow-2xl">
            <a href="#" className="text-blue-600 py-2 border-b border-slate-100" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
            <a href="#about" className="py-2 border-b border-slate-100" onClick={() => setIsMobileMenuOpen(false)}>About Us</a>
            <a href="#offerings" className="py-2 border-b border-slate-100" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
            <a href="#courses" className="py-2 border-b border-slate-100" onClick={() => setIsMobileMenuOpen(false)}>Courses</a>
            <Link
              to="/auth"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full mt-3 px-6 py-3 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 text-center font-bold"
            >
              Get Started
            </Link>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="w-full max-w-[1536px] px-5 pt-24 md:px-8 lg:px-12 lg:pt-28 pb-16 flex flex-col gap-12 lg:gap-20 relative">

        {/* Animated Background Geometric Cones Header */}
        <AnimatedGeometricCones className="-top-12" />

        {/* ------------------------------------------------------------- */}
        {/*  HERO SECTION: Tailored Smartphone / Tablet / Desktop Views   */}
        {/* ------------------------------------------------------------- */}
        <section className="relative flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 w-full pt-4">
          <HeroDoodles />

          {/* SMARTPHONE DEVICE DESIGNED HERO VIEW (< 640px) */}
          <ScrollReveal direction="up" className="flex sm:hidden flex-col items-center text-center w-full z-10 gap-5">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 font-bold text-xs px-3.5 py-1.5 rounded-full border border-amber-200/80 shadow-sm">
              <Trophy className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
              <span>Award Winning Platform</span>
            </div>

            <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
              Where Learning <br />
              <span className="text-blue-600 relative inline-block">
                Meets Innovation
                <Sparkles className="absolute -right-5 -top-1 h-5 w-5 text-amber-400 fill-amber-300 animate-bounce" />
              </span>
            </h1>

            <div className="relative my-2 w-48 h-48 bg-gradient-to-b from-blue-100/50 to-indigo-100/30 rounded-3xl p-3 flex items-center justify-center border border-blue-200/50 shadow-inner">
              <img src={wisbyThumbs} alt="Wisby Mascot" className="w-full h-full object-contain" />
              <Compass className="absolute top-2 left-2 h-6 w-6 text-blue-500/60 animate-spin" />
              <Ruler className="absolute bottom-2 right-2 h-6 w-6 text-indigo-500/60" />
            </div>

            <p className="text-sm text-slate-600 font-medium leading-relaxed px-2">
              Wisdawn makes learning Science exciting and Coding empowering. Built by students, for students.
            </p>

            <div className="flex flex-col gap-3 w-full mt-2">
              <Link
                to="/auth"
                className="flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30"
              >
                Explore Wisdawn <ArrowRight className="h-4 w-4" />
              </Link>
              <button className="flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700">
                <PlayCircle className="h-4 w-4 text-blue-600" /> Watch Demo
              </button>
            </div>
          </ScrollReveal>

          {/* TABLET & DESKTOP DESIGNED HERO TEXT VIEW (>= 640px) */}
          <ScrollReveal direction="left" className="hidden sm:flex flex-1 flex-col items-start text-left max-w-xl z-10 shrink-0">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 font-bold text-xs md:text-sm px-4 py-1.5 rounded-full mb-6 border border-amber-200/80 shadow-sm">
              <Trophy className="h-4 w-4 text-amber-500 fill-amber-400" />
              <span>Award Winning Project <span className="opacity-40 mx-1">|</span> CodeWar 2026 Winner</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] text-slate-900 mb-6 tracking-tight">
              Where Learning<br />
              <span className="text-blue-600 relative inline-flex items-center">
                Meets Innovation
                <Sparkles className="absolute -right-7 -top-2 h-7 w-7 text-amber-400 fill-amber-300 animate-pulse" />
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-600 font-medium mb-8 leading-relaxed">
              Wisdawn is an award winning educational platform that makes learning Science exciting and Coding empowering. Built by students, for students.
            </p>

            <div className="flex flex-row items-center gap-4 w-full">
              <Link
                to="/auth"
                className="group flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm md:text-base font-bold text-white shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
              >
                Explore Wisdawn <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <button className="flex items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white px-7 py-3.5 text-sm md:text-base font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all">
                <PlayCircle className="h-5 w-5 text-blue-600" /> Watch Demo
              </button>
            </div>
          </ScrollReveal>

          {/* CODEWAR CARD - Responsive Across Mobile, Tablet & Desktop */}
          <ScrollReveal direction="right" className="w-full lg:w-auto lg:flex-1 max-w-full lg:max-w-[660px] bg-[#050C28] rounded-3xl sm:rounded-[2.25rem] p-5 sm:p-7 md:p-8 border-2 border-blue-500 shadow-2xl relative overflow-hidden flex flex-col justify-between z-10">
            <div className="flex flex-col sm:flex-row items-stretch justify-between gap-6 relative z-10">
              <div className="w-full sm:w-[48%] flex flex-col justify-between text-white py-0.5">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-7 h-7 text-amber-400 fill-amber-400" />
                    <span className="text-amber-400 font-extrabold text-xs tracking-wider uppercase">
                      Award Winning Project
                    </span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-none">
                    CodeWar
                  </h3>
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-400 tracking-tight block mt-1 leading-none">
                    2026
                  </span>
                  <p className="text-slate-300 font-medium text-sm sm:text-base mt-3">
                    Hackathon at Tezpur University
                  </p>
                </div>

                <ul className="flex flex-col gap-2.5 mt-6">
                  <li className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" /> 1st Place Winner
                  </li>
                  <li className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" /> Best Innovation
                  </li>
                  <li className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" /> Impactful Solution
                  </li>
                </ul>
              </div>

              <div className="w-full sm:w-[52%] bg-white rounded-2xl p-3 shadow-2xl flex flex-col justify-between border border-white/20">
                <div className="w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={codewarPhoto} alt="CodeWar Winners" className="w-full h-full object-cover" />
                </div>
                <div className="pt-3 pb-1 flex items-center justify-center gap-1.5 text-blue-900 font-bold text-center">
                  <span className="text-sm sm:text-base font-extrabold text-blue-900">Building dreams. Winning hearts.</span>
                  <Heart className="w-4 h-4 text-blue-600 fill-blue-600" />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ------------------------------------------------------------- */}
        {/*  VISION & TROPHY CONNECTOR SECTION                            */}
        {/* ------------------------------------------------------------- */}
        <section id="about" className="flex w-full bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 rounded-3xl p-6 md:p-10 flex-col md:flex-row items-center justify-between gap-6 md:gap-8 border border-blue-100 shadow-sm relative overflow-hidden">
          <ScrollReveal direction="left" className="flex-1 text-center md:text-left z-10 max-w-md">
            <h3 className="text-purple-900 font-black text-xl md:text-2xl mb-2">From a Winning Idea...</h3>
            <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed">It all started with a vision to make education accessible, interactive and enjoyable for everyone.</p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200} className="flex-1 max-w-xs shrink-0 z-10 w-full flex justify-center">
            <TrophyConnector logoSrc={wisdawnLogo} logoAlt="Wisdawn Logo" />
          </ScrollReveal>

          <ScrollReveal direction="right" delay={400} className="flex-1 text-center md:text-left z-10 max-w-md">
            <h3 className="text-blue-700 font-black text-xl md:text-2xl mb-2">To a New Era of Wisdawn</h3>
            <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed">Now, we bring that vision to life - Empowering students with engaging Science & powerful Coding technologies.</p>
          </ScrollReveal>
        </section>

        {/* ------------------------------------------------------------- */}
        {/*  WHAT WE OFFER: Tailored Responsive Cards                      */}
        {/* ------------------------------------------------------------- */}
        <section id="offerings" className="relative flex flex-col w-full pt-4">
          <ScrollReveal direction="down" className="text-center mb-12">
            <span className="text-blue-600 font-extrabold text-xs sm:text-sm uppercase tracking-widest mb-2 block">What We Offer</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Learn. Practice. Achieve. Repeat.</h2>
            <p className="text-slate-600 font-medium text-base sm:text-lg max-w-2xl mx-auto">Everything you need to excel in School Science and Coding, all in one place.</p>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">

            {/* School Academy Card */}
            <ScrollReveal direction="left" delay={100} className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/80 shadow-md relative overflow-hidden flex flex-col justify-between group hover:border-blue-300 transition-all">
              <Doodle anim="wd-spin-slow" className="-top-6 -right-6 h-36 w-36 text-blue-200/50">
                <AtomOrbitDoodle className="w-full h-full" />
              </Doodle>
              <div className="z-10 relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 shrink-0">
                    <img src={chemistryImage} alt="Science" className="h-8 w-8 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-blue-700">School Academy</h3>
                    <p className="text-slate-500 font-bold text-xs sm:text-sm">Class 9 - 10 | Science Made Fun</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed mb-6 max-w-md">
                  Explore Physics, Chemistry, Biology & Mathematics with interactive lessons, notes, practice modules and tests.
                </p>
                <div className="flex items-center gap-2 flex-wrap mb-8">
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100 flex items-center gap-1.5"><Atom className="h-3.5 w-3.5" /> Physics</span>
                  <span className="px-3 py-1.5 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-1.5"><TestTube className="h-3.5 w-3.5" /> Chemistry</span>
                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100 flex items-center gap-1.5"><FlaskConical className="h-3.5 w-3.5" /> Biology</span>
                  <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl text-xs font-bold border border-purple-100 flex items-center gap-1.5"><Calculator className="h-3.5 w-3.5" /> Mathematics</span>
                </div>
              </div>
              <div className="z-10 relative flex items-center justify-between">
                <button className="text-blue-600 font-bold text-sm sm:text-base flex items-center gap-2 hover:gap-3 transition-all">
                  Explore Now <ArrowRight className="h-4 w-4" />
                </button>
                <img src={wisbyThumbs} alt="Wisby Science" className="w-24 h-24 sm:w-28 sm:h-28 object-contain" />
              </div>
            </ScrollReveal>

            {/* Coding Bootcamp Card */}
            <ScrollReveal direction="right" delay={300} className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/80 shadow-md relative overflow-hidden flex flex-col justify-between group hover:border-indigo-300 transition-all">
              <Doodle anim="wd-pulse-soft" className="-top-4 -right-4 h-32 w-32 text-indigo-200/50">
                <CircuitDoodle className="w-full h-full" />
              </Doodle>
              <div className="z-10 relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 shrink-0">
                    <Code2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-indigo-700">Coding Bootcamp</h3>
                    <p className="text-slate-500 font-bold text-xs sm:text-sm">From Beginner to Builder</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed mb-6 max-w-md">
                  Learn modern programming languages, solve challenges, and build real-world software applications step by step.
                </p>
                <div className="flex items-center gap-2 flex-wrap mb-8">
                  <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold border border-amber-100 flex items-center gap-1.5"><img src={pythonIcon} alt="" className="h-3.5 w-3.5" /> Python</span>
                  <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100 flex items-center gap-1.5"><MonitorPlay className="h-3.5 w-3.5" /> Web Dev</span>
                  <span className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-xl text-xs font-bold border border-yellow-100 flex items-center gap-1.5"><img src={javascriptIcon} alt="" className="h-3.5 w-3.5" /> JavaScript</span>
                  <span className="px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-xl text-xs font-bold border border-cyan-100 flex items-center gap-1.5"><img src={reactIcon} alt="" className="h-3.5 w-3.5" /> React</span>
                </div>
              </div>
              <div className="z-10 relative flex items-center justify-between">
                <button className="text-indigo-600 font-bold text-sm sm:text-base flex items-center gap-2 hover:gap-3 transition-all">
                  Explore Now <ArrowRight className="h-4 w-4" />
                </button>
                <img src={wisbyCodingHero} alt="Wisby Coding" className="w-24 h-24 sm:w-28 sm:h-28 object-contain" />
              </div>
            </ScrollReveal>

          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/*  WHY STUDENTS LOVE WISDAWN                                    */}
        {/* ------------------------------------------------------------- */}
        <section id="achievements" className="relative flex flex-col w-full pt-6">
          <ScrollReveal direction="down" className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 inline-flex items-center gap-2">
              Why Students Love <span className="text-blue-600">Wisdawn</span> <Heart className="h-6 w-6 text-amber-400 fill-amber-400" />
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <ScrollReveal direction="up" delay={0} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <PlayCircle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Engaging Lessons</h4>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-snug">Learn with interactive videos, visuals and real-life examples.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={150} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Interactive Practice</h4>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-snug">Quizzes, gamified tests and code challenges to hone skills.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={300} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Smart Analytics</h4>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-snug">Track XP points, test metrics, rank and progress easily.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={450} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Anytime Learning</h4>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-snug">Optimized experience across phone, tablet, and desktop screens.</p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/*  LEARNING COMPANION & TESTIMONIAL                              */}
        {/* ------------------------------------------------------------- */}
        <section className="relative flex flex-col lg:flex-row gap-8 w-full pt-4">
          <ScrollReveal direction="left" className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50/60 rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 z-10">Meet Your Learning Companion</h3>
            <div className="relative inline-block z-10 mt-2">
              <img src={wisbyThumbs} alt="Wisby Mascot" className="w-52 h-52 sm:w-64 sm:h-64 object-contain" />
              <div className="absolute bottom-6 right-0 bg-white rounded-2xl p-3 shadow-xl border border-slate-200 max-w-[160px] text-left transform rotate-3">
                <p className="text-blue-600 font-extrabold text-xs mb-1">Hi! I'm Wisby 👋</p>
                <p className="text-slate-600 text-[11px] font-medium leading-tight">I'm here to make your learning journey exciting & fun!</p>
              </div>
            </div>
          </ScrollReveal>

          <div className="flex-1 flex flex-col gap-6">
            <ScrollReveal direction="right" delay={150} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 font-medium text-base sm:text-lg leading-relaxed mb-6 italic">
                "Wisdawn changed the way I study. Science is fun now and coding feels like magic!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                  R
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">- Rahul, Class 10</h4>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={300} className="bg-blue-600 rounded-3xl p-6 sm:p-8 shadow-xl text-white flex flex-col items-center text-center">
              <h3 className="text-2xl sm:text-3xl font-black mb-3">Ready to Start Your Journey?</h3>
              <p className="text-blue-100 font-medium text-sm mb-6 max-w-sm">Join thousands of students learning Science and Coding with Wisdawn.</p>
              <Link
                to="/auth"
                className="px-8 py-3.5 rounded-full bg-white text-sm font-black text-blue-700 shadow-lg hover:bg-blue-50 transition-all flex items-center gap-2"
              >
                Get Started Now <ArrowRight className="h-4 w-4" />
              </Link>
            </ScrollReveal>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-900 text-white pt-16 pb-8 px-5 md:px-10 lg:px-16 relative overflow-hidden mt-8 shadow-2xl">
        <Rocket className="absolute right-4 top-10 text-white/5 h-64 w-64 pointer-events-none -rotate-12" />

        <ScrollReveal direction="up" className="w-full max-w-[1536px] mx-auto flex flex-col relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 border-b border-slate-800 pb-12">
            <div>
              <div className="font-black text-2xl sm:text-3xl text-white">5K+</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Happy Students</div>
            </div>
            <div>
              <div className="font-black text-2xl sm:text-3xl text-white">1K+</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Video Lessons</div>
            </div>
            <div>
              <div className="font-black text-2xl sm:text-3xl text-white">300+</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Chapters</div>
            </div>
            <div>
              <div className="font-black text-2xl sm:text-3xl text-amber-400">Awarded</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">CodeWar 2026</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
            <div className="max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <img src={wisdawnLogo} alt="Wisdawn Logo" className="w-9 h-9 object-cover rounded-xl" />
                <span className="text-xl font-black uppercase tracking-wider text-white">Wisdawn</span>
              </div>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Learn Today. Lead Tomorrow.<br />
                Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline mx-0.5" /> for students who dream big.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-pink-600 hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" aria-label="YouTube" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-red-600 hover:text-white transition-colors"><Youtube className="w-4 h-4" /></a>
              <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-sky-500 hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 text-center">
            <p className="text-slate-500 text-xs font-bold">© 2026 Wisdawn. All rights reserved.</p>
          </div>
        </ScrollReveal>
      </footer>
    </div>
  );
}