import { cn } from "@/lib/utils";

/** "Developed by Elmaddin Nazarli" — gold name, opens LinkedIn in a new tab. */
export function DevelopedBy({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-mist-faint", className)}>
      Developed by{" "}
      <a
        href="https://www.linkedin.com/in/elinzrv/"
        target="_blank"
        rel="noreferrer"
        className="font-medium text-gold transition-colors duration-300 hover:text-gold-soft"
      >
        Elmaddin Nazarli
      </a>
    </p>
  );
}