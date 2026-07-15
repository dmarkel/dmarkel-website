# Houston Parallax Concept Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate and present one wide, reviewable pixel-art concept panorama for the continuous Lamar High School → downtown Houston → IAH journey.

**Architecture:** Use the approved avatar image as the sole style and scale reference, while using current visual references only to identify the three Houston landmark zones. Generate one flattened concept image with seven visibly separable depth planes. Save the accepted preview as a versioned project asset; do not modify the live game background.

**Tech Stack:** Built-in image generation, existing PNG avatar reference, local image inspection, Git.

## Global Constraints

- Bright daytime throughout.
- One continuous stylized Houston scene with no hard chapter cuts.
- Match the approved avatar's high-detail cartoon pixel style and pixel density.
- Show Lamar on the left, downtown Houston in the center, and IAH on the right.
- Maintain one uninterrupted walkable pavement band.
- Make all seven intended parallax depth planes visually legible.
- Do not modify `index.html`, `styles.css`, or any file under `src/` during concept generation.
- Save the accepted concept as `assets/backgrounds/houston-journey-concept-v1.png`.

---

### Task 1: Generate and Validate the Panorama

**Files:**
- Reference: `assets/avatar/avatar-master-v1.png`
- Create: `assets/backgrounds/houston-journey-concept-v1.png`

**Interfaces:**
- Consumes: the approved avatar PNG as a style and scale reference plus the approved visual specification.
- Produces: one flattened PNG concept suitable for user review, not yet consumed by the game runtime.

- [ ] **Step 1: Review landmark references**

Inspect current visual references for Lamar High School's exterior character, the Houston skyline silhouette, and IAH terminal/runway infrastructure. Use them only for landmark recognition; do not reproduce a source photograph's composition.

- [ ] **Step 2: Generate the first concept**

Use the built-in image-generation tool with `assets/avatar/avatar-master-v1.png` as the reference image and this exact prompt:

```text
Use case: stylized-concept
Asset type: wide concept panorama for a 2D side-scrolling autobiographical pixel game
Primary request: Create one continuous bright-daytime Houston journey from Lamar High School on the far left, through downtown Houston in the center, to George Bush Intercontinental Airport (IAH) on the far right.
Input image: the provided avatar is the only style and pixel-density reference. Match its high-detail cartoon pixel art, deliberate square pixels, compact color ramps, selective dark outlines, readable silhouettes, and friendly proportions. Include the same avatar once at ground level only as a small scale reference; do not redesign his face, hair, navy short-sleeve polo, light blue-gray pants, or black sneakers.
Scene/backdrop: left zone has recognizable red-brick Lamar High School architecture, broad windows, mature green trees, fencing, landscaped grounds, and a school-zone street. Blend naturally into Upper Kirby neighborhood forms. Center zone builds into a distinctly Houston skyline with layered skyscrapers, freeway structures, urban trees, humid blue atmospheric haze, and street infrastructure. Right zone transitions through airport approach roads, runway fencing, approach lights, aircraft silhouettes, service equipment, a control-tower form, and a modern IAH terminal arrival.
Composition/framing: extremely wide horizontal side-scroller panorama, left-to-right visual journey, no hard cuts. Keep one uninterrupted walkable pavement band across the bottom 18 percent. Keep important landmarks above the player path. Demonstrate seven separable depth planes: sky; clouds/haze; far landmarks; primary architecture; near environment; foreground accents; walkable ground. Use large foreground trees, poles, signs, barriers, and airport equipment sparingly to make parallax depth obvious.
Lighting/mood: clear bright Houston daytime, warm sunlit masonry and concrete, saturated controlled greenery, pale-blue humid sky, optimistic autobiographical tone.
Constraints: crisp pixel edges, consistent pixel scale, rich environmental detail without overpowering the avatar, seamless transitions, no readable signage text, no logos, no watermark.
Avoid: photorealism, painterly blur, gradients that look airbrushed, smooth vector shapes, cyberpunk colors, night lighting, generic fantasy skyline, separate panels, borders, chapter labels, floating platforms, repeated avatar figures.
```

- [ ] **Step 3: Inspect against the approval criteria**

Confirm all of the following by viewing the generated image at original detail:

- Lamar, downtown, and IAH read left-to-right without a hard seam.
- The pixel scale and cartoon detail belong with the avatar reference.
- The avatar appears once and remains visually dominant over nearby details.
- The pavement route is continuous.
- Seven depth planes can be identified from foreground to sky.
- No illegible generated text, logos, watermarks, night lighting, or photorealistic regions appear.

If exactly one criterion fails, make one targeted edit that names only that defect and preserves everything else. If several criteria fail, regenerate once with the same prompt and stronger emphasis on the failed constraints.

- [ ] **Step 4: Save and commit the accepted preview**

Copy the accepted generated image to `assets/backgrounds/houston-journey-concept-v1.png`, then run:

```bash
sips -g pixelWidth -g pixelHeight -g format assets/backgrounds/houston-journey-concept-v1.png
git diff --check
git add assets/backgrounds/houston-journey-concept-v1.png
git commit -m "art: add Houston parallax concept"
```

Expected: a PNG panorama exists at the project path, Git reports no whitespace errors, and the live game files remain unchanged.

- [ ] **Step 5: Present for review**

Render `assets/backgrounds/houston-journey-concept-v1.png` inline. Do not begin layer extraction or game integration until the user explicitly approves the visual.
