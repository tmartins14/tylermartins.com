/** Card title + blurb are identical on the homepage and the football section index — defined once here so both import the same copy. */
export const footballCards = {
  components: {
    title: "FootballD3 Gallery",
    blurb:
      "Shot maps, pass networks, xT surfaces — every footballd3 component with sample data, a preview, a description, and the code behind it.",
  },
  dashboard: {
    title: "Match Analysis Dashboard",
    blurb: "A single game in one view — every shot, pass, and swing of momentum.",
  },
};

export const footballIndexContent = {
  eyebrow: "Section",
  heading: "Football",
  paragraphs: [
    "A football analytics playground focused on interactivity, tooling, and animation. Taking novel concepts and presenting them in an interactive way, making football data more accessible and easier to understand.",
    "Everything here is built with footballd3, a custom D3 component library, on top of free open data (i.e StatsBomb).",
  ],
  cardEyebrows: {
    components: "Content type · library",
    dashboard: "Content type · dashboard",
  },
};
