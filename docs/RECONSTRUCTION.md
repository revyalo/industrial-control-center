# Functional reconstruction and product expansion

## Starting point

The workspace contained no application source. The private two-page exercise PDF was read and visually checked before implementation. The reconstruction scope explicitly excluded reusing an earlier application. No previous implementation was searched for or reused.

All application source, styles, tests and documentation in this folder are newly authored. The exercise is a functional reference, not a source-code recovery. The private PDF, its rendered pages and company resources are not included in this project.

## Reference exercise: `/#/foundation`

| Reference requirement                                           | New implementation                             | Verification                    |
| --------------------------------------------------------------- | ---------------------------------------------- | ------------------------------- |
| `MachineState`: temperature, RPM, RUNNING/STOPPED/ERROR         | `models/machine-state.ts`                      | Strict TypeScript               |
| RxJS state stream and 2-second updates while running            | `core/services/machine.service.ts`             | Virtual-timer cadence test, E2E |
| `startMachine()` / `stopMachine()`                              | Route-scoped `MachineService`                  | Unit + component + E2E          |
| Parent provides state to children with Flexbox layout           | `features/foundation/machine-dashboard.ts`     | Component test + CSS inspection |
| `TelemetryDisplay` receives `@Input()`                          | `features/foundation/telemetry-display.ts`     | Component test                  |
| Pure HTML/CSS motor, green running LED, red for ERROR or >80 °C | `TelemetryDisplay`                             | Thermal/error component test    |
| `ControlPanel` uses `@Output()` and `EventEmitter`              | `features/foundation/control-panel.ts`         | Parent-child interaction test   |
| No CSS framework or component library                           | All styles and UI components are project-owned | Dependency inspection           |

This route has an intentionally independent, route-scoped simulation so its exact contract can be demonstrated without the expanded fleet domain. Leaving the route destroys its timer and subscription.

## New Industrial Control Center capabilities

The multi-machine simulator, WARNING state, speed ramping, power calculation, seeded demo history, alerts, acknowledgement, controlled cooling, interactive motor assembly, dashboards, SVG charts, CSV export, settings, themes, responsive shell and automated quality tooling are new product features. They are not claimed as requirements or recovered behavior from the original exercise.

The product's root-scoped `FleetStore` keeps histories alive across navigation. Its separate domain includes states and behaviors beyond the smaller reference contract. Shared interface styling is reused; simulation state is not mirrored between the two domains.
