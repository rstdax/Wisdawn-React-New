import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { MobileFrame } from "@/components/mobile-frame";
import { refreshUserProfile, useAuth } from "@/hooks/use-auth";
import { saveOnboardingData } from "@/lib/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ASSAM_DISTRICTS = [
  "Bajali", "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar",
  "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh",
  "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat",
  "Kamrup", "Kamrup Metropolitan (Guwahati)", "Karbi Anglong", "Karimganj",
  "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon (Marigaon)", "Nagaon",
  "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar",
  "Tamulpur", "Tinsukia", "Udalguri", "West Karbi Anglong",
];

type EditForm = {
  name: string;
  guardian: string;
  cls: string;
  dob: string;
  district: string;
  state: string;
  track: string;
};

const inputClassName = "w-full rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20";

export const Route = createFileRoute("/profile_/edit")({
  head: () => ({ meta: [{ title: "Edit Profile — WisDawn" }] }),
  component: EditProfile,
});

function EditProfile() {
  const navigate = useNavigate();
  const { user, profile, displayName, loading } = useAuth();
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
    setForm({
      name: profile?.name || displayName || "",
      guardian: profile?.guardian || "",
      cls: profile?.cls || "",
      dob: profile?.dob || "",
      district: profile?.district || "",
      state: profile?.state || "",
      track: profile?.track || "",
    });
  }, [displayName, loading, profile]);

  const updateField = <Field extends keyof EditForm>(field: Field, value: EditForm[Field]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveOnboardingData(user.uid, form);
      await refreshUserProfile();
      navigate({ to: "/profile" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileFrame>
      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-3 md:px-0 md:pt-0">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/profile" })}
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-muted"
              aria-label="Back to profile"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Edit Profile</h1>
              <p className="text-xs text-muted-foreground">Update your personal and learning details.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-xs md:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full Name">
                <input value={form.name} onChange={(event) => updateField("name", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Guardian Name">
                <input value={form.guardian} onChange={(event) => updateField("guardian", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Class">
                <Select value={form.cls || undefined} onValueChange={(val) => updateField("cls", val)}>
                  <SelectTrigger className={inputClassName}>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Class 9">Class 9</SelectItem>
                    <SelectItem value="Class 10">Class 10</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Date of Birth">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        inputClassName,
                        "justify-start text-left font-normal",
                        !form.dob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                      {form.dob ? format(new Date(form.dob), "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.dob ? new Date(form.dob) : undefined}
                      onSelect={(date) => updateField("dob", date ? format(date, "yyyy-MM-dd") : "")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </Field>
              <Field label="State">
                <Select value={form.state || undefined} onValueChange={(val) => updateField("state", val)}>
                  <SelectTrigger className={inputClassName}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assam">Assam</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="District">
                <Select value={form.district || undefined} onValueChange={(val) => updateField("district", val)}>
                  <SelectTrigger className={inputClassName}>
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
              </Field>
              <Field label="Learning Track" className="sm:col-span-2">
                <Select value={form.track || undefined} onValueChange={(val) => updateField("track", val)}>
                  <SelectTrigger className={inputClassName}>
                    <SelectValue placeholder="Select track" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="School Academy">School Academy</SelectItem>
                    <SelectItem value="Coding Bootcamp">Coding Bootcamp</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="mt-6 flex gap-3 border-t border-border pt-5">
              <button onClick={() => navigate({ to: "/profile" })} className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-bold text-muted-foreground transition hover:bg-muted">
                Cancel
              </button>
              <button disabled={saving || !user} onClick={saveProfile} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50">
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block space-y-1.5 ${className ?? ""}`}>
      <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
