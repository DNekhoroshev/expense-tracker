// `cn` ships as a compiled package with the shadcn/ui registry (drop-in for
// clsx + tailwind-merge). Re-exported here so app code has a single, layer-local
// import path while `shared/ui/*` keeps the registry's original imports intact.
export { cn } from "cn";
