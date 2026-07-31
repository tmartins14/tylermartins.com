"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sections } from "@/lib/sections";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { cn } from "@/lib/utils";

/** Nav content shared between the desktop rail and the mobile drawer (MobileNav). */
export function RailNavContent() {
  const pathname = usePathname();

  return (
    <>
      <Link href="/" className="mb-[30px] flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-focal font-display text-[17px] font-black text-rail-active-fg">
          T
        </div>
        <div className="leading-[1.1]">
          <div className="font-mono text-xs tracking-[0.1em] text-text">tylermartins</div>
          <div className="font-mono text-[10px] tracking-[0.08em] text-faint">.com</div>
        </div>
      </Link>

      <div className="px-2.5 py-1.5 font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
        Sections
      </div>

      {sections.map((section) => {
        const sectionHref = `/${section.slug}`;
        const active = pathname === sectionHref || pathname.startsWith(`${sectionHref}/`);

        return (
          <Link
            key={section.slug}
            href={sectionHref}
            className={cn(
              "flex items-center justify-between rounded-md px-2.5 py-[9px] font-mono text-[13px]",
              active ? "bg-focal text-rail-active-fg" : "text-text"
            )}
          >
            <span>{section.label}</span>
            <span className="text-[10px] opacity-70">{section.count}</span>
          </Link>
        );
      })}

      <div className="mt-3.5 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
        Site
      </div>
      <Link
        href="/about"
        className={cn(
          "rounded-md px-2.5 py-[9px] font-mono text-[13px]",
          pathname === "/about" ? "bg-focal text-rail-active-fg" : "text-text"
        )}
      >
        About
      </Link>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
        <span className="font-mono text-[11px] text-faint">theme</span>
        <ThemeToggle />
      </div>
    </>
  );
}

/** Sticky desktop sidebar — hidden below `lg:`, where MobileNav's drawer takes over. */
export function Rail() {
  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface px-4 py-[22px] lg:sticky lg:top-0 lg:flex">
      <RailNavContent />
    </aside>
  );
}
