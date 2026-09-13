# Houston foreground scale and airport entrance repair

The Houston bench and street lamps were authored as small source sprites but rendered at raw scene scale, making them noticeably undersized beside the avatar. They now use an explicit `0.82` avatar-relative visual factor. The shared transform expands each sprite around its existing world center and preserves its declared ground anchor. `bench-v2.png` also removes a disconnected 76-pixel artifact beneath the original bench while preserving its dimensions and baseline.

The airport chain-link run previously ended at source x=6250 while the terminal began at x=6450, leaving an unexplained 200-pixel gap. The run now terminates exactly at the terminal entrance. A grounded Houston bollard group at x=6270 makes the final approach read as a controlled arrivals entrance rather than a driveway ending in empty space. The terminal remains complete and the endpoint remains derived from its right edge at x=7518.

Verification covers the enlarged prop factors, fence-to-terminal join, exhaustive depth partition, terminal endpoint, full JavaScript suite, route checks, and the responsive Houston walkthrough. The shared renderer now accepts an exported scene array plus index so any chapter can be reviewed directly without altering the game runtime.
