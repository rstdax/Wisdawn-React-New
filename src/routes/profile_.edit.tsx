import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  User,
  GraduationCap,
  MapPin,
  Sparkles,
  ShieldCheck,
  Bookmark,
  Mail
} from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";
import { refreshUserProfile, useAuth } from "@/hooks/use-auth";
import { saveOnboardingData } from "@/lib/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ASSAM_DISTRICTS = [
  "Bajali", "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar",
  "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh",
  "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat",
  "Kamrup", "Kamrup Metropolitan (Guwahati)", "Karbi Anglong", "Karimganj",
  "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon (Marigaon)", "Nagaon",
  "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar",
  "Tamulpur", "Tinsukia", "Udalguri", "West Karbi Anglong",
];

// 20 predefined animal and bird face avatars
const ANIMAL_FACES = [
  "🐶", "🐱", "🐭", "🐹", "🐰", 
  "🦊", "🐻", "🐼", "🐨", "🐯",
  "🦁", "🐮", "🐷", "🐸", "🐵", 
  "🦉", "🐔", "🐧", "🐦", "🐤"
];

// Convert the emojis into valid SVG image URLs so they work perfectly inside the <img src="..." />
const AVATARS = ANIMAL_FACES.map(
  (emoji) =>
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".92em" font-size="85" x="50%" text-anchor="middle">${emoji}</text></svg>`
    )}`
);

type EditForm = {
  name: string;
  guardian: string;
  cls: string;
  dob: string;
  district: string;
  state: string;
  track: string;
  avatar?: string;
};

export const Route = createFileRoute("/profile_/edit")({
  head: () => ({ meta: [{ title: "Edit Profile - WisDawn" }] }),
  component: EditProfile,
});

function EditProfile() {
  const navigate = useNavigate();
  const { user, profile, displayName, displayEmail, loading } = useAuth();
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  
  const [form, setForm] = useState<EditForm>({
    name: "",
    guardian: "",
    cls: "",
    dob: "",
    district: "",
    state: "",
    track: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    const userAvatar = (profile as any)?.avatar || AVATARS[0];
    
    setForm({
      name: profile?.name || displayName || "",
      guardian: profile?.guardian || "",
      cls: profile?.cls || "",
      dob: profile?.dob || "",
      district: profile?.district || "",
      state: profile?.state || "Assam",
      track: profile?.track || "School Academy",
    });
    
    setSelectedAvatar(userAvatar);

    // Center the slider on the user's saved avatar on load
    setTimeout(() => {
      if (!sliderRef.current) return;
      const index = AVATARS.indexOf(userAvatar);
      if (index !== -1) {
        const container = sliderRef.current;
        const child = container.children[index] as HTMLElement;
        if (child) {
          container.scrollLeft = child.offsetLeft - container.clientWidth / 2 + child.clientWidth / 2;
        }
      }
    }, 100);
  }, [displayName, loading, profile]);

  const updateField = <Field extends keyof EditForm>(field: Field, value: EditForm[Field]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    
    // Calculate the center point of the visible scroll area
    const center = container.scrollLeft + container.clientWidth / 2;
    
    let closestIndex = 0;
    let minDistance = Infinity;
    
    // Find which avatar is closest to the center
    Array.from(container.children).forEach((child, index) => {
      const childEl = child as HTMLElement;
      const childCenter = childEl.offsetLeft + childEl.clientWidth / 2;
      const distance = Math.abs(center - childCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });
    
    const newAvatar = AVATARS[closestIndex];
    if (newAvatar !== selectedAvatar) {
      setSelectedAvatar(newAvatar);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Save both the form data and the selected avatar
      await saveOnboardingData(user.uid, { ...form, avatar: selectedAvatar } as any);
      await refreshUserProfile();
      navigate({ to: "/profile" });
    } finally {
      setSaving(false);
    }
  };

  // Dynamic theme based on selected track
  const isCoding = form.track === "Coding Bootcamp";

  const theme = isCoding
    ? {
      primaryText: "text-[#7C3AED]",
      primaryBg: "bg-[#7C3AED]",
      primaryHoverBg: "hover:bg-[#6D28D9]",
      accentBg: "bg-[#F3E8FF]",
      accentBorder: "border-[#F3E8FF]",
      avatarBg: "bg-[#EEF2FF]",
      focusBorder: "focus:border-[#7C3AED]",
      focusRing: "focus:ring-[#7C3AED]",
      bannerBg: "bg-[#F8F5FF]",
      bannerBorder: "border-[#F3E8FF]",
      bannerIconBorder: "border-[#E9D5FF]",
      bannerTitle: "text-[#5B21B6]",
      ringBorder: "border-[#7C3AED]"
    }
    : {
      primaryText: "text-blue-600",
      primaryBg: "bg-blue-600",
      primaryHoverBg: "hover:bg-blue-700",
      accentBg: "bg-blue-50",
      accentBorder: "border-blue-100",
      avatarBg: "bg-blue-50",
      focusBorder: "focus:border-blue-600",
      focusRing: "focus:ring-blue-600",
      bannerBg: "bg-blue-50/50",
      bannerBorder: "border-blue-100",
      bannerIconBorder: "border-blue-200",
      bannerTitle: "text-blue-950",
      ringBorder: "border-blue-600"
    };

  return (
    <MobileFrame>
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-3 md:px-0 md:pt-0 bg-[#F9FAFB] min-h-screen">
        <div className="mx-auto max-w-md sm:max-w-lg">
          {/* Header */}
          <div className="mb-5 flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/profile" })}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-2xs transition hover:bg-slate-50 cursor-pointer"
              aria-label="Back to profile"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Edit Profile</h1>
              <p className="text-xs text-slate-500 font-medium">Update your personal and learning details.</p>
            </div>
          </div>

          {/* User Avatar Slider Card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-2xs flex flex-col items-center text-center mb-4 overflow-hidden relative">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Slide to select avatar</p>
            
            <div className="relative w-full max-w-[320px] h-20 flex items-center justify-center">
              {/* Center Ring Indicator */}
              <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full border-[3px] ${theme.ringBorder} z-10 pointer-events-none transition-colors duration-300 drop-shadow-sm`} />
              
              {/* Scrollable Avatar Track */}
              <div 
                ref={sliderRef}
                onScroll={handleScroll}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory w-full h-full items-center px-[calc(50%-2rem)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {AVATARS.map((avatar, i) => {
                  const isSelected = selectedAvatar === avatar;
                  return (
                    <div key={i} className="shrink-0 h-16 w-16 snap-center flex items-center justify-center">
                      <img 
                        src={avatar} 
                        alt={`Avatar option ${i+1}`}
                        className={`rounded-full object-cover transition-all duration-300 ${theme.avatarBg} ${
                          isSelected 
                            ? "h-16 w-16 opacity-100 shadow-md p-1" 
                            : "h-12 w-12 opacity-40 grayscale-[40%] p-1"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <h2 className="mt-5 text-base sm:text-lg font-bold text-slate-900">
              {form.name || displayName || "Rohan Ranjan Das"}
            </h2>

            <div className={`mt-1.5 inline-flex items-center gap-1.5 rounded-lg ${theme.accentBg} px-2.5 py-0.5 text-[11px] font-semibold ${theme.primaryText} border ${theme.accentBorder} transition-colors duration-300`}>
              <Mail className="h-3 w-3 stroke-[2.2]" />
              <span>{user?.email || displayEmail || "user@gmail.com"}</span>
            </div>
          </div>

          {/* Personal Information Form Card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-2xs">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-4">
              <User className={`h-4 w-4 ${theme.primaryText} stroke-[2.5] transition-colors duration-300`} />
              <h3 className={`text-xs sm:text-sm font-bold ${theme.primaryText} transition-colors duration-300`}>Personal Information</h3>
            </div>

            {/* 2-Column Form Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Full Name */}
              <Field label="Full Name">
                <div className="relative flex items-center">
                  <User className={`absolute left-3 h-3.5 w-3.5 ${theme.primaryText} stroke-[2.2] pointer-events-none z-10 transition-colors duration-300`} />
                  <input
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className={`h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none ${theme.focusBorder} focus:ring-1 ${theme.focusRing} transition`}
                    placeholder="Rohan Ranjan Das"
                  />
                </div>
              </Field>

              {/* Guardian Name */}
              <Field label="Guardian Name">
                <div className="relative flex items-center">
                  <User className={`absolute left-3 h-3.5 w-3.5 ${theme.primaryText} stroke-[2.2] pointer-events-none z-10 transition-colors duration-300`} />
                  <input
                    value={form.guardian}
                    onChange={(e) => updateField("guardian", e.target.value)}
                    className={`h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none ${theme.focusBorder} focus:ring-1 ${theme.focusRing} transition`}
                    placeholder="Guardian Name"
                  />
                </div>
              </Field>

              {/* Class */}
              <Field label="Class">
                <div className="relative flex items-center">
                  <GraduationCap className={`absolute left-3 h-3.5 w-3.5 ${theme.primaryText} stroke-[2.2] pointer-events-none z-10 transition-colors duration-300`} />
                  <Select value={form.cls || undefined} onValueChange={(val) => updateField("cls", val)}>
                    <SelectTrigger className={`h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none ${theme.focusBorder} focus:ring-1 ${theme.focusRing} transition shadow-none [&>svg:last-child]:text-slate-400`}>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Class 9">Class 9</SelectItem>
                      <SelectItem value="Class 10">Class 10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Field>

              {/* Date of Birth - NATIVE DATE INPUT */}
              <Field label="Date of Birth">
                <div className="relative flex items-center">
                  <CalendarIcon className={`absolute left-3 h-3.5 w-3.5 ${theme.primaryText} stroke-[2.2] pointer-events-none z-10 transition-colors duration-300`} />
                  <input
                    type="date"
                    value={form.dob}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => updateField("dob", e.target.value)}
                    className={`h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs sm:text-sm font-medium ${form.dob ? "text-slate-800" : "text-slate-400"} focus:outline-none ${theme.focusBorder} focus:ring-1 ${theme.focusRing} transition appearance-none relative [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                  />
                </div>
              </Field>

              {/* State */}
              <Field label="State">
                <div className="relative flex items-center">
                  <MapPin className={`absolute left-3 h-3.5 w-3.5 ${theme.primaryText} stroke-[2.2] pointer-events-none z-10 transition-colors duration-300`} />
                  <Select value={form.state || undefined} onValueChange={(val) => updateField("state", val)}>
                    <SelectTrigger className={`h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none ${theme.focusBorder} focus:ring-1 ${theme.focusRing} transition shadow-none [&>svg:last-child]:text-slate-400`}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Assam">Assam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Field>

              {/* District */}
              <Field label="District">
                <div className="relative flex items-center">
                  <MapPin className={`absolute left-3 h-3.5 w-3.5 ${theme.primaryText} stroke-[2.2] pointer-events-none z-10 transition-colors duration-300`} />
                  <Select value={form.district || undefined} onValueChange={(val) => updateField("district", val)}>
                    <SelectTrigger className={`h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none ${theme.focusBorder} focus:ring-1 ${theme.focusRing} transition shadow-none [&>svg:last-child]:text-slate-400`}>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSAM_DISTRICTS.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Field>

              {/* Learning Track */}
              <Field label="Learning Track" className="col-span-2">
                <div className="relative flex items-center">
                  <Sparkles className={`absolute left-3 h-3.5 w-3.5 ${theme.primaryText} stroke-[2.2] pointer-events-none z-10 transition-colors duration-300`} />
                  <Select value={form.track || undefined} onValueChange={(val) => updateField("track", val)}>
                    <SelectTrigger className={`h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none ${theme.focusBorder} focus:ring-1 ${theme.focusRing} transition shadow-none [&>svg:last-child]:text-slate-400`}>
                      <SelectValue placeholder="Select track" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="School Academy">School Academy</SelectItem>
                      <SelectItem value="Coding Bootcamp">Coding Bootcamp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Field>

              {/* Security Info Banner */}
              <div className={`col-span-2 rounded-xl ${theme.bannerBg} border ${theme.bannerBorder} p-3 flex items-center gap-3 mt-1 transition-colors duration-300`}>
                <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white ${theme.primaryText} border ${theme.bannerIconBorder} shadow-2xs transition-colors duration-300`}>
                  <ShieldCheck className="h-4 w-4 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className={`text-[11px] font-bold ${theme.bannerTitle} transition-colors duration-300`}>Your information is safe with us.</h4>
                  <p className="text-[10px] text-slate-500 font-medium">We never share your personal data with anyone.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="col-span-2 grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => navigate({ to: "/profile" })}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50 cursor-pointer flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving || !user}
                  onClick={saveProfile}
                  className={`h-10 rounded-xl ${theme.primaryBg} px-4 text-xs font-bold text-white shadow-xs transition-all duration-300 ${theme.primaryHoverBg} active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5`}
                >
                  <Bookmark className="h-3.5 w-3.5 fill-current stroke-none" />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <label className="text-[10px] font-semibold text-slate-500 block">{label}</label>
      {children}
    </div>
  );
}