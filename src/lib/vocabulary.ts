export const PREDICATE_IDS = [
  "app_router",
  "pages_router",
  "middleware_present",
  "middleware_enforces_auth",
  "deployment_on_vercel",
  "turbopack_build",
  "i18n_configured",
  "i18n_single_locale",
] as const;

export type PredicateId = (typeof PREDICATE_IDS)[number];

export const PREDICATE_DESCRIPTIONS: Record<PredicateId, string> = {
  app_router: "The app uses the Next.js App Router (an app/ or src/app/ directory).",
  pages_router: "The app uses the Next.js Pages Router (a pages/ or src/pages/ directory).",
  middleware_present: "The app has a middleware.(ts|js) or proxy.(ts|js) file at the root or in src/.",
  middleware_enforces_auth:
    "The middleware/proxy file performs an authentication or authorization check (session/token/cookie check followed by redirect or 401/403).",
  deployment_on_vercel: "The app is deployed on Vercel (read from the declared deployment target).",
  turbopack_build: "The production build (`next build`) uses Turbopack.",
  i18n_configured: "next.config declares an i18n block.",
  i18n_single_locale: "next.config i18n.locales contains exactly one entry.",
};
