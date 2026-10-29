# Delivery milestones

This is a new implementation. No original Angular source was available or recovered.
The source PDF is a private requirements reference and is excluded from this project.

## Phase 0 — Functional reconstruction

An isolated `/#/foundation` route preserves the reference contract: `MachineState`, RxJS `MachineService`, a Flexbox `MachineDashboard`, `@Input` in `TelemetryDisplay`, `@Output`/`EventEmitter` in `ControlPanel`, start/stop, a CSS motor and the 80 °C visual threshold. Tests must pass before expansion.

## Product milestones

- H1: strict Angular 22, standalone routes, seeded simulation, bounded fleet state.
- H2: CSS tokens, dark/light themes, original UI primitives and responsive shell.
- H3: dashboard, KPIs, machine visual and connected controls.
- H4: reactive SVG charts, freeze view, ranges, CSV and preserved histories.
- H5: ramping, fault injection, controlled recovery, alerts and settings.
- H6: unit/component/E2E tests, accessibility checks, budgets and prolonged simulation.
- H7: English README, real screenshots, CI and opt-in GitHub Pages workflow.

The initial delivery was local only. A subsequent release request authorized a new public repository and Pages deployment, while preserving the earlier project history.

## Verification log

- Phase 0: 3 unit/component tests passed. Production build passed (212.94 kB initial raw / 61.22 kB estimated transfer). The restricted executor aborted production compilation; the same build passed with the normal approved execution context.
- H1: all 8 tests passed, including deterministic seeds, speed ramping, heat shutdown, manual recovery and 8 hours of bounded simulation.
- H2: 10 tests passed. Theme/motion persistence and corrupt-setting recovery verified. Shared tokens, buttons, indicators, inputs, dialog, tooltips, tables and responsive shell implemented without UI libraries.
- H3: 11 unit/component tests and 2 Chrome E2E tests passed. Real dashboard capture inspected. Start/stop, machine selection, motor inspection and live KPIs verified. E2E uses installed Chrome on macOS 13; managed Chromium download is unsupported on this OS.
- H4: 15 unit/component tests and 3 Chrome E2E tests passed. Chart geometry, CSV escaping/provenance, pause/resume, metric switching and history lifetime verified. SVG rendering is bounded to 300 points. Time range buttons provide a useful time zoom without a chart library.
- H5: machine management, combined alert filters, acknowledgement, fault dialogs, controlled recovery and validated simulation settings implemented. Hash routing prepares the application for static hosting without server rewrite rules.
- H5/H6 final gate: all 20 unit/component tests passed in 9 files. All 11 E2E tests passed against the optimized static production build, including the full fault/recovery flow, keyboard targets, cleared histories, mobile navigation and independent reference exercise. Axe found no violations in all 12 route/theme combinations. Visual screenshots were reviewed after the final changes.
- H7 initial local delivery: English README, reconstruction matrix, architecture decisions, verification report, real screenshots, lockfile, build budgets, quality CI and a manual-only Pages workflow prepared. Final production build passed without warnings (302.83 kB initial shell; 82.75 kB estimated transfer, excluding lazy feature chunks). Remote CI and hosting were not run. No push or publication performed.

## Public release preparation

The Angular 22 implementation is being published independently as `revyalo/industrial-control-center`. The pipeline now checks formatting and TypeScript, runs the unit and E2E suites against the production artifact under `/industrial-control-center/`, retains reports, and deploys only after successful verification. The earlier Angular 20 repository is not a source or destination for this release. Remote results are recorded in the release verification report when executed.
