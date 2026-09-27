export interface CuratedAdvisory {
  id: string;
  cve: string;
  label: string;
  text: string;
}

export const CURATED_ADVISORIES: CuratedAdvisory[] = [
  {
    "id": "GHSA-f82v-jwr5-mffw",
    "cve": "CVE-2025-29927",
    "label": "CVE-2025-29927 — Authorization Bypass in Next.js Middleware",
    "text": "GHSA-f82v-jwr5-mffw / CVE-2025-29927\nAuthorization Bypass in Next.js Middleware\n\nAffected versions:\n- next >= 13.0.0, < 13.5.9 (patched in 13.5.9)\n- next >= 14.0.0, < 14.2.25 (patched in 14.2.25)\n- next >= 15.0.0, < 15.2.3 (patched in 15.2.3)\n- next >= 12.0.0, < 12.3.5 (patched in 12.3.5)\n\n# Impact\nIt is possible to bypass authorization checks within a Next.js application, if the authorization check occurs in middleware.\n\n# Patches\n* For Next.js 15.x, this issue is fixed in `15.2.3`\n* For Next.js 14.x, this issue is fixed in `14.2.25`\n* For Next.js 13.x, this issue is fixed in 13.5.9\n* For Next.js 12.x, this issue is fixed in 12.3.5\n* For Next.js 11.x, consult the below workaround.\n\n_Note: Next.js deployments hosted on Vercel are automatically protected against this vulnerability._\n\n# Workaround\nIf patching to a safe version is infeasible, we recommend that you prevent external user requests which contain the `x-middleware-subrequest` header from reaching your Next.js application.\n\n## Credits\n\n- Allam Rachid (zhero;)\n- Allam Yasser (inzo_)\n\nSource: https://github.com/advisories/GHSA-f82v-jwr5-mffw (GitHub Advisory Database, CC-BY-4.0)"
  },
  {
    "id": "GHSA-6gpp-xcg3-4w24",
    "cve": "CVE-2026-64642",
    "label": "CVE-2026-64642 — Next.js: Middleware / Proxy bypass in App Router applications using Turbopack and single locale",
    "text": "GHSA-6gpp-xcg3-4w24 / CVE-2026-64642\nNext.js: Middleware / Proxy bypass in App Router applications using Turbopack and single locale\n\nAffected versions:\n- next >= 16.0.0, < 16.2.11 (patched in 16.2.11)\n\n## Impact\n\nCrafted requests targeting Next.js applications using App Router built with Turbopack and a **single** entry in `config.i18n.locales` can bypass middleware/proxy based authentication.\n\n## Workarounds\n\nIf you cannot upgrade immediately, enforce authorization in the page's server-side data path instead of relying solely on middleware.\n\nSource: https://github.com/advisories/GHSA-6gpp-xcg3-4w24 (GitHub Advisory Database, CC-BY-4.0)"
  }
];
