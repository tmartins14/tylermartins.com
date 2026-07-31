import { aboutContent } from "@/content/site";

export default function AboutPage() {
  return (
    <div className="max-w-[1180px] px-9 pt-14 pb-10">
      <div className="mb-4 font-mono text-xs tracking-[0.14em] text-focal uppercase">
        {aboutContent.eyebrow}
      </div>
      <h1 className="display mb-[18px] text-[46px] leading-[1.03]">{aboutContent.heading}</h1>

      <div className="max-w-[60ch] text-[17px] leading-[1.6] text-muted">
        {aboutContent.paragraphs.map((paragraph, i) => (
          <p key={i} className="mb-5">
            {paragraph}
          </p>
        ))}
      </div>

      <a
        href="https://github.com/tmartins14"
        className="mt-2 inline-block rounded-md border border-border bg-surface px-4 py-2 font-mono text-xs text-text"
      >
        {aboutContent.githubLabel}
      </a>
    </div>
  );
}
