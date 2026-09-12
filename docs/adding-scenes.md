# Adding a journey scene

The homepage, Houston page, and Bloomington page use the same runtime in `src/journey-game.js`. The entries in `CHAPTERS` in `src/chapters.js` define their travel order.

To add the next destination:

1. Add the scene images and its foreground manifest, following `src/bloomington-foreground.js`.
2. Import that manifest into `src/chapters.js` and append a chapter to `CHAPTERS` with a unique `id`, `label`, `description`, `art`, `layers`, `assets`, and `foreground`.
3. Set `avatarScaledProps` to `true` for props sized relative to the avatar, or `false` for props drawn at the scene artwork scale.

The art metadata provides `width`, `height`, and `groundLine`. Each layer provides `name`, `paths`, and `factor`, with optional `panelOffsetYs`. The foreground provides `ground`, `backProps`, `frontProps`, and `endSourceX`. That endpoint sets the walking boundary.

Walking right at a chapter's end enters the next chapter at its left edge. Walking left at its start returns to the previous chapter at its right edge. The first and last edges remain bounded. Both directions use the same fade and destination title. Held movement continues after the fade, and the camera starts at the correct arrival edge.

No new boundary or transition code is needed when appending a chapter. All chapter images currently preload before the journey begins, so each transition can run without a loading pause. For a substantially larger journey, consider changing this to preload neighboring chapters.

Run `npm test` and `python -m unittest discover -s tests -p 'test_*route_config.py'` after making changes. The boundary tests cover a five-chapter journey as well as the current two chapters.
