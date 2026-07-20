# Bloomington Sample Gates Car and Planter Correction

## Goal

Correct two isolated Bloomington scene defects without changing the approved route composition: remove the split maroon car at the Sample Gates and lower the campus planter so the avatar reads as walking behind it rather than underneath it.

## Diagnosis

The car is baked into `environment-02-v3.png`. The shared ground strip is painted over the environment layer, so it intersects the car and exposes the vehicle as disconnected pieces. The planter is already painted after the avatar, but its enlarged visual sprite is anchored too near the avatar's walking line.

## Considered approaches

1. **Surgical environment patch plus a planter-only anchor offset (selected).** Preserve the approved panel pixel-for-pixel outside a bounded car-removal area, replace the car with matching campus landscaping, and lower only the planter's base anchor.
2. **Regenerate the full environment panel.** This removes the car but risks changing the Gates, storefronts, transparency, typography, and endpoint alignment.
3. **Cover the car with another foreground object.** This hides the symptom but introduces a new large element and can create parallax or depth inconsistencies.

## Design

- Build a new versioned environment panel from the approved `environment-02-v3.png`.
- Restrict the raster edit to the car's bounded region near the Sample Gates; retain exact dimensions, binary alpha, panel offsets, and all artwork outside that region.
- Replace the car with low campus landscaping that joins the existing shrubs and does not cross a panel seam.
- Add a planter-specific source-space ground offset. Keep the planter at its approved x coordinate, scale, and front draw plane; only its vertical base anchor changes.
- Increment Bloomington cache keys so mobile browsers fetch the corrected image and route code.

## Verification

- An asset regression test detects maroon car pixels inside the known Sample Gates car box.
- Geometry tests require the planter to be lower than other curb props while all other prop anchors remain unchanged.
- Existing transparency, geometry, endpoint, depth-order, and route-isolation tests remain green.
- Portrait and landscape browser checks cover the Sample Gates, planter occlusion, jumping, and the far-right endpoint.

## Final Flower-Box Removal Approval

After reviewing the completed Bloomington chapter, the owner approved the scene
with one final change: remove the freestanding Kelley flower-box prop entirely.
This refers only to the manifest entry `campus-planter` at source x=1450. The
generated campus landscaping, the stadium graduation planters, the sidewalk,
avatar, physics, depth order, and every other curb prop remain unchanged.

The `planter.png` source asset may remain in the reusable scene pack, but the
Bloomington foreground manifest must not instantiate it. A regression test must
assert that `campus-planter` is absent, and the public route must use a new module
cache revision so mobile browsers cannot reuse the prior manifest.
