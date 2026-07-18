# Lamar Environment Vertical Offset Design

## Goal

Close the visible vertical gap beneath the Lamar school environment on both mobile and desktop without moving the avatar, foreground, sky, downtown, or airport artwork.

## Approved approach

Apply a positive 80-source-pixel vertical offset only to the first environment panel, `assets/backgrounds/houston-proof/environment.png`. Multiply the source offset by the scene scale when drawing so the adjustment remains proportional across viewport sizes. The current mobile scale turns the adjustment into approximately 100 visible CSS pixels, while desktop receives the corresponding scaled placement.

The second environment panel, far layer, modular foreground, sidewalk, player ground line, avatar sprites, physics, input, and controls remain unchanged.

## Implementation boundary

- Add explicit per-panel vertical-offset metadata to the environment layer.
- Apply each panel's offset after the shared panel transform is calculated.
- Default missing offsets to zero so existing layers retain their current placement.
- Increment the Houston module cache version so mobile and desktop browsers load the new positioning code.

## Risks and verification

The main risk is a visible vertical step where the Lamar environment meets the second environment panel. Automated tests must prove that only panel zero receives an 80-pixel source offset. Visual verification must inspect Lamar, the environment transition, downtown, and the airport endpoint in portrait and landscape. Browser checks must confirm exact viewport coverage, rotation recovery, and no console errors.

