"use client";

import { usePathname } from "next/navigation";
import { sections } from "@/lib/sections";
import { MobileNav } from "@/components/shell/MobileNav";

function useBreadcrumb(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "~ /";

  const [sectionSlug, contentSlug] = segments;
  const section = sections.find((s) => s.slug === sectionSlug);
  if (!section) return `~ / ${segments.join(" / ")}`;

  const parts = [section.label.toLowerCase()];
  if (contentSlug) {
    const contentType = section.contentTypes.find((ct) => ct.slug === contentSlug);
    parts.push(contentType ? contentType.label.toLowerCase() : contentSlug);
  }
  return `~ / ${parts.join(" / ")}`;
}

export function TopBar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-5 flex h-[var(--topbar-h)] items-center justify-between border-b border-border bg-[color-mix(in_srgb,var(--background)_86%,transparent)] px-9 backdrop-blur-[8px]">
      <div className="flex items-center gap-3">
        <MobileNav />
        <div className="font-mono text-xs text-faint">{useBreadcrumb(pathname)}</div>
      </div>
      <div className="flex items-center gap-2 font-mono text-xs text-muted">
        <span className="inline-block h-3.5 w-3.5 rounded-[3px] bg-focal" />
        StatsBomb open data
      </div>
    </div>
  );
}
