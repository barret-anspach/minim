#### v0.0.8

2026 Mar 19

- `Minim` and `MNX` namespaces are now exported from `/types/index.d.ts`.

#### v0.0.7

2026 Mar 10

- Fixed `View`: `useEffect` cleanup, which resets MeasuresContext.
- Fixed `Score`: ResizeObserver ... though may want to revert to a previous fix (on branch `chore/rem-to-em`).
- Removed unnecessary dependencies (clsx); moved prettier to devDependencies.

#### v0.0.6

2025 Dec 21

- Added `data-*` attributes to various components, to better facilitate third-party component styling.

#### v0.0.5

2025 Dec 19

- Fixed overlooked use of `rem` utils/getPitches > `getPitches()`
- Fixed a handful of uses of `rem` in various components' CSS style modules

#### v0.0.4

2025 Dec 19

- Fixed utils/getPitches > `overlapStaffRows()`, where half-space distance was still defined in `rem`, not `em`
- Fixed and utils/methods > `getColumnArray()`, where note column width was defined in `rem`, not `em`

#### v0.0.3

2025 Dec 19
Converted `rem` to `em`, so `Minim` font-size can be set to a distinct value from page's font-size.

#### v0.0.2

2025 Dec 19
Removed `type: commonjs` from `package.json`.

#### v0.0.1

2025 Dec 19
Initial publish!
