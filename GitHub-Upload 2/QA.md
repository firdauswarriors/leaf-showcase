# Leaf website verification

Completed 29 October 2026 (Malaysia time).

## Browser review

Used the supported Codex in-app browser, with measured CSS viewports1440×960,960×640,768×900,390×844 and320×720. Reviewed every content section on desktop and390px mobile: hero/tree, problem, solution, features, six-step journey, app interface, ecosystem, pilot, WayForward, team, proposal links, references and footer. Also reviewed the tablet layout and narrow320px interface. No horizontal document overflow was observed at the measured widths.

Tested interactions:
- Dragging the real3D tree changes its perspective and projected marker positions.
- Rotation buttons work without dragging.
- Picking a canopy leaf changes the selected feature; marker buttons and the independent feature list expose the same content.
- Scrolling changes the camera orbit while the tree stays separate from copy on desktop.
- App tabs work by click and keyboard ArrowRight; all four concept screens were reviewed.
- The example care-context toggle expands content.
- The staff-review demo explicitly confirms that no request is sent.
- Mobile navigation opens and closes. Escape returns focus to its trigger.
- Paused-motion mode and static simple view work; the fallback caption and controls remain usable.
- All three optimised team portraits load.
- Final production preview had no captured console errors.

## Build and assets

Production build passed. The production HTML, bundled script, stylesheet, favicon and all three WebP portraits returned HTTP200 from the production preview server. The tree is a separate lazy-loaded chunk (about146KB compressed); the initial app script is about122KB compressed. The build warns that the uncompressed Three.js chunk exceeds500KB; it is already separated from the main app. No whole ThreeUI catalogue or remote3D assets are loaded.

Both production-only and full dependency audits returned zero known advisories. See DEPENDENCY-REVIEW.md for scope.

## Final polish review

| Before | After | Why |
| --- | --- | --- |
| Pale, flat-looking canopy; cropped top | Stronger directional lighting, more leaf curvature, warmer bark and a camera that frames the whole tree | Make depth and silhouette clearer |
| Mouse-only impression of the tree | Labelled markers, feature buttons, orbit buttons and direct drag | Make interaction discoverable and usable without dragging |
| Mobile line breaks joined adjacent words | Explicit spaces around responsive breaks | Preserve readable copy and the exact tagline |
| Marker positions could use stale camera matrices | Update camera world matrix before projecting markers | Keep controls attached to their intended tree regions |
| Repeated per-marker size reads | Batch stage-size reads before marker writes | Avoid unnecessary layout work |
| Escape could move focus while the menu was already closed | Only handle Escape when the menu is open | Preserve the user's place |
| Larger PNG portrait assets | Locally converted WebP portraits, about151KB total | Reduce page weight without changing identity or framing |
| Dense one-line source | Formatted, documented editable source | Make future edits easier |

## Factual boundaries and limitations

The site retains concept labels, illustrative UI labels, proposed AI integration and pilot targets, and conditional future plans. It uses the confirmed school-owned Doc and Slides links from the saved submission record. File ownership was not changed during the website task.

Official Google AppSheet script/ExtractAI help and RHS plant-care guidance were opened for a current check. The competition Drive link could not be accessed by the web research tool; its reference comes from the existing proposal materials. Sources do not establish this team's account entitlement.

The OS reduced-motion media query and automatic WebGL/context-loss handling are implemented and source-reviewed. Paused motion and the explicit fallback were functionally tested; no OS accessibility setting was changed and a GPU failure was not artificially induced. No physical-phone performance benchmark or universal browser certification is claimed. The fallback and all essential feature descriptions remain available independently of3D.

Screenshots were captured with supported browser tools. The in-app screenshot output included unused padding; user-facing preview images are cropped to the rendered page area. Raw captures are retained with the delivered QA assets. The bundled Taste CDP inspector was not run; no inspector pass is claimed.
