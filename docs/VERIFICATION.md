# Verification report

Release audit completed on **29 October 2026** for [revyalo/industrial-control-center](https://github.com/revyalo/industrial-control-center). This is the newly authored Angular 22 product, not a recovery of lost source or an import of the earlier Angular 20 application.

## Public release evidence

The first complete public execution verified application commit [`443b61f`](https://github.com/revyalo/industrial-control-center/commit/443b61f2a7a74adae78a7887accfbb54acba2ae8):

| Check                                        | Executed result                                                                                                                                     | Public evidence                                                                                                                |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Reproducible installation                    | Passed; `npm ci`, Node 24.21.0 and npm 11.19.0; zero reported vulnerabilities at execution                                                          | [Verify Angular frontend](https://github.com/revyalo/industrial-control-center/actions/runs/40861233480/job/123404693622)      |
| Quality checks                               | Formatting, strict TypeScript and preview syntax passed                                                                                             | Same verification job                                                                                                          |
| Vitest                                       | **20 tests passed in 9 files**                                                                                                                      | Same verification job                                                                                                          |
| Production Pages build                       | Passed without budget warnings; base href `/industrial-control-center/`                                                                             | Same verification job                                                                                                          |
| Playwright + axe on production files         | **11 tests passed** in Linux Chromium, including all six routes in dark/light themes                                                                | Same verification job and `browser-verification` artifact                                                                      |
| GitHub Pages deployment                      | Successful deployment of the tested artifact                                                                                                        | [Deploy GitHub Pages](https://github.com/revyalo/industrial-control-center/actions/runs/40861233480/job/123405181417)          |
| Public browser smoke test                    | Passed: loaded the deployed dashboard, stopped/started a machine and checked telemetry without page errors                                          | [Verify the public deployment](https://github.com/revyalo/industrial-control-center/actions/runs/40861233480/job/123405442931) |
| Independent check against the public website | HTTP 200, correct repository base href, and **all 11 E2E passed again** in local Chrome against the public URL                                      | Release audit; screenshots in this repository                                                                                  |
| Source control exclusions                    | 77 source/documentation files in the initial commit; no dependencies, build output, reports, PDF, environment files or detected credential patterns | Git tracked-file audit and `.gitignore`                                                                                        |

[Complete release execution](https://github.com/revyalo/industrial-control-center/actions/runs/40861233480) · [Latest workflow executions](https://github.com/revyalo/industrial-control-center/actions/workflows/ci.yml)

Browser reports, failure traces when applicable and actual screenshots are retained as workflow artifacts for 14 days. Actions logs remain the public execution evidence; artifact retention is intentionally bounded. Later documentation-only commits pass through the same pipeline and redeploy only after successful checks.

## Live application

- [Product dashboard](https://revyalo.github.io/industrial-control-center/#/dashboard).
- [Reconstructed reference exercise](https://revyalo.github.io/industrial-control-center/#/foundation).

The app is served from `/industrial-control-center/` and navigates with URL hashes. Direct feature links and refreshes require no server rewrites. The public smoke job opens the real Pages URL, rather than inferring success only from deployment metadata.

## Local checks before publication

A fresh `npm ci`, quality checks, 20 unit/component tests, the production Pages build and 11 E2E tests passed before the initial public push. Local browser execution used Google Chrome 156.0.8078.48 on macOS 13.7.8 with Node 24.21.0. Hosted CI independently repeated the suite with Chromium on Linux.

The earlier reconstruction gate had already passed 3 unit/component tests and a production build before product expansion. Subsequent milestones are recorded in [MILESTONES.md](MILESTONES.md).

## Test coverage

The 11 browser scenarios cover dashboard load/start/stop, real screenshots, chart pause/resume and metric changes, CSV download, standby-machine operation, overheating and shutdown, alert acknowledgement, controlled recovery, mechanical faults, machine switching, retained histories, invalid settings, mobile navigation, persisted preferences, keyboard dialog behavior, the independent foundation contract, keyboard target-speed adjustment, part inspection, confirmed history clearing, and twelve route/theme axe scans.

The deterministic engine test advances **8 simulated hours / 14,400 cycles** and checks legal RPM, finite readings, at most 300 samples per machine and 100 events. This establishes data-structure bounds, not browser heap-leak certification.

## Measured production bundle

- Initial shell: **302.83 kB raw**, **82.75 kB estimated transfer**.
- Main JavaScript: 295.29 kB raw; global CSS: 7.54 kB raw.
- Dashboard feature: 41.57 kB raw, plus shared lazy chunks loaded on demand.
- Initial warning/error budgets: 400/500 kB; component CSS: 8/12 kB.

Initial-shell size excludes lazy feature chunks. Angular's estimated transfer assumes server compression; these are build measurements, not public-network benchmark scores.

## Reproduce

```sh
npm ci
npm run check
npm test
npm run build:pages
npx playwright install chromium
npm run test:e2e
```

On the macOS 13 host, use installed Chrome with `E2E_CHANNEL=chrome npm run test:e2e`. To test the public deployment instead of the built local artifact:

```sh
E2E_CHANNEL=chrome E2E_BASE_URL=https://revyalo.github.io/industrial-control-center/ npm run test:e2e
```

Omit `E2E_CHANNEL` on a supported machine with Playwright Chromium installed. The default suite starts the local static preview automatically.

## Preservation of the earlier project

The earlier [revyalo/machine-dashboard](https://github.com/revyalo/machine-dashboard) repository was archived **only after** the new CI, Pages deployment, public smoke test and independent public E2E suite passed. It remains public and retains its `master` branch and commit [`be6277c`](https://github.com/revyalo/machine-dashboard/commit/be6277c9fc825043df56496703fdf623a8a7169c). The SHA was checked before and after archiving. No files or commits in that repository were changed, and no force push or repository deletion was performed.

## Remaining scope

No CI or Pages failure remains from the verified release. Firefox/Safari coverage, manual screen-reader checks, a complete manual WCAG audit and representative field-device performance measurements remain unperformed. Automated axe checks are a useful gate, not a certification of full WCAG compliance. Simulation values are illustrative and are not physical sensor telemetry.
