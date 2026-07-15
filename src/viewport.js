export function readViewport(windowLike) {
  const viewport = windowLike.visualViewport;
  return {
    width: viewport?.width ?? windowLike.innerWidth,
    height: viewport?.height ?? windowLike.innerHeight,
    offsetLeft: viewport?.offsetLeft ?? 0,
    offsetTop: viewport?.offsetTop ?? 0
  };
}

export function applyViewport(stage, metrics) {
  stage.style.width = `${metrics.width}px`;
  stage.style.height = `${metrics.height}px`;
  stage.style.transform = `translate3d(${metrics.offsetLeft}px, ${metrics.offsetTop}px, 0)`;
}
