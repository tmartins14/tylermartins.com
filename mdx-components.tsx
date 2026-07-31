import type { MDXComponents } from "mdx/types";

/**
 * Global MDX component overrides — required by @next/mdx for App Router.
 * Empty for now; a future write-up embedding a specific FootballD3 chart can
 * just `import { ShotMapPanel } from "@/components/charts/ShotMapPanel"` at
 * the top of its own content.mdx and use `<ShotMapPanel />` inline, rather
 * than registering every chart component globally here (which would pull
 * all of them into every MDX render/SSR path).
 */
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
