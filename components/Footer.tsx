import { dict } from "@/lib/i18n";
import { CrescentMoon } from "@/components/icons";
import { DevelopedBy } from "@/components/DevelopedBy";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line-soft px-5 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2.5">
            <CrescentMoon className="h-5 w-5 text-gold" />
            <span className="font-display text-lg text-mist">Saadat</span>
          </div>
          <p className="text-sm leading-relaxed text-mist-dim">{dict.footer.madeWith}</p>
        </div>

        <p className="mt-12 border-t border-line-soft pt-6 text-center text-[11px] text-mist-faint">
          © {new Date().getFullYear()} Saadat · Qur’an. Peace. Focus.
        </p>

        <DevelopedBy className="mt-4 text-center" />
      </div>
    </footer>
  );
}