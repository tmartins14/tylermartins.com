export type ContentType = {
  slug: string;
  label: string;
};

export type Section = {
  slug: string;
  label: string;
  contentTypes: ContentType[];
};

/**
 * Drives the rail's section list and the topbar breadcrumb labels. Adding a
 * second section is one entry here plus a new `app/<slug>/` route folder —
 * no shell changes.
 */
export const sections: Section[] = [
  {
    slug: "football",
    label: "Football",
    contentTypes: [
      { slug: "components", label: "FootballD3 Gallery" },
      { slug: "dashboard", label: "Match Analysis Dashboard" },
      { slug: "player-match-analysis", label: "Player Match Analysis" },
    ],
  },
  {
    slug: "ai",
    label: "AI",
    contentTypes: [{ slug: "match-summary", label: "Match Summary" }],
  },
];
