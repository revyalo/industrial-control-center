# Architecture and engineering decisions

```text
src/app/
  core/
    simulation/   Pure seeded engine; transitions and configuration validation
    state/        FleetStore: one RxJS source, read-only Signal projection
    services/     Preferences + isolated reference MachineService
  features/
    dashboard/    KPIs, interactive assembly and controls
    machines/     Fleet cards and operating-state filtering
    telemetry/    Stateful chart presentation and raw sample table
    alerts/       Combined filters and acknowledgement
    settings/     Validated parameters and local visual preferences
    foundation/   Independently verifiable reconstruction of the exercise
  models/         Reference and expanded domain contracts
  shared/
    ui/           Icons, status, dialog, motor, controls, SVG chart
    utils/        Geometry and escaped CSV export
```

## Reactive ownership

`FleetStore` owns one `BehaviorSubject<FleetState>`. `toSignal` creates a read-only projection for templates, and `computed` derives selection, KPIs and alert counts. No independent signal copy of the fleet is maintained. RxJS supplies one 2-second interval, cleaned up with `takeUntilDestroyed`. Immutable machine and array values make change ownership explicit. OnPush is used throughout.

A chart pause is a deliberate snapshot of a bounded history and timestamp, not a second fleet store. Selecting another machine releases that snapshot. Destroying a chart releases its local controls and snapshot; fleet histories remain in the root store. The reference exercise service is scoped to its route and has its own exact smaller contract.

## Determinism and time

The engine uses a 32-bit linear congruential PRNG with seed 42. It receives timestamps explicitly and never reads the clock, schedules work or accesses browser storage. Given identical seeds, configurations, timestamps and commands, results are identical. Fleet startup generates three minutes of clearly simulated warm-up data. Wall-clock timing is supplied by the store, and elapsed-time integration is capped at 10 seconds after long background-tab delays. This is a responsive demonstration, not a physical-time reconstruction.

RPM approaches its target at the configured rate. Thermal equilibrium follows ambient temperature and speed, with bounded seeded noise. Power is a simple illustrative quadratic speed model. An overheat fault raises temperature above warning; sustained heat triggers shutdown. Mechanical faults stop immediately. Reset removes the injected fault and cools when necessary. The engine rejects an unsafe start even if invoked outside the UI. Recovery never restarts a motor automatically.

## Bounds and performance

- 4 machines; at most 300 readings per machine (10 minutes at a 2-second cadence).
- At most 100 recent events. Repeated stable WARNING/ERROR readings do not create repeated transition alerts.
- One fleet timer; one additional route-scoped timer only while the reference exercise is running.
- SVG paths contain at most 300 points. Geometry and range filtering are computed once per input update; no chart framework or canvas loop is needed.
- The motor uses a CSS transform animation proportional to RPM. It stops at zero RPM and respects system and application motion preferences.
- Stopped machines with no cooling in progress preserve object identity and do not grow their telemetry buffers.
- Lazy standalone feature routes. Hash navigation works on static hosting without rewrite rules.
- Production budgets: initial warning/error 400/500 kB; component CSS 8/12 kB. CSS budgets reflect the measured custom motor and dashboard styles rather than the CLI's minimal starter.

The sustained-engine test advances eight hours (14,400 cycles) and checks buffer sizes, finite readings and legal RPM bounds. It establishes data-structure bounds, not a browser heap-leak certification. Automated browser checks cover interaction and rendering, not a field-performance guarantee.

## Persistence and accessibility

Only theme, reduced-motion preference, compact table density and validated parameters are persisted in versioned localStorage. Corrupt data falls back to defaults; unavailable storage produces feedback. Machine state, events and histories are session-only.

Native buttons, labelled controls and tables support keyboard interaction. The native dialog provides modal focus containment, Escape handling and focus restoration; Cancel receives initial focus. A skip link, visible focus, text status labels and live feedback support navigation. SVG charts have an accessible description and a keyboard-operated sample inspector. Automatic axe checks target WCAG 2.2 AA-related rules in both themes, complemented by interaction tests. These checks are not a complete manual accessibility audit.
