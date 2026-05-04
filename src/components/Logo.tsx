import { Shield } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "h-9 w-9" : size === "sm" ? "h-6 w-6" : "h-7 w-7";
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <div className={`${dim} relative grid place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-glow glow group-hover:scale-105 transition-transform`}>
        <Shield className="h-1/2 w-1/2 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <span className={`${text} font-bold tracking-tight`}>
        Shield<span className="text-gradient">Vault</span>
      </span>
    </Link>
  );
}
