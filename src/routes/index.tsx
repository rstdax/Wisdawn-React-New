import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileFrame } from "@/components/mobile-frame";
import { Wisby } from "@/components/wisby";
import { signInWithGoogle, getUserProfile } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WisDawn — Learn Today, Lead Tomorrow" },
      {
        name: "description",
        content: "Your smart learning companion for School Science & Coding.",
      },
      { property: "og:title", content: "WisDawn — Learn Today, Lead Tomorrow" },
      {
        property: "og:description",
        content: "Your smart learning companion for School Science & Coding.",
      },
    ],
  }),
  component: Welcome,
});

function Welcome() {
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
    <MobileFrame>
      <div className="flex flex-1 flex-col items-center px-7 pb-10 pt-6 text-center">
        <Wisby variant="logo" className="mt-2 w-44" />
        <p className="-mt-2 text-sm font-semibold tracking-wide text-muted-foreground">
          Learn Today, Lead Tomorrow
        </p>
        <div className="my-6 flex-1">
          <Wisby variant="cheer" className="mx-auto w-64" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground">Welcome to WisDawn!</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your smart learning companion for
          <br />
          School Science &amp; Coding.
        </p>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition active:scale-[0.98] disabled:opacity-70"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-bold text-primary">
            G
          </span>
          {loading ? "Signing in..." : "Continue with Google"}
        </button>
        {error && (
          <p className="mt-3 text-xs text-destructive font-semibold">{error}</p>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <span className="text-primary underline">Terms of Service</span> &{" "}
          <span className="text-primary underline">Privacy Policy</span>
        </p>
      </div>
    </MobileFrame>
  );
}
