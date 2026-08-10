// footballd3 ships .d.ts for most components, but these 9 are JS-only.
// Without these declarations `strict` fails the build on implicit any,
// since TS won't infer types from untyped JS inside node_modules.
// Remove each line as the upstream package gains real declarations.
declare module "footballd3/convexHull";
declare module "footballd3/formation";
declare module "footballd3/scrubber";
declare module "footballd3/cumulativeXtChart";
declare module "footballd3/passSonar";
declare module "footballd3/actionFeed";
declare module "footballd3/goalMouthShotPanel";
declare module "footballd3/playerStatCards";
declare module "footballd3/highlightReel";
