import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import designValues from "./eslint-rules/no-arbitrary-design-values.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    // components/ui/** is vendored shadcn/ui, regenerated via the shadcn CLI,
    // not hand-tuned to this design system — same reasoning as excluding it
    // from the Ticket 1 sweep. StatsBombAttribution.tsx is excluded per the
    // design-handoff-bundle's explicit scope boundary ("already systematized
    // correctly" — don't modify), so its one pre-existing text-[11px] stays.
    ignores: ["components/ui/**", "components/StatsBombAttribution.tsx"],
    plugins: { design: designValues },
    rules: { "design/no-arbitrary-design-values": "error" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Design handoff bundles are reference-only prototypes (.dc.html + a
    // prototyping runtime), never shipped — not application code to lint.
    "design_handoff_*/**",
  ]),
]);

export default eslintConfig;
