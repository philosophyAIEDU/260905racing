# Assets and dependencies

The car, wheels, circuit, trees, barriers, checkpoint gates and pit building are original procedural Three.js geometry authored for this repository. No downloaded model, texture, photograph, font or audio sample is shipped. No source FBX, PNG or uncompressed third-party asset is required. Rendering uses system fonts.

The visual upgrade adds original lofted coachwork, clearcoat materials, locally generated environment lighting, seeded asphalt noise, rolling terrain and layered pine trees. The supplied racing images are visual references only; neither those images nor any branded vehicle model is included. No external HDR image is fetched.

UI icons are simple original SVG control glyphs. The minimap is derived from the same mathematical circuit as the physical track.

Dependencies retain their respective licenses. See installed package LICENSE files and the lockfile for the exact dependency graph:

| Dependency                                              | License                                       |
| ------------------------------------------------------- | --------------------------------------------- |
| React, Three.js, React Three Fiber, Drei, Zustand, Leva | MIT                                           |
| React Three Rapier                                      | MIT                                           |
| Rapier                                                  | Apache-2.0                                    |
| Vite, TypeScript, Tailwind, Zod, Vitest, Playwright     | MIT / Apache-2.0, as declared by each package |

The supplied product brief is preserved in `docs/product-brief.md` as the user's specification. Its future model availability and pricing claims were not used or verified in Phase 0/1. No AI provider is contacted by this implementation.
