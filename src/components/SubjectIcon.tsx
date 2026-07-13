// Shared helper — renders subject icon as <img> if URL, otherwise emoji/fallback

function isUrl(s?: string) {
  return !!s && (s.startsWith("http") || s.startsWith("/") || s.startsWith("data:"));
}

export function SubjectIcon({ icon, className = "h-12 w-12 text-2xl" }: { icon?: string; className?: string }) {
  return (
    <div className={`${className} shrink-0 rounded-2xl bg-primary-soft flex items-center justify-center overflow-hidden`}>
      {isUrl(icon) ? (
        <img src={icon} alt="subject icon" className="h-full w-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
      ) : (
        <span className="leading-none">{icon ?? "📘"}</span>
      )}
    </div>
  );
}
