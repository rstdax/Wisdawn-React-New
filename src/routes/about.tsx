import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building2 } from "lucide-react";
import { MobileFrame } from "@/components/mobile-frame";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About Us — WisDawn" }] }),
  component: About,
});

function About() {
  const navigate = useNavigate();

  return (
    <MobileFrame>
      <header className="flex md:hidden items-center gap-3 px-5 pt-2 pb-4">
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="grid h-9 w-9 place-items-center rounded-full active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-bold">About Us</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="hidden md:block mb-6 pt-6">
          <button
            onClick={() => navigate({ to: "/profile" })}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition mb-4 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Profile
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" /> About WisDawn
          </h1>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm mt-4 md:mt-0">
          <div className="space-y-4 text-sm text-muted-foreground">
            <h2 className="text-lg font-bold text-foreground">Welcome to WisDawn</h2>
            <p>
              WisDawn is a next-generation learning platform designed to help you master both school subjects and coding skills. Our mission is to provide accessible, high-quality education to learners everywhere.
            </p>
            
            <h3 className="text-base font-bold text-foreground mt-6">Our Vision</h3>
            <p>
              We believe that education should be engaging, interactive, and personalized. Whether you are preparing for your exams in the School Academy or building real-world projects in our Coding Bootcamp, WisDawn is here to guide you every step of the way.
            </p>

            <h3 className="text-base font-bold text-foreground mt-6">Why WisDawn?</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Comprehensive curriculums for school subjects and coding.</li>
              <li>Interactive lessons and real-world projects.</li>
              <li>Track your progress, earn points, and climb the leaderboard.</li>
              <li>Engaging community and direct support.</li>
            </ul>

            <div className="mt-8 pt-6 border-t border-border text-center text-xs">
              <p>WisDawn © {new Date().getFullYear()}</p>
              <p>All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
