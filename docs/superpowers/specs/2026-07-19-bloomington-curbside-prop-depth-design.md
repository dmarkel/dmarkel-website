# Bloomington Curbside Prop Depth Design

## Goal

Move the Bloomington sidewalk furniture closer to the street so the avatar can walk behind it. Preserve the approved sidewalk, avatar floor, scene art, physics, camera, and foreground asset artwork.

## Chosen Approach

Add one explicit `curb` ground plane at source y=765. Assign the bench, campus lamp, planter, newspaper box, parking meter, and bike rack to this shared plane. The avatar remains on its existing source-space floor at y=735.

The runtime continues to draw curbside props after the avatar. The 30-pixel baseline separation makes the objects read as nearer to the viewer and nearer to the street, while their later paint order lets their opaque pixels naturally occlude the avatar as he walks behind them.

## Alternatives Considered

### Move each prop independently

Rejected because individual offsets would create inconsistent curb alignment and repeat the grounding problems encountered in the Houston scene.

### Move the existing `walk` plane

Rejected because it would blur the distinction between the avatar's walking lane and the nearer curbside furniture row. A named curb plane makes the depth contract explicit and reusable.

### Move or redraw the sidewalk

Rejected because the sidewalk geometry is approved and the requested change concerns only prop depth.

## Geometry and Rendering Contract

- Avatar floor: source y=735, unchanged.
- Curbside prop baseline: source y=765.
- Background-grade plane: source y=665, unchanged.
- All six curbside props share the same baseline.
- Curbside props remain non-collidable decoration.
- Curbside props render after the avatar; background-grade props render before it.
- Prop source images, x positions, sizes, and base anchors remain unchanged.

The manifest builder must reject an unknown plane rather than producing an invalid transform. Front-prop partitioning must select the `curb` plane explicitly so future manifest changes cannot silently alter paint order.

## Verification

Automated tests must prove:

- the curb plane is exactly y=765;
- every near-sidewalk prop uses the curb plane;
- the foreground partition is exhaustive;
- curb props appear in the front partition and background props remain in the back partition;
- prop transforms use the declared plane baseline;
- the avatar floor remains y=735;
- existing movement, jump, viewport, asset-integrity, and Bloomington scene tests continue passing.

Browser review must inspect portrait and landscape views around Kelley, Sample Gates, Kirkwood, and the endpoint. The avatar must pass behind the visible pixels of the curbside props, props must touch the sidewalk rather than float, and no prop may extend unnaturally into the road or mobile browser controls.

## Reusable Scene-Pack Protocol Addition

Future scenes should use named depth rows for ground-connected foreground objects. Keep the avatar lane and curbside furniture lane separate, align each group to one shared source-space baseline, and determine paint order from the declared plane rather than per-object exceptions.
