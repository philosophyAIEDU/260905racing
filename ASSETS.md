# Assets and dependencies

## Ferrari 458 Italia

- Model author: **vicent091036**.
- Original model and attribution: https://sketchfab.com/models/57bf6cc56931426e87494f554df1dab6
- Distribution source: https://github.com/mrdoob/three.js/blob/r175/examples/models/gltf/ferrari.glb
- Three.js example credit: https://threejs.org/examples/webgl_materials_car.html
- License attribution: CC BY; retain the author credit and original model link when distributing this game. The car credit is displayed in the garage.
- Pinned Git blob SHA-1: `435197c5f9b56e08c114505ee019dedbc3d033a3`.
- Adaptations: body paint and glass materials, front-axis alignment, axle/track scaling and separate wheel animation. This is an educational arcade game, not affiliated with Ferrari or the model author.

`pnpm assets` downloads the pinned model once and validates its checksum. The production build includes the model and Draco decoder locally; gameplay does not hotlink the asset. The decoder is copied from the pinned Three.js dependency; its upstream license applies.

## Original work

The circuit, terrain, trees, barriers, checkpoint gates, pit building, noise texture, environment lighting, UI control glyphs, minimap and speedometer are original procedural code. The supplied racing screenshots are references and are not shipped as game assets. No external HDR image is fetched.

The six English missions and Korean learning explanations were authored for this project. Speech uses the browser's installed speech synthesis service and voices, with no recorded or cloned human voice included.

## Dependencies

Dependencies retain their respective licenses; see installed package LICENSE files and `pnpm-lock.yaml` for exact versions. React, Three.js, React Three Fiber, Drei, Zustand, Vite and the other JavaScript packages retain their upstream MIT/Apache notices. Rapier is Apache-2.0.

The supplied product brief is preserved in `docs/product-brief.md`. Its future model availability and pricing claims are not used by this version; no AI provider is contacted.
