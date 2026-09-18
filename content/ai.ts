/** Card title + blurb are identical on the homepage and the AI section index — defined once here so both import the same copy. */
export const aiCards = {
  matchSummary: {
    title: "AI Match Summary",
    blurb:
      "A generated outcome-and-tactics summary for a single match, built from structured StatsBomb data and a Claude model — not a live chat feature, a shipped, static piece of the dashboard.",
  },
};

export const aiIndexContent = {
  eyebrow: "Section",
  heading: "AI",
  paragraphs: [
    "AI-engineering work built into the rest of the site — not a chatbot, a set of shipped features that take structured data and turn it into something a person can read.",
    "Starting with one: a match summary generated from StatsBomb event data by a Claude model, embedded in the Match Analysis Dashboard.",
  ],
  cardEyebrows: {
    matchSummary: "Content type · showcase",
  },
};
