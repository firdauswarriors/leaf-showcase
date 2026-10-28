# Leaf showcase website

An editable React/Vite website with an original interactive Three.js tree and GSAP scroll choreography. Created for Team Error 404, Politeknik Besut Terengganu.

**Leaf is a proposed concept.** The interface demonstrations are illustrative; they do not analyse photographs or send review requests. The pilot and roadmap are proposed. No backend, API keys, tracking or external media services are required.

## Preview and edit

Requires Node.js 22.12+ (or 24+) and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL shown in the terminal. To create a production build:

```sh
pnpm build
pnpm preview
```

A ready-built static copy is included in `dist/` in the delivered ZIP. Serve it with any local static web server. Opening `index.html` directly as a file will not load module assets correctly.

## What to edit

- `src/main.jsx`: section copy, team, roadmap and interactive screen concepts.
- `src/data.js`: feature descriptions, references and the confirmed PolyCC Google Doc / Slides links.
- `src/style.css`: colours, typography, spacing and desktop/mobile layouts.
- `src/TreeScene.jsx`: original procedural 3D tree, leaves, light, camera, selection and orbit.
- `src/FallbackTree.jsx`: static botanical fallback adapted from reviewed ThreeUI code.
- `public/images/`: the three supplied team portraits, optimised as WebP.
- `public/credits.txt`: credits and ThreeUI MIT licence.
- `.openai/hosting.json`: the existing Sites identity. Preserve it when updating this same Site.

## Interaction and accessibility

Scroll the opening story to orbit the tree on desktop. On phones, the tree is a self-contained stage with a shorter scroll-linked camera movement so the story stays readable. Drag horizontally or use the labelled rotation buttons to inspect the tree. Select a canopy marker, individual leaf or feature-list button to explore a proposed feature. The list works independently of the 3D view.

Use the interface tabs by pointer or keyboard (Left/Right, Home/End). The example context and review buttons are clearly marked demonstrations. Navigation includes a skip link, visible focus, a phone menu and Escape to close it.

The site respects `prefers-reduced-motion`. Pause motion stops sway and scroll orbit; explicit rotation remains available as an immediate action. Use simple view switches to a lightweight static botanical drawing. A WebGL creation/context failure automatically switches to that view. For direct QA, `?simple` opens the simple view and `?motion=off` opens with motion paused.

## Scope and sources

The project uses the confirmed team names, supervisor and exact tagline: “A greener Earth starts with a leaf.” Content is based on the existing proposal. The submission links lead to the native PolyCC-owned Google files. Source links in the References section document the plant-care context and AppSheet plan constraints; institutional entitlement remains unconfirmed.

No external ThreeUI dependency was installed. The reviewed Generative Tree branch technique is adapted only for the static fallback; its analytics, iframe, message handlers and touch-blocking code were excluded. The centrepiece is real original 3D geometry.

See `DEPENDENCY-REVIEW.md`, `DESIGN.md` and `QA.md` for review details. No secrets are included in the project.
