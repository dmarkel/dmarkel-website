# Houston Single-Source Foreground Correction

## Goal

Remove the repeated near-ground Lamar band and the airport terminal's hard vertical seam without changing the avatar, movement, approved environment art, or mobile controls.

## Root causes

The Lamar school environment already contains its own iron fence and landscaping. A second modular iron fence is currently drawn at full foreground speed. The baked fence and modular fence separate during scrolling because they use different parallax factors, exposing a repeated near-ground band.

The airport environment already contains the terminal and control tower through the right edge. A separate 1068-pixel terminal foreground prop ends at world x=7518, before the 7624-pixel world endpoint. Its opaque right edge becomes visible as a vertical cut.

## Design

- Treat the Lamar fence baked into `houston-proof/environment.png` as the only Lamar fence source.
- Remove the modular `lamar` iron fence run; retain the modular airport chain-link fence.
- Treat `houston-chapter/environment-02-v2.png` as the only airport terminal architecture source.
- Remove the standalone modular terminal prop and stop preloading its unused asset.
- Keep the modular sidewalk, middle verge, street furniture, airport chain fence, avatar sprites, player ground line, input, and physics unchanged.
- Increment the module cache version to `chapter-7` so mobile browsers cannot retain the faulty manifest.

## Verification

- Unit tests must prove that no iron Lamar fence run and no terminal prop remain in the built foreground.
- Route tests must prove `chapter-7` is wired through HTML and changed module imports.
- The full-route atlas must show no duplicate low fence at Lamar and no vertical terminal cut at the airport endpoint.
- Live browser checks must cover 390x844, 844x390, and rotation back to 390x844 with no overflow or console errors.

