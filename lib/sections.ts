export type ContentType = {
  slug: string;
  label: string;
};

export type Section = {
  slug: string;
  label: string;
  count: number;
  contentTypes: ContentType[];
};

/**
 * Drives the rail's section list and sub-nav. Adding a second section is one
 * entry here plus a new `app/<slug>/` route folder — no shell changes.
 */
export const sections: Section[] = [
  {
    slug: "football",
    label: "Football",
    count: 17,
    contentTypes: [
      { slug: "", label: "Overview" },
      { slug: "components", label: "FootballD3 Gallery" },
      { slug: "dashboard", label: "Match Analysis Dashboard" },
    ],
  },
];
