# Security policy

## Reporting a vulnerability

Please report security issues privately through [GitHub security advisories](https://github.com/CryptoZephyr/Pich/security/advisories/new). Do not open a public issue.

## What Pich does and does not do

- Pich never installs, builds, or runs code from a repository you give it. For a public GitHub repo it downloads a fixed list of files (package.json, package-lock.json, next.config.*, middleware/proxy, pich.deploy.json) and the file list, and reads them as text.
- The runtime proof in `proof/run-proof.mjs` builds and runs only two bundled fixtures (`fixtures/client-a`, `fixtures/client-b`) on the operator's machine. The hosted app does not run it.
- Advisory text is sent to SERV Reasoning to compile a checklist. Do not paste confidential material.
- A verdict of "Absent within inspected scope" means a required advisory condition was not found in the inspected files. It is not a statement that an app is safe.

## Secrets

`SERV_API_KEY` is read from the server environment only. It is never sent to the browser or committed. See `.env.example`.
