import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/mobile-frame";
import { Wisby } from "@/components/wisby";

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
        <Link
          to="/onboarding"
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition active:scale-[0.98]"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-bold text-primary">
            G
          </span>
          Continue with Google
        </Link>
        <p className="mt-4 text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <span className="text-primary underline">Terms of Service</span> &{" "}
          <span className="text-primary underline">Privacy Policy</span>
        </p>
      </div>
    </MobileFrame>
  );
}
