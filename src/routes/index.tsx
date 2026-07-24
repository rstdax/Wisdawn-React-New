import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signInWithGoogle, getUserProfile } from "@/lib/auth";
import { 
  PlayCircle, Trophy, Award, CheckCircle2, FlaskConical, Atom, TestTube,
  Code2, MonitorPlay, FileCode2, Cpu, Users, BookOpen, GraduationCap,
  Quote, ArrowRight, Sparkles, Medal, Lightbulb, Heart, Rocket
} from "lucide-react";
import wisdawnLogo from "@/assets/wisdawn-logo.jpeg";
import wisbyThumbs from "@/assets/wisby-thumbs.jpeg";
import wisbyCodingHero from "@/assets/wisby-coding-hero.png";

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
      <header className="w-full max-w-[1400px] flex items-center justify-between px-6 py-6 md:px-12 lg:px-20 bg-white z-50">
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white font-bold text-2xl rounded-xl">
            W
          </div>
          <span className="text-2xl font-black tracking-tight text-[#0f172a] uppercase">Wisdawn</span>
        </div>
        
        <nav className="hidden lg:flex items-center gap-8 font-semibold text-sm text-slate-600">
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

        <div className="flex items-center gap-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="hidden md:flex px-6 py-2.5 rounded-full border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Log In
          </button>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="px-6 py-2.5 rounded-full bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
          >
            {loading ? "..." : "Get Started"}
          </button>
        </div>
      </header>

      <main className="w-full max-w-[1400px] px-6 md:px-12 lg:px-20 pb-16 flex flex-col gap-12 lg:gap-20 mt-4 relative">
        
        {/* Floating Confetti Elements */}
        <div className="absolute top-10 right-5 w-3 h-3 bg-red-400 rounded-sm transform rotate-45 -z-10"></div>
        <div className="absolute top-40 right-20 w-2 h-2 bg-yellow-400 rounded-full -z-10"></div>
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full -z-10"></div>

        {error && (
          <div className="w-full bg-red-50 text-red-600 font-bold p-4 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          {/* Left Column (Text) */}
          <div className="flex-1 flex flex-col items-start text-left max-w-xl z-10">
            <div className="inline-flex items-center gap-2 bg-[#FFF8E7] text-[#D97706] font-semibold text-xs md:text-sm px-4 py-1.5 rounded-full mb-8 shadow-sm border border-[#FDE68A]">
              <Trophy className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>Award Winning Project <span className="opacity-50 mx-1">→</span> Building the Future of Learning</span>
            </div>
            
            <h1 className="text-[2.75rem] md:text-6xl font-extrabold leading-[1.1] text-slate-900 mb-6 tracking-tight">
              Where Learning<br />Meets <span className="text-blue-600 relative inline-flex items-center">
                Innovation
                <Sparkles className="absolute -right-8 top-0 h-6 w-6 text-yellow-400 fill-yellow-400" />
              </span>
            </h1>
            
            <p className="text-base md:text-lg text-slate-600 font-medium mb-8 leading-relaxed max-w-[90%]">
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
          
          {/* Center Mascot */}
          <div className="hidden md:flex w-64 h-64 shrink-0 relative z-10 justify-center items-center">
            <div className="absolute w-48 h-48 bg-blue-100/50 rounded-full blur-2xl -z-10"></div>
            <img src={wisbyThumbs} alt="Wisdawn Owl" className="w-full h-full object-contain transform hover:scale-105 transition-transform duration-500" />
          </div>

          {/* Right Column (CodeWar Card) */}
          <div className="flex-1 w-full max-w-sm lg:max-w-md bg-[#0F172A] rounded-[2rem] overflow-hidden shadow-2xl relative z-10 flex flex-col border border-slate-800">
            {/* Card Content Top */}
            <div className="p-6 md:p-8 flex flex-col text-white pb-4 relative z-10">
              <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-4">
                <Trophy className="h-4 w-4" /> Award Winning Project
              </div>
              <h3 className="text-3xl font-extrabold mb-1">CodeWar 2026</h3>
              <p className="text-slate-300 text-sm font-medium mb-6">Hackathon at Tezpur University</p>
              
              <ul className="flex flex-col gap-3">
                <li className="flex items-center gap-3 text-sm font-semibold text-slate-200">
                  <Medal className="h-5 w-5 text-yellow-400" /> 1st Place Winner
                </li>
                <li className="flex items-center gap-3 text-sm font-semibold text-slate-200">
                  <Lightbulb className="h-5 w-5 text-yellow-400" /> Best Innovation
                </li>
                <li className="flex items-center gap-3 text-sm font-semibold text-slate-200">
                  <CheckCircle2 className="h-5 w-5 text-yellow-400" /> Impactful Solution
                </li>
              </ul>
            </div>
            
            {/* Card Photo placeholder */}
            <div className="absolute top-4 right-4 w-1/2 h-[75%] rounded-2xl overflow-hidden shadow-inner border border-white/10 hidden sm:block">
               <div className="w-full h-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center p-4">
                  <div className="text-center">
                    <Trophy className="h-10 w-10 text-white/80 mx-auto mb-2" />
                    <p className="text-white font-bold text-sm">Winning Team</p>
                  </div>
               </div>
            </div>

            {/* Card Footer */}
            <div className="bg-white px-6 py-4 mt-auto rounded-b-[2rem] flex items-center justify-center gap-2 border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.2)] relative z-20">
              <span className="text-slate-800 font-bold italic text-sm">Building dreams. Winning hearts.</span>
              <Heart className="h-4 w-4 text-slate-400 stroke-[3]" />
            </div>
          </div>
        </section>

        {/* Vision / Transition Section */}
        <section className="w-full bg-[#F5F7FF] rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-blue-50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-[80px] -z-0 opacity-50"></div>
          
          <div className="flex-1 text-center md:text-left relative z-10 flex flex-col items-center md:items-start max-w-sm">
            <h3 className="text-[#4C1D95] font-bold text-lg mb-2">From a Winning Idea...</h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">It all started with a vision to make education accessible, interactive and enjoyable for everyone.</p>
          </div>

          <div className="flex-1 flex items-center justify-center relative z-10 py-6 md:py-0 w-full max-w-[250px]">
            <Trophy className="absolute left-0 opacity-10 h-16 w-16 text-slate-400 -translate-x-1/2" />
            <div className="w-20 h-20 bg-white rounded-full shadow-xl shadow-blue-900/10 flex items-center justify-center z-10 border-4 border-[#F5F7FF] flex-shrink-0 relative">
              <span className="text-blue-600 font-extrabold text-3xl">W</span>
            </div>
            <div className="absolute left-1/2 right-0 top-1/2 -translate-y-1/2 h-0 border-t-2 border-dashed border-slate-300 w-1/2 -z-10"></div>
            <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          </div>

          <div className="flex-1 flex items-center gap-4 relative z-10 max-w-sm">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-blue-700 font-bold text-lg mb-2">To a New Era of Wisdawn</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">Now, we bring that vision to life - Empowering students with engaging Science & powerful Coding technologies.</p>
            </div>
            <div className="w-24 h-24 shrink-0 -mt-8 hidden sm:block">
              <img src={wisbyThumbs} alt="Wisdawn Mascot" className="w-full h-full object-contain" />
            </div>
          </div>
        </section>

        {/* What We Offer Section */}
        <section className="flex flex-col w-full pt-10">
          <div className="text-center mb-12">
            <span className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mb-3 block">What We Offer</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Learn. Practice. Achieve. Repeat.</h2>
            <p className="text-slate-500 font-medium">Everything you need to excel in School Science and Coding, all in one place.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="bg-[#FAFAFA] rounded-[2rem] p-8 md:p-10 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-shadow duration-300 min-h-[300px]">
              <div className="flex items-start justify-between z-10 relative">
                <div className="max-w-[70%]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-blue-600 shadow-inner">
                      <FlaskConical className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-blue-700">School Academy</h3>
                      <p className="text-slate-600 font-semibold text-sm">Class 9 - 10 <span className="mx-2 text-slate-300">|</span> Science Made Fun</p>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 max-w-sm">
                    Explore Physics, Chemistry, Biology & more with interactive lessons, videos, notes and tests.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 z-10 relative mt-auto flex-wrap">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100"><Atom className="h-3.5 w-3.5" /> Physics</span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100"><TestTube className="h-3.5 w-3.5" /> Chemistry</span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold border border-green-100"><FlaskConical className="h-3.5 w-3.5" /> Biology</span>
              </div>
              <div className="absolute right-4 bottom-4 w-40 h-40 transition-transform duration-500 group-hover:scale-105">
                <img src={wisbyThumbs} alt="Wisdawn Science" className="w-full h-full object-contain" />
              </div>
              <button className="absolute bottom-10 right-10 text-blue-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                View All <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-[#F8F9FF] rounded-[2rem] p-8 md:p-10 border border-[#E0E7FF] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-shadow duration-300 min-h-[300px]">
              <div className="flex items-start justify-between z-10 relative">
                <div className="max-w-[70%]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] shadow-inner">
                      <Code2 className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-[#4F46E5]">Coding Bootcamp</h3>
                      <p className="text-slate-600 font-semibold text-sm">From Beginner to Builder</p>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 max-w-sm">
                    Learn programming, build real projects and level up your coding skills step by step.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 z-10 relative mt-auto flex-wrap">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-lg text-xs font-bold border border-yellow-100"><FileCode2 className="h-3.5 w-3.5" /> Python</span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100"><MonitorPlay className="h-3.5 w-3.5" /> Web Dev</span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold border border-amber-100"><FileCode2 className="h-3.5 w-3.5" /> JavaScript</span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-600 rounded-lg text-xs font-bold border border-cyan-100"><Atom className="h-3.5 w-3.5" /> React</span>
              </div>
              <div className="absolute right-4 bottom-4 w-40 h-40 transition-transform duration-500 group-hover:scale-105">
                <img src={wisbyCodingHero} alt="Wisdawn Coding" className="w-full h-full object-contain" />
              </div>
              <button className="absolute bottom-10 right-10 text-[#4F46E5] font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                View All <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Dark Blue Stats Footer */}
        <section className="w-full bg-[#0F172A] rounded-[2rem] p-6 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 mt-10 overflow-hidden relative shadow-2xl">
          <Rocket className="absolute right-0 top-1/2 -translate-y-1/2 text-white/5 h-64 w-64 -mr-10 -rotate-12 pointer-events-none" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 lg:gap-8 flex-1 w-full text-white relative z-10 divide-x divide-slate-800/50">
            <div className="flex items-center gap-3 px-2 md:px-0">
              <div className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-300">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <div className="font-extrabold text-lg">5K+</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Happy Students</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4">
              <div className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-300">
                <PlayCircle className="h-4 w-4" />
              </div>
              <div>
                <div className="font-extrabold text-lg">1K+</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Video Lessons</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4">
              <div className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-300">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <div className="font-extrabold text-lg">300+</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Chapters</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4">
              <div className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-300">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <div className="font-extrabold text-lg">50+</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Practice Tests</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 col-span-2 md:col-span-1">
              <div className="w-10 h-10 rounded-full border border-yellow-500/30 flex items-center justify-center text-yellow-500 bg-yellow-500/10">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-yellow-500">Award Winning</div>
                <div className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">CodeWar 2026</div>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex w-px h-16 bg-slate-800"></div>
          <div className="w-full lg:w-auto max-w-sm flex items-start gap-4 relative z-10 px-4 md:px-0">
            <Quote className="h-8 w-8 text-blue-500 shrink-0 opacity-50 -mt-2" />
            <div>
              <p className="text-sm font-medium text-slate-300 italic mb-2 leading-relaxed">
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
