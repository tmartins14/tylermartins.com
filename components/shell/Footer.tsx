import { StatsBombAttribution } from "@/components/StatsBombAttribution";
import { chrome } from "@/content/site";

export function Footer() {
  return (
    <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border px-9 py-7">
      <div className="font-mono text-xs text-faint">{chrome.footer.copyright}</div>
      <div className="flex items-center gap-5 font-mono text-xs text-muted">
        <a href="https://github.com/tmartins14">{chrome.footer.githubLabel}</a>
        <a href="/about">{chrome.footer.aboutLabel}</a>
        <StatsBombAttribution variant="inline" size={14} />
      </div>
    </footer>
  );
}
