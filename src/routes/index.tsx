import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signInWithGoogle, getUserProfile } from "@/lib/auth";
import { 
  PlayCircle, Trophy, Award, CheckCircle2, FlaskConical, Atom, TestTube,
  Code2, MonitorPlay, FileCode2, Cpu, Users, BookOpen, GraduationCap,
  Quote, ArrowRight, Sparkles, Medal, Lightbulb, Heart, Rocket
} from "lucide-react";
import wisdawnLogo from "@/assets/logo.jpeg";
import wisbyThumbs from "@/assets/wisby-thumbs.png";
import wisbyCodingHero from "@/assets/wisby-coding-hero.png";
import codewarPhoto from "@/assets/codewar-photo.png";

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
interface TrophyConnectorProps {
  /** URL/src for the middle logo image */
  logoSrc: string;
  /** Alt text for the logo image */
  logoAlt?: string;
  className?: string;
}

/**
 * Recreates a dashed curved connector line running into a
 * circular logo badge in the middle, then continuing out the other side.
 */
const TrophyConnector: React.FC<TrophyConnectorProps> = ({
  logoSrc,
  logoAlt = "Logo",
  className = "",
}) => {
  return (
    <div
      className={`relative flex items-center justify-center w-full max-w-md h-24 ${className}`}
    >
      {/* Dashed connector line running behind everything */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 500 100"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M 10 60 Q 50 20, 90 55 T 170 45 T 200 50"
          stroke="#9CA3AF"
          strokeWidth="2"
          strokeDasharray="6 6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 200 50 C 230 65, 250 75, 280 55 C 310 40, 330 50, 350 55 C 365 58, 378 48, 390 35"
          stroke="#9CA3AF"
          strokeWidth="2"
          strokeDasharray="6 6"
          strokeLinecap="round"
          fill="none"
        />
        {/* Straight line + arrow continuing from the end of the last curve */}
        <line
          x1="390"
          y1="35"
          x2="470"
          y2="35"
          stroke="#9CA3AF"
          strokeWidth="2"
          strokeDasharray="6 6"
          strokeLinecap="round"
        />
        <path
          d="M 470 35 L 485 35 M 478 28 L 485 35 L 478 42"
          stroke="#4B5563"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="absolute -left-16 top-1/2 z-10 h-16 w-16 -translate-y-1/2 text-amber-500 sm:h-20 sm:w-20"
      >
        <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" />
        <path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" />
        <path d="M18 9h1.5a1 1 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
        <path d="M6 9H4.5a1 1 0 0 1 0-5H6" />
      </svg>

      {/* Middle logo badge — keeps the provided image untouched */}
      <div className="z-10 flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white shadow-lg ring-1 ring-black/5 p-2 overflow-hidden">
        <img
          src={logoSrc}
          alt={logoAlt}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    </div>
  );
};

function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const user = await signInWithGoogle();
      const profile = await getUserProfile(user.uid);
      if (profile?.onboardingCompleted) {
        navigate({ to: "/home" });
      } else {
        navigate({ to: "/onboarding" });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 overflow-x-hidden flex flex-col items-center">
      
      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-6 md:px-12 lg:px-20 bg-white/95 backdrop-blur-md z-50 border-b border-slate-100/80">
        <div className="flex items-center gap-3.5 cursor-pointer">
          <img src={wisdawnLogo} alt="Wisdawn Logo" className="w-11 h-11 object-cover rounded-xl shadow-sm" />
          <span className="text-2xl md:text-3xl font-black tracking-tight text-[#0f172a] uppercase">Wisdawn</span>
        </div>
        
        <nav className="hidden lg:flex items-center gap-10 font-semibold text-base text-slate-600">
          <div className="relative text-blue-700 font-bold">
            Home
            <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-blue-600 rounded-full"></div>
          </div>
          <a href="#" className="hover:text-blue-600 transition-colors">About Us</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Courses</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Achievements</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
        </nav>

        <div className="flex items-center gap-5">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="hidden md:flex px-7 py-3 rounded-full border border-slate-200 text-base font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Log In
          </button>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="px-7 py-3 rounded-full bg-blue-600 text-base font-bold text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
          >
            {loading ? "..." : "Get Started"}
          </button>
        </div>
      </header>

      <main className="w-full max-w-[1536px] px-6 pt-28 md:px-10 lg:px-12 lg:pt-32 pb-16 flex flex-col gap-12 lg:gap-20 relative">
        
        {/* Floating Confetti Elements */}
        <div className="absolute top-10 right-5 w-3 h-3 bg-red-400 rounded-sm transform rotate-45 -z-10"></div>
        <div className="absolute top-40 right-20 w-2 h-2 bg-yellow-400 rounded-full -z-10"></div>
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full -z-10"></div>

        {error && (
          <div className="w-full bg-red-50 text-red-600 font-bold p-4 rounded-xl text-sm border border-red-100 shadow-sm">
            {error}
          </div>
        )}

        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10 xl:gap-12 w-full">
          
          {/* Left Column (Hero Text) */}
          <div className="flex-1 flex flex-col items-start text-left max-w-xl z-10 shrink-0">
            <div className="inline-flex items-center gap-2 bg-[#FFF8E7] text-[#D97706] font-semibold text-xs md:text-sm px-4 py-1.5 rounded-full mb-7 shadow-sm border border-[#FDE68A]">
              <Trophy className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>Award Winning Project <span className="opacity-50 mx-1">→</span> Building the Future of Learning</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] text-slate-900 mb-6 tracking-tight">
              Where Learning<br />Meets <span className="text-blue-600 relative inline-flex items-center">
                Innovation
                <Sparkles className="absolute -right-8 top-0 h-6 w-6 text-yellow-400 fill-yellow-400" />
              </span>
            </h1>
            
            <p className="text-base md:text-lg text-slate-600 font-medium mb-8 leading-relaxed max-w-[92%]">
              Wisdawn is an award winning educational platform that makes learning Science exciting and Coding empowering. Built by students, for students.
            </p>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoogleLogin}
                className="group flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 hover:-translate-y-1"
              >
                Explore Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button className="flex items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white px-7 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300">
                <PlayCircle className="h-4 w-4" /> Watch Demo
              </button>
            </div>
          </div>

          {/* Right Column: CodeWar 2026 Card (Exact Recreation) */}
          <div className="w-full lg:w-auto lg:flex-1 max-w-full lg:max-w-[660px] xl:max-w-[720px] bg-[#050C28] rounded-[2.25rem] p-5 sm:p-7 md:p-8 border-[2.5px] border-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.25)] relative overflow-hidden flex flex-col justify-between z-10 shrink-0">
            
            {/* Floating Micro-Confetti Particles */}
            <div className="absolute top-4 right-36 w-2 h-2 bg-red-500 rounded-sm rotate-45 pointer-events-none opacity-80" />
            <div className="absolute top-10 left-52 w-1.5 h-1.5 bg-amber-400 rounded-full pointer-events-none opacity-90" />
            <div className="absolute top-24 left-4 w-2.5 h-2.5 bg-sky-400 rounded-sm -rotate-12 pointer-events-none opacity-80" />
            <div className="absolute top-36 left-1/3 w-2 h-2 bg-pink-500 rounded-sm rotate-12 pointer-events-none opacity-70" />
            <div className="absolute bottom-16 left-28 w-2 h-2 bg-purple-400 rounded-sm rotate-45 pointer-events-none opacity-80" />
            <div className="absolute bottom-6 left-1/2 w-2.5 h-2.5 bg-amber-300 rounded-sm -rotate-45 pointer-events-none opacity-90" />
            <div className="absolute top-1/2 right-2 w-2 h-2.5 bg-rose-400 rounded-sm rotate-12 pointer-events-none opacity-70" />
            <div className="absolute top-6 right-6 w-2 h-2 bg-sky-300 rounded-full pointer-events-none opacity-90" />
            <div className="absolute bottom-4 right-8 w-2 h-2 bg-white rounded-full pointer-events-none opacity-80" />

            <div className="flex flex-col sm:flex-row items-stretch justify-between gap-6 sm:gap-7 md:gap-8 relative z-10">
              
              {/* Card Left Info Column */}
              <div className="w-full sm:w-[45%] flex flex-col justify-between text-white py-0.5 shrink-0">
                <div>
                  {/* Top Badge: Laurel Wreath + Trophy + Text */}
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="relative shrink-0 flex items-center justify-center">
                      <svg className="w-9 h-9 text-amber-400" viewBox="0 0 36 36" fill="none">
                        {/* Wreath left */}
                        <path d="M7 23C6 18 8.5 12 12.5 9" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                        <path d="M5.5 17.5C7.5 17 9 18.5 8 20.5" fill="#FBBF24" />
                        <path d="M7.5 12.5C9.5 12 11 13.5 10 15.5" fill="#FBBF24" />
                        <path d="M10.5 8.5C12.5 8 14 9.5 13 11.5" fill="#FBBF24" />
                        {/* Wreath right */}
                        <path d="M29 23C30 18 27.5 12 23.5 9" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                        <path d="M30.5 17.5C28.5 17 27 18.5 28 20.5" fill="#FBBF24" />
                        <path d="M28.5 12.5C26.5 12 25 13.5 26 15.5" fill="#FBBF24" />
                        <path d="M25.5 8.5C23.5 8 22 9.5 23 11.5" fill="#FBBF24" />
                        {/* Center Trophy */}
                        <path d="M13 11H23V17C23 19.7614 20.7614 22 18 22C15.2386 22 13 19.7614 13 17V11Z" fill="#FBBF24" />
                        <path d="M18 22V26M13.5 26H22.5" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                        <path d="M10 13H13V16H10C9.17157 16 8.5 15.3284 8.5 14.5V14.5C8.5 13.6716 9.17157 13 10 13Z" stroke="#FBBF24" strokeWidth="1.5" />
                        <path d="M26 13H23V16H26C26.8284 16 27.5 15.3284 27.5 14.5V14.5C27.5 13.6716 26.8284 13 26 13Z" stroke="#FBBF24" strokeWidth="1.5" />
                        {/* Trophy Star */}
                        <path d="M18 13.5L18.7 15L20.3 15.1L19.1 16.2L19.5 17.8L18 16.9L16.5 17.8L16.9 16.2L15.7 15.1L17.3 15L18 13.5Z" fill="#78350F" />
                      </svg>
                    </div>
                    <div className="flex flex-col text-[#FBBF24] font-extrabold text-[11px] sm:text-xs tracking-wider uppercase leading-[1.1]">
                      <span>Award Winning</span>
                      <span>Project</span>
                    </div>
                  </div>

                  {/* CodeWar 2026 Title */}
                  <div className="mb-4">
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">
                      CodeWar
                    </h3>
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F59E0B] tracking-tight block mt-1 leading-none">
                      2026
                    </span>
                  </div>

                  {/* Subtitle */}
                  <div className="text-slate-100 font-semibold text-sm sm:text-base leading-snug mb-6">
                    <p>Hackathon at</p>
                    <p>Tezpur University</p>
                  </div>
                </div>

                {/* Bullet Points */}
                <ul className="flex flex-col gap-3.5 mt-auto">
                  <li className="flex items-center gap-3 text-white font-bold text-sm sm:text-base">
                    <div className="w-6 h-6 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/50 flex items-center justify-center shrink-0">
                      <Trophy className="w-3.5 h-3.5 text-[#FBBF24] fill-[#FBBF24]" />
                    </div>
                    <span className="whitespace-nowrap">1st Place Winner</span>
                  </li>
                  <li className="flex items-center gap-3 text-white font-bold text-sm sm:text-base">
                    <div className="w-6 h-6 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/50 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-[#FBBF24] fill-[#FBBF24]" />
                    </div>
                    <span className="whitespace-nowrap">Best Innovation</span>
                  </li>
                  <li className="flex items-center gap-3 text-white font-bold text-sm sm:text-base">
                    <div className="w-6 h-6 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/50 flex items-center justify-center shrink-0">
                      <Rocket className="w-3.5 h-3.5 text-[#FBBF24] fill-none stroke-[2.5]" />
                    </div>
                    <span className="whitespace-nowrap">Impactful Solution</span>
                  </li>
                </ul>
              </div>

              {/* Card Right Column: White Inner Frame with Photo & Cursive Caption */}
              <div className="w-full sm:w-[55%] shrink-0 bg-white rounded-2xl md:rounded-[20px] p-2.5 sm:p-3 shadow-2xl flex flex-col justify-between border border-white/20">
                {/* Winner Photo Container */}
                <div className="w-full aspect-[16/9.5] rounded-xl overflow-hidden shadow-sm relative bg-slate-100 border border-slate-200">
                  <img 
                    src={codewarPhoto} 
                    alt="CodeWar 2026 Winners at Tezpur University" 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Bottom White Banner with Cursive Caption */}
                <div className="pt-2.5 pb-1 px-1 flex items-center justify-center gap-1.5 text-blue-900 font-bold text-center">
                  <span className="font-handwriting text-xl sm:text-2xl font-bold text-[#1E3A8A] tracking-wide leading-none whitespace-nowrap">
                    Building dreams. Winning hearts.
                  </span>
                  <Heart className="w-4.5 h-4.5 text-blue-600 fill-transparent stroke-[2.5] shrink-0 mb-0.5" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Vision / Transition Section */}
        <section className="w-full bg-[#F5F7FF] rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-10 border border-blue-50 shadow-sm relative overflow-visible">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100 rounded-full blur-[90px] -z-0 opacity-50"></div>
          
          <div className="flex-1 text-center md:text-left relative z-10 flex flex-col items-center md:items-start max-w-md">
            <h3 className="text-[#4C1D95] font-bold text-xl md:text-2xl mb-2.5">From a Winning Idea...</h3>
            <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed">It all started with a vision to make education accessible, interactive and enjoyable for everyone.</p>
          </div>

          <TrophyConnector 
            logoSrc={wisdawnLogo} 
            logoAlt="Wisdawn Logo" 
            className="flex-1 max-w-xs sm:max-w-md shrink-0 py-4 md:py-0 relative z-10" 
          />

          <div className="flex-1 flex items-center gap-5 relative z-10 max-w-md">
            <div className="flex-1 pr-44 text-center md:text-left lg:pr-56">
              <h3 className="text-blue-700 font-bold text-xl md:text-2xl mb-2.5">To a New Era of Wisdawn</h3>
              <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed">Now, we bring that vision to life - Empowering students with engaging Science & powerful Coding technologies.</p>
            </div>
            <div className="absolute bottom-0 right-0 z-20 hidden h-28 w-28 origin-bottom-right scale-[1.6] sm:block lg:scale-[2]">
              <img src={wisbyThumbs} alt="Wisdawn Mascot" className="w-full h-full object-contain" />
            </div>
          </div>
        </section>

        {/* What We Offer Section */}
        <section className="flex flex-col w-full pt-6">
          <div className="text-center mb-14">
            <span className="text-slate-500 font-bold text-sm uppercase tracking-[0.25em] mb-4 block">What We Offer</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-5">Learn. Practice. Achieve. Repeat.</h2>
            <p className="text-slate-600 font-medium text-lg md:text-xl">Everything you need to excel in School Science and Coding, all in one place.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">
            <div className="bg-[#FAFAFA] rounded-[2.5rem] p-10 md:p-12 lg:p-14 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-shadow duration-300 min-h-[360px]">
              <div className="flex items-start justify-between z-10 relative">
                <div className="max-w-[70%]">
                  <div className="flex items-center gap-5 mb-5">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-blue-600 shadow-inner shrink-0">
                      <FlaskConical className="h-10 w-10" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-extrabold text-blue-700">School Academy</h3>
                      <p className="text-slate-600 font-semibold text-base mt-1">Class 9 - 10 <span className="mx-2 text-slate-300">|</span> Science Made Fun</p>
                    </div>
                  </div>
                  <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed mb-12 max-w-md">
                    Explore Physics, Chemistry, Biology & more with interactive lessons, videos, notes and tests.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 z-10 relative mt-auto flex-wrap">
                <span className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold border border-blue-100"><Atom className="h-4 w-4" /> Physics</span>
                <span className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100"><TestTube className="h-4 w-4" /> Chemistry</span>
                <span className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-bold border border-green-100"><FlaskConical className="h-4 w-4" /> Biology</span>
              </div>
              <div className="absolute right-6 bottom-6 w-48 h-48 transition-transform duration-500 group-hover:scale-105">
                <img src={wisbyThumbs} alt="Wisdawn Science" className="w-full h-full object-contain" />
              </div>
              <button className="absolute bottom-12 right-12 text-blue-600 font-bold text-base flex items-center gap-1.5 hover:gap-3 transition-all">
                View All <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-[#F8F9FF] rounded-[2.5rem] p-10 md:p-12 lg:p-14 border border-[#E0E7FF] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-shadow duration-300 min-h-[360px]">
              <div className="flex items-start justify-between z-10 relative">
                <div className="max-w-[70%]">
                  <div className="flex items-center gap-5 mb-5">
                    <div className="w-20 h-20 rounded-2xl bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] shadow-inner shrink-0">
                      <Code2 className="h-10 w-10" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-extrabold text-[#4F46E5]">Coding Bootcamp</h3>
                      <p className="text-slate-600 font-semibold text-base mt-1">From Beginner to Builder</p>
                    </div>
                  </div>
                  <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed mb-12 max-w-md">
                    Learn programming, build real projects and level up your coding skills step by step.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 z-10 relative mt-auto flex-wrap">
                <span className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-600 rounded-xl text-sm font-bold border border-yellow-100"><FileCode2 className="h-4 w-4" /> Python</span>
                <span className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold border border-indigo-100"><MonitorPlay className="h-4 w-4" /> Web Dev</span>
                <span className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-sm font-bold border border-amber-100"><FileCode2 className="h-4 w-4" /> JavaScript</span>
                <span className="flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-600 rounded-xl text-sm font-bold border border-cyan-100"><Atom className="h-4 w-4" /> React</span>
              </div>
              <div className="absolute right-6 bottom-6 w-48 h-48 transition-transform duration-500 group-hover:scale-105">
                <img src={wisbyCodingHero} alt="Wisdawn Coding" className="w-full h-full object-contain" />
              </div>
              <button className="absolute bottom-12 right-12 text-[#4F46E5] font-bold text-base flex items-center gap-1.5 hover:gap-3 transition-all">
                View All <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Dark Blue Stats Footer */}
        <section className="w-full bg-[#0F172A] rounded-[2.5rem] p-8 md:p-12 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-10 mt-6 overflow-hidden relative shadow-2xl">
          <Rocket className="absolute right-0 top-1/2 -translate-y-1/2 text-white/5 h-80 w-80 -mr-10 -rotate-12 pointer-events-none" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-6 lg:gap-10 flex-1 w-full text-white relative z-10 divide-x divide-slate-800/50">
            <div className="flex items-center gap-4 px-2 md:px-0">
              <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="font-black text-xl md:text-2xl">5K+</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Happy Students</div>
              </div>
            </div>
            <div className="flex items-center gap-4 px-4">
              <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                <PlayCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="font-black text-xl md:text-2xl">1K+</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Video Lessons</div>
              </div>
            </div>
            <div className="flex items-center gap-4 px-4">
              <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="font-black text-xl md:text-2xl">300+</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Chapters</div>
              </div>
            </div>
            <div className="flex items-center gap-4 px-4">
              <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <div className="font-black text-xl md:text-2xl">50+</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Practice Tests</div>
              </div>
            </div>
            <div className="flex items-center gap-4 px-4 col-span-2 md:col-span-1">
              <div className="w-12 h-12 rounded-full border border-yellow-500/30 flex items-center justify-center text-yellow-500 bg-yellow-500/10 shrink-0">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <div className="font-black text-base md:text-lg text-yellow-500">Award Winning</div>
                <div className="text-[11px] text-slate-300 uppercase tracking-wider font-bold">CodeWar 2026</div>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex w-px h-20 bg-slate-800"></div>
          <div className="w-full lg:w-auto max-w-md flex items-start gap-4 relative z-10 px-4 md:px-0">
            <Quote className="h-9 w-9 text-blue-500 shrink-0 opacity-50 -mt-2" />
            <div>
              <p className="text-base font-medium text-slate-300 italic mb-2 leading-relaxed">
                "Education is not just learning, it's discovering endless possibilities."
              </p>
              <p className="text-xs font-bold text-slate-500">— Team Wisdawn</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
