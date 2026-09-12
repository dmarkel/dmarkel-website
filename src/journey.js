// Scene order is defined by CHAPTERS. Only outward input can cross a boundary.
export function adjacentChapter(index, count, player, move, world) {
  if (move > 0 && player.x >= world.width - player.width && index + 1 < count) return index + 1;
  if (move < 0 && player.x <= 0 && index > 0) return index - 1;
  return null;
}
