/**
 * Ticket 1e drift guardrail (DESIGN.md / ~/dev/context/style.md "kept in sync"
 * pair): fails lint on new arbitrary Tailwind bracket values for size,
 * spacing, and motion in `className` — the exact pattern that made the design
 * system drift in the first place (design-handoff-bundle.md, Ticket 1). Scans
 * every string/template-literal piece inside a `className` attribute (plain
 * strings, template literals, and `cn(...)` calls all nest under it).
 *
 * Starts from a clean baseline (Ticket 1a–1c already swept the codebase), so
 * this enforces going forward rather than fighting legacy code.
 */

const CHECKS = [
  {
    re: /\btext-\[/,
    message:
      "no arbitrary text-[Npx] — use a type-ramp token (display-1..4 / text-lg|base|sm / mono-base|sm|xs). See DESIGN.md § Type.",
  },
  {
    // Spacing/inset utilities: p/m/gap/top/bottom/left/right/inset and their
    // t/b/l/r/x/y variants, immediately followed by an arbitrary bracket.
    re: /(?:^|\s)(?:p|m|gap|top|bottom|left|right|inset|[pm][trblxy])-\[[0-9]/,
    message:
      "no arbitrary spacing — snap to the 4px scale (p-2.25, gap-4.5, ...) or add a named layout constant. See DESIGN.md § Spacing & layout constants.",
  },
  {
    // Pointing a duration at one of the --motion-fast/base/slow vars via
    // var() is the sanctioned escape hatch (Tailwind v4 has no named-duration
    // theme namespace) — only raw ms literals are banned.
    re: /duration-\[(?!var\()/,
    message:
      "no raw transition duration — use duration-[var(--motion-fast|base|slow)]. See DESIGN.md § Motion.",
  },
  {
    re: /ease-\[/,
    message:
      "no raw easing curve — use the ease-standard / ease-out / ease-in utilities. See DESIGN.md § Motion.",
  },
];

function checkString(context, node, text) {
  if (typeof text !== "string") return;
  for (const { re, message } of CHECKS) {
    if (re.test(text)) {
      context.report({ node, message });
      return;
    }
  }
}

/** True if `node` has a `JSXAttribute` named `className` among its ancestors. */
function isInsideClassName(context, node) {
  const ancestors = context.sourceCode.getAncestors(node);
  return ancestors.some(
    (a) => a.type === "JSXAttribute" && a.name && a.name.name === "className"
  );
}

const rule = {
  meta: { type: "problem", docs: { description: "no arbitrary Tailwind design values in className" } },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value !== "string") return;
        if (!isInsideClassName(context, node)) return;
        checkString(context, node, node.value);
      },
      TemplateElement(node) {
        if (!isInsideClassName(context, node)) return;
        checkString(context, node, node.value.raw);
      },
    };
  },
};

const plugin = { rules: { "no-arbitrary-design-values": rule } };

export default plugin;
