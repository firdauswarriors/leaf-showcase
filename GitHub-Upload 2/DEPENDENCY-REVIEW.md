# Dependency review

Registry metadata was inspected before installation. Direct packages are pinned in package.json, and transitive resolutions are recorded in pnpm-lock.yaml. Installation used the existing bundled pnpm via the Sites dependency helper, with lifecycle scripts disabled in .npmrc.

- React and React DOM 19.3.1: MIT, official packages.
- Three.js 0.186.1: MIT, no runtime dependencies; selected for original geometry and WebGL rendering.
- GSAP 3.15.0 and @gsap/react 2.1.2: official animation packages; GSAP standard no-charge licence.
- Vite 8.3.5: MIT build tool. Node version requirements met by the bundled Node24 runtime.
- Fontsource DM Sans and Instrument Serif 5.3.0: SIL OFL1.1; fonts bundled locally.

pnpm audit of production dependencies and the full lockfile returned zero known advisories on 29 October 2026 MYT. This is a registry advisory check, not a guarantee that every dependency is vulnerability-free. No additional plugins or unknown repositories were installed.

ThreeUI Community source was read locally at commit68802d5428071ada5c20db8094b1649e6bb770ed. Its Generative Tree is2D, so the original3D centrepiece does not use that component. Only the fallback adapts its branching approach under MIT, with attribution. The full catalogue and old aliased Three.js dependencies were not installed. Third-party analytics and remote resource loading were excluded.

Prettier3.9.10 (official npm package, MIT, no runtime dependencies or lifecycle hooks in the published metadata) was reviewed and used as a one-off source formatter. It is not a website runtime dependency.
