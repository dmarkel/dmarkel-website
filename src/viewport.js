export function readViewport(windowLike) {
  const viewport = windowLike.visualViewport;
  const layoutWidth = windowLike.document?.documentElement?.clientWidth ?? windowLike.innerWidth;
  const viewportWidth = viewport?.width ?? layoutWidth;
  const isZoomed = (viewport?.scale ?? 1) > 1.01;
  return {
    width: isZoomed ? viewportWidth : Math.max(viewportWidth, layoutWidth),
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
