"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sections } from "@/lib/sections";
import { MobileNav } from "@/components/shell/MobileNav";
import { chrome } from "@/content/site";

type Crumb = { label: string; href: string };

function useBreadcrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ label: "~", href: "/" }];
  if (segments.length === 0) return crumbs;

  const [sectionSlug, contentSlug] = segments;
  const section = sections.find((s) => s.slug === sectionSlug);
  if (!section) {
    let href = "";
    for (const segment of segments) {
      href += `/${segment}`;
      crumbs.push({ label: segment, href });
    }
    return crumbs;
  }

  crumbs.push({ label: section.label.toLowerCase(), href: `/${section.slug}` });
  if (contentSlug) {
    const contentType = section.contentTypes.find((ct) => ct.slug === contentSlug);
    crumbs.push({
      label: contentType ? contentType.label.toLowerCase() : contentSlug,
      href: `/${section.slug}/${contentSlug}`,
    });
  }
  return crumbs;
}

export function TopBar() {
  const pathname = usePathname();
  const crumbs = useBreadcrumbs(pathname);

  return (
    <div className="sticky top-0 z-5 flex h-[var(--topbar-h)] items-center justify-between border-b border-border bg-[color-mix(in_srgb,var(--background)_86%,transparent)] px-9 backdrop-blur-[8px]">
      <div className="flex items-center gap-3">
        <MobileNav />
        <div className="flex items-center gap-1.5 font-mono text-xs text-faint">
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 && <span>/</span>}
              <Link href={crumb.href} className="hover:text-text">
                {crumb.label}
              </Link>
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 font-mono text-xs text-muted">
        <span className="inline-block h-3.5 w-3.5 rounded-[3px] bg-focal" />
        {chrome.topBarBadge}
      </div>
    </div>
  );
}
