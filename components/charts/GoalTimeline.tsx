type Goal = { minute: number; team: string; player: string };

/** Horizontal 0'-90' axis with goal stems — Spain above the line, England below. */
export function GoalTimeline({
  goals,
  homeTeam,
}: {
  goals: Goal[];
  homeTeam: string;
}) {
  const W = 1080;
  // H/axisY leave enough headroom above the axis for a home-team goal label
  // (stem + text) to clear the SVG's own top edge without its glyphs clipping —
  // at the old Hh=52/y=26 the label baseline sat at y=4, clipping ascenders.
  const H = 78;
  const y = 38;
  const maxMinute = Math.max(90, ...goals.map((g) => g.minute));
  const x = (m: number) => 40 + (m / maxMinute) * (W - 80);
  const ticks = [0, 15, 30, 45, 60, 75, 90];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      <line x1={40} y1={y} x2={W - 40} y2={y} stroke="var(--border-strong)" strokeWidth={1} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} y1={y - 4} x2={x(t)} y2={y + 4} stroke="var(--border-strong)" strokeWidth={1} />
          <text
            x={x(t)}
            y={y + 18}
            fill="var(--faint)"
            fontSize={9}
            fontFamily="Geist Mono, monospace"
            textAnchor="middle"
          >
            {t}&apos;
          </text>
        </g>
      ))}
      {goals.map((g, i) => {
        const isHome = g.team === homeTeam;
        const color = isHome ? "var(--focal)" : "var(--secondary)";
        const gy = isHome ? y - 16 : y + 16;
        const surname = g.player.split(" ").slice(-1)[0];
        return (
          <g key={i}>
            <line x1={x(g.minute)} y1={y} x2={x(g.minute)} y2={gy} stroke={color} strokeWidth={1.4} />
            <circle cx={x(g.minute)} cy={gy} r={4} fill={color} />
            <text
              x={x(g.minute)}
              y={isHome ? gy - 6 : gy + 13}
              fill={color}
              fontSize={10}
              fontFamily="Geist Mono, monospace"
              fontWeight={600}
              textAnchor="middle"
            >
              {surname} {g.minute}&apos;
            </text>
          </g>
        );
      })}
    </svg>
  );
}
