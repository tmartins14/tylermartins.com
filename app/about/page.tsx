export default function AboutPage() {
  return (
    <div className="max-w-[1180px] px-9 pt-14 pb-10">
      <div className="mb-4 font-mono text-xs tracking-[0.14em] text-focal uppercase">About</div>
      <h1 className="display mb-[18px] text-[46px] leading-[1.03]">Tyler Martins</h1>

      <div className="max-w-[60ch] text-[17px] leading-[1.6] text-muted">
        <p className="mb-5">
          I&apos;m a data engineer who builds things on the side. This site is where whatever
          I&apos;m currently into — starting with football — turns into tooling, visualizations,
          and interactive pieces. Different subjects, same thread: data.
        </p>
        <p className="mb-5">
          I&apos;m drawn to presentation-focused data work: taking known analytical approaches
          and finding a clearer, more interactive way to show them. Reference points like The
          Pudding and the Chelsea Vizathon are a big part of why this site looks the way it
          does. Longer term, I&apos;m interested in roles that sit at that intersection —
          sports research and engineering work in the vein of Arsenal&apos;s Research Engineer
          role.
        </p>
      </div>

      <a
        href="https://github.com/tmartins14"
        className="mt-2 inline-block rounded-md border border-border bg-surface px-4 py-2 font-mono text-xs text-text"
      >
        GitHub → github.com/tmartins14
      </a>
    </div>
  );
}
