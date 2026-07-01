import cheerAsset from "@/assets/wisby-cheer.jpeg";
import thumbsAsset from "@/assets/wisby-thumbs.jpeg";
import logoAsset from "@/assets/wisdawn-logo.jpeg";

type Variant = "cheer" | "thumbs" | "logo";

const map: Record<Variant, { url: string }> = {
  cheer: { url: cheerAsset },
  thumbs: { url: thumbsAsset },
  logo: { url: logoAsset },
};

export function Wisby({
  variant = "thumbs",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  return (
    <img
      src={map[variant].url}
      alt="Wisby the WisDawn owl"
      className={className}
      draggable={false}
    />
  );
}
