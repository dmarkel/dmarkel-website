import { FIXED_STEP, SPRITES } from "./config.js";
import { ASSETS, buildHoustonForeground } from "./houston-foreground.js?v=chapter-7";
import { createInput } from "./input.js";
import { groundTileTransforms, propTransform } from "./modular-foreground.js?v=chapter-7";
import { createCamera, stepCamera } from "./parallax.js";
import { createPlayer, selectAnimation, stepPlayer } from "./player.js";
import {
  endpointAlignedFactor,
  layerPanelTransforms,
  sceneFloor,
  sceneWorld,
} from "./scene-geometry.js?v=chapter-7";
import { applyViewport, readViewport } from "./viewport.js";

const ART = Object.freeze({ width: 1906, height: 825, groundLine: 735 });
const CHAPTER_LAYERS = Object.freeze([
  {
    name: "far",
    paths: [
      "assets/backgrounds/houston-proof/far.png",
      "assets/backgrounds/houston-chapter/far-02.png",
    ],
    factor: 0.12,
  },
  {
    name: "environment",
    paths: [
      "assets/backgrounds/houston-proof/environment.png",
      "assets/backgrounds/houston-chapter/environment-02-v2.png",
    ],
    panelOffsetYs: [80, 0],
    factor: 0.38,
  },
]);
const FOREGROUND = buildHoustonForeground();

const stage = document.querySelector(".stage");
const canvas = document.querySelector("#game");
const context = canvas.getContext("2d", { alpha: false });
const status = document.querySelector("#status");
const instructions = document.querySelector("#instructions");

const input = createInput({
  joystick: document.querySelector("#joystick"),
  joystickKnob: document.querySelector("#joystick-knob"),
  jumpButton: document.querySelector("#jump-button"),
});

const imagePaths = {
  walk: "assets/avatar/avatar-walk-right.png",
  jump: "assets/avatar/avatar-jump-right.png",
  ...Object.fromEntries(
    CHAPTER_LAYERS.flatMap(({ name, paths }) => (
      paths.map((path, index) => [`${name}-${index}`, path])
    )),
  ),
  ground: FOREGROUND.ground.path,
  ...Object.fromEntries(
    Object.entries(ASSETS).map(([id, asset]) => [`foreground-${id}`, asset.path]),
  ),
};

let viewport = { width: 0, height: 0 };
let world = { width: 0, floorY: 0, scale: 1 };
let scale = 2;
let player = null;
let previousPlayer = null;
let camera = createCamera();
let previousCamera = createCamera();
let lastTime = 0;
let accumulator = 0;
let pendingJump = false;
let instructionsDismissed = false;

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${source}`));
    image.src = source;
  });
}

function resize() {
  const oldFloor = world.floorY;
  const oldWorldWidth = world.width;
  const oldViewportWidth = viewport.width;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const nextViewport = readViewport(window);
  const { width, height } = nextViewport;
  const scene = sceneWorld(ART.width, ART.height, height, ART.groundLine);
  const progress = player && oldWorldWidth > oldViewportWidth
    ? (player.x + player.width / 2) / oldWorldWidth
    : 0.08;

  applyViewport(stage, nextViewport);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.imageSmoothingEnabled = false;

  viewport = nextViewport;
  world = {
    width: scene.width * 4,
    floorY: sceneFloor(height, ART.height, ART.groundLine, scene.scale),
    scale: scene.scale,
  };
  scale = Math.max(1.5, Math.min(2.5, Math.min(width / 430, height / 310)));

  if (!player) {
    const playerWidth = SPRITES.cellWidth * scale;
    const playerHeight = SPRITES.cellHeight * scale;
    player = createPlayer({
      x: Math.max(16, world.width * progress - playerWidth / 2),
      y: world.floorY - playerHeight,
      width: playerWidth,
      height: playerHeight,
      grounded: true,
    });
  } else {
    const wasGrounded = player.grounded || Math.abs((player.y + player.height) - oldFloor) < 2;
    player.width = SPRITES.cellWidth * scale;
    player.height = SPRITES.cellHeight * scale;
    player.x = Math.max(0, Math.min(world.width - player.width, progress * world.width - player.width / 2));
    if (wasGrounded) {
      player.y = world.floorY - player.height;
      player.vy = 0;
      player.grounded = true;
    } else {
      player.y = Math.min(player.y, world.floorY - player.height);
    }
  }

  previousPlayer = { ...player };
  camera = stepCamera(camera, player.x + player.width / 2, width, world.width, 1);
  previousCamera = { ...camera };
}

function drawScene(images, cameraX) {
  context.fillStyle = "#8ed6f0";
  context.fillRect(0, 0, viewport.width, viewport.height);
  for (const layer of CHAPTER_LAYERS) {
    const factor = layer.name === "environment"
      ? endpointAlignedFactor(
        ART.width * layer.paths.length * world.scale,
        viewport.width,
        world.width,
      )
      : layer.factor;
    const transforms = layerPanelTransforms(
      cameraX,
      viewport.width,
      world.width,
      factor,
      ART.width,
      ART.height,
      layer.paths.length,
      world.scale,
      ART.groundLine,
      world.floorY,
      layer.panelOffsetYs,
    );
    transforms.forEach((transform, index) => {
      context.drawImage(
        images[`${layer.name}-${index}`],
        transform.x,
        transform.y,
        transform.width,
        transform.height,
      );
    });
  }

  const sceneY = world.floorY - ART.groundLine * world.scale;
  const groundTransforms = groundTileTransforms(
    cameraX,
    viewport.width,
    world.width,
    world.scale,
    FOREGROUND.ground.width,
    FOREGROUND.ground.height,
    FOREGROUND.ground.topSourceY,
    sceneY,
  );
  for (const transform of groundTransforms) {
    context.drawImage(
      images.ground,
      transform.x,
      transform.y,
      transform.width,
      transform.height,
    );
  }

  for (const prop of FOREGROUND.props) {
    const asset = ASSETS[prop.assetId];
    const transform = propTransform(
      prop,
      asset.width,
      asset.height,
      cameraX,
      world.scale,
      sceneY,
    );
    if (transform.x + transform.width < 0 || transform.x > viewport.width) continue;
    const image = images[`foreground-${prop.assetId}`];
    if (transform.mirror) {
      context.save();
      context.translate(transform.x + transform.width, transform.y);
      context.scale(-1, 1);
      context.drawImage(image, 0, 0, transform.width, transform.height);
      context.restore();
    } else {
      context.drawImage(
        image,
        transform.x,
        transform.y,
        transform.width,
        transform.height,
      );
    }
  }
}

function drawPlayer(images, alpha) {
  const animation = selectAnimation(player);
  const image = images[animation.sheet];
  const cameraX = previousCamera.x + (camera.x - previousCamera.x) * alpha;
  const worldX = previousPlayer.x + (player.x - previousPlayer.x) * alpha;
  const drawX = worldX - cameraX;
  const drawY = previousPlayer.y + (player.y - previousPlayer.y) * alpha;
  const sourceX = animation.frame * SPRITES.cellWidth;
  const shadowWidth = player.width * (player.grounded ? 0.54 : 0.34);
  const heightAboveGround = Math.max(0, world.floorY - (drawY + player.height));
  const shadowAlpha = Math.max(0.05, 0.22 - heightAboveGround / 1800);

  context.fillStyle = `rgba(9, 29, 34, ${shadowAlpha})`;
  context.beginPath();
  context.ellipse(drawX + player.width / 2, world.floorY + 3, shadowWidth, 6, 0, 0, Math.PI * 2);
  context.fill();

  context.save();
  if (player.facing < 0) {
    context.translate(drawX + player.width, drawY);
    context.scale(-1, 1);
    context.drawImage(image, sourceX, 0, SPRITES.cellWidth, SPRITES.cellHeight, 0, 0, player.width, player.height);
  } else {
    context.drawImage(image, sourceX, 0, SPRITES.cellWidth, SPRITES.cellHeight, drawX, drawY, player.width, player.height);
  }
  context.restore();
}

function dismissInstructions() {
  if (instructionsDismissed) return;
  instructionsDismissed = true;
  instructions.classList.add("is-dismissed");
}

function start(images) {
  resize();
  status.hidden = true;

  function frame(time) {
    if (!lastTime) lastTime = time;
    accumulator += Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    const frameInput = input.snapshot();
    if (frameInput.jumpPressed) pendingJump = true;
    if (frameInput.move !== 0 || frameInput.jumpPressed) dismissInstructions();

    while (accumulator >= FIXED_STEP) {
      previousPlayer = { ...player };
      previousCamera = { ...camera };
      player = stepPlayer(player, {
        move: frameInput.move,
        jumpPressed: pendingJump,
      }, FIXED_STEP, world);
      camera = stepCamera(
        camera,
        player.x + player.width / 2,
        viewport.width,
        world.width,
        FIXED_STEP,
      );
      pendingJump = false;
      accumulator -= FIXED_STEP;
    }

    const alpha = accumulator / FIXED_STEP;
    const cameraX = previousCamera.x + (camera.x - previousCamera.x) * alpha;
    drawScene(images, cameraX);
    drawPlayer(images, alpha);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

let resizeFrame = null;
function scheduleResize() {
  if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = null;
    resize();
  });
}

window.addEventListener("resize", scheduleResize, { passive: true });
window.addEventListener("orientationchange", scheduleResize, { passive: true });
window.visualViewport?.addEventListener("resize", scheduleResize, { passive: true });
window.visualViewport?.addEventListener("scroll", scheduleResize, { passive: true });
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    input.reset();
    pendingJump = false;
  }
  lastTime = 0;
  accumulator = 0;
});

Promise.all(Object.entries(imagePaths).map(async ([name, path]) => [name, await loadImage(path)]))
  .then((entries) => start(Object.fromEntries(entries)))
  .catch((error) => {
    status.hidden = false;
    status.classList.add("is-error");
    status.textContent = `${error.message}. Reload the page to try again.`;
  });
