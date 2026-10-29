# Verification report

Executed locally on **29 October 2026**. This is a newly authored frontend implementation; no original source was recovered.

## Initial local delivery results

| Check                                 | Result                          | Evidence / scope                                                                            |
| ------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------- |
| Reference reconstruction gate         | Passed                          | 3 initial tests + production build before feature expansion                                 |
| Final Vitest suite                    | **20 passed**, 9 files          | Services, seeded engine, transitions, alert filters, controls, motor, charts and CSV        |
| Sustained simulation                  | Passed                          | 8 simulated hours / 14,400 cycles; histories ≤300, events ≤100, finite values and legal RPM |
| Production build                      | Passed, no warnings             | Strict TypeScript/templates and all bundle budgets                                          |
| Playwright on production static files | **11 passed**                   | Chrome against `http://127.0.0.1:4300`, not the development server                          |
| Automated accessibility               | No detected violations          | axe WCAG 2 A/AA, 2.1 AA and 2.2 AA tags, all 6 routes × dark/light                          |
| Responsive interactions               | Passed                          | 1440×1100 desktop and 390×844 mobile; mobile dashboard has no page overflow                 |
| Dialog keyboard behavior              | Passed                          | Initial Cancel focus, Escape dismissal and focus restoration                                |
| Actual screenshots                    | Captured and visually inspected | `screenshots/dashboard.png`, `screenshots/mobile-settings.png`                              |
| Remote CI / GitHub Pages              | Prepared, not executed          | Local workflows only; deployment requires a manual trigger                                  |

## Browser coverage

The final 11 scenarios cover:

1. Dashboard load, live values and start/stop.
2. Real desktop screenshot generation.
3. Chart freeze/resume, metric changes and CSV download.
4. Standby-machine start, telemetry changes and stop.
5. Overheat injection, warning, alert acknowledgement, shutdown and controlled recovery.
6. Mechanical fault and reset without automatic restart.
7. History across navigation, machine filtering/selection and configuration validation.
8. Mobile navigation, light theme, persisted reduced motion and keyboard dialog behavior.
9. The independently scoped reference exercise's start/stop cadence.
10. Twelve route/theme accessibility scans.
11. Keyboard target-speed adjustment, part inspection and confirmed history clearing.

Environment: macOS 13.7.8, Node 24.21.0, Google Chrome 156.0.8078.48. The installed Google Chrome was used via `E2E_CHANNEL=chrome`. Current Playwright Chromium downloads do not support the host's macOS 13. Standard CI is configured to use Playwright Chromium on Linux; that external execution has not been claimed as complete.

## Bundle measurement

Angular's final optimized production build reports:

- Initial shell: **302.83 kB raw**, **82.75 kB estimated transfer**.
- Main JavaScript: 295.29 kB raw; global CSS: 7.54 kB raw.
- Dashboard feature: 41.57 kB raw, plus shared lazy chunks loaded on demand.
- Configured initial warning/error budget: 400/500 kB.
- Component CSS warning/error budget: 8/12 kB.

Initial-shell size excludes lazy feature chunks. Estimated transfer assumes server compression; the temporary Python static server used for testing does not provide that compression. These values are build measurements, not public-network performance scores.

## Reproduce the production browser run

```sh
npm ci
npm test
npm run build
python3 -m http.server 4300 --bind 127.0.0.1 --directory dist/industrial-control-center/browser
```

In a second terminal on this macOS host:

```sh
E2E_CHANNEL=chrome E2E_BASE_URL=http://127.0.0.1:4300 npm run test:e2e
```

On a supported machine with Playwright Chromium installed, omit `E2E_CHANNEL`. Without `E2E_BASE_URL`, Playwright starts the Angular development server automatically.

## Scope of the initial report

Manual screen-reader checks, other browser engines, representative field-device performance and remote GitHub execution remain unverified. Automated axe results are a useful gate and do not certify complete WCAG compliance. The 8-hour engine test verifies bounded structures; it is not a browser heap-leak audit. No external publication, remote repository creation or push was performed.

## Public release verification

The pre-publication audit for `revyalo/industrial-control-center` passed on 29 October 2026: reproducible `npm ci` installation (zero reported vulnerabilities), formatting/TypeScript checks, 20 unit/component tests, production Pages compilation and 11 E2E tests at `/industrial-control-center/`. No application feature code was replaced by another project. The historical local results above are not presented as a completed GitHub Actions run. Current run and deployment evidence will be recorded after the checks execute. The source is the newly authored Angular 22 implementation only; the previous repository is not reused.
