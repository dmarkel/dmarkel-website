# Houston Middle Panel Rebuild Design

## Goal

Rebuild the middle Houston foreground so the downtown-to-airport transition feels visually complete, grounded, and intentional. The repair must eliminate the floating sign, restore useful foreground density, preserve plant colors during background extraction, and place the avatar's feet naturally on the sidewalk.

## Visual Direction

The rebuilt middle panel will depict a ground-level Houston streetscape rather than an elevated freeway. It will use the existing high-detail cartoon pixel-art style and daylight palette.

The panel will include:

- a continuous tan sidewalk and curb across the full width;
- low black fencing and planted beds;
- grounded utility cabinets and street furniture;
- a bench or bike rack and restrained service-road details;
- a gradual visual transition from downtown streetscape toward the airport perimeter.

The panel will not include:

- an elevated highway, ramp, pillars, or guardrails;
- an overhead or floating road sign;
- bushes placed on top of structures;
- balloons, airplanes, people, text, or large seam-crossing objects;
- large empty regions that leave isolated props floating against the background.

## Composition and Seam Safety

The outer 96 source pixels on both sides are reserved seam-safe zones. Only low, repeatable elements such as sidewalk, curb, short fence, and low planting may enter those zones. Buildings, poles, signs, trees, shelters, and other tall focal objects must remain completely inside the panel.

The central foreground should remain visually populated without becoming crowded. Every prop must have a visible physical connection to the sidewalk, curb, planter, or ground plane.

## Transparency Extraction

The current global magenta-distance matte is unsuitable because it removes legitimate magenta and purple pixels from flowers, foliage, and shaded details.

The replacement extraction will identify background pixels by connectivity to the image border. Key-colored pixels connected to the outer background become transparent; similarly colored pixels enclosed within foreground objects remain opaque. Edge pixels may receive a narrow soft matte, but fully interior subject pixels must not be partially transparent.

The final foreground must have:

- transparent outer background;
- fully opaque sidewalk and curb from source line 665 downward;
- opaque interior plant and flower colors;
- no key-color halo around extracted objects;
- no large partial-alpha regions on foreground props.

## Avatar Grounding

The avatar currently lands on source line 665, the sidewalk's upper edge. The walking line will move to source line 735, placing the avatar 70 source pixels deeper into the sidewalk plane. Jump physics and animation remain unchanged; only the visual floor alignment changes.

## Validation

Automated checks will cover:

- exact 1906 × 825 panel dimensions;
- continuous opaque ground across every column;
- absence of a large overhead sign mass;
- sufficient grounded foreground coverage in the middle band;
- low partial-alpha damage within plant and flower regions;
- seam-safe outer edge zones;
- the approved source walking line of 735.

Visual verification will render the full layered scene at 390 × 844 portrait and 844 × 390 landscape sizes, including the panel joins and middle-panel center. The avatar's shoes must visibly contact the sidewalk, and rotation must not crop the stage.

## Scope

Only the Houston review route and its versioned middle foreground asset will change. The homepage, avatar animation sheets, movement physics, other foreground panels, and background/environment layers remain unchanged.
