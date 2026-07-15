import { FIXED_STEP, SPRITES } from "./config.js";
import { createInput } from "./input.js";
import { createPlayer, selectAnimation, stepPlayer } from "./player.js";
import { applyViewport, readViewport } from "./viewport.js";

const stage = document.querySelector(".stage");
const canvas = document.querySelector("#game");
const context = canvas.getContext("2d", { alpha: false });
const status = document.querySelector("#status");
const instructions = document.querySelector("#instructions");

const input = createInput({
  joystick: document.querySelector("#joystick"),
  joystickKnob: document.querySelector("#joystick-knob"),
  jumpButton: document.querySelector("#jump-button")
});

const imagePaths = {
  walk: "assets/avatar/avatar-walk-right.png",
  jump: "assets/avatar/avatar-jump-right.png"
};

let world = { width: 0, height: 0, floorY: 0 };
let scale = 2;
let player = null;
let previousPlayer = null;
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
  const oldWidth = world.width;
  const oldFloor = world.floorY;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const viewport = readViewport(window);
  const { width, height } = viewport;
  applyViewport(stage, viewport);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.imageSmoothingEnabled = false;

  world = {
    width,
    height,
    floorY: height - Math.max(64, height * 0.09)
  };
  scale = Math.max(1.5, Math.min(2.5, Math.min(width / 430, height / 310)));

  if (!player) {
    const playerWidth = SPRITES.cellWidth * scale;
    const playerHeight = SPRITES.cellHeight * scale;
    player = createPlayer({
      x: Math.max(16, width * 0.18 - playerWidth / 2),
      y: world.floorY - playerHeight,
      width: playerWidth,
      height: playerHeight,
      grounded: true
    });
  } else {
    const centerRatio = oldWidth > 0 ? (player.x + player.width / 2) / oldWidth : 0.18;
    const wasGrounded = player.grounded || Math.abs((player.y + player.height) - oldFloor) < 2;
    player.width = SPRITES.cellWidth * scale;
    player.height = SPRITES.cellHeight * scale;
    player.x = Math.max(0, Math.min(width - player.width, centerRatio * width - player.width / 2));
    if (wasGrounded) {
      player.y = world.floorY - player.height;
      player.vy = 0;
      player.grounded = true;
    } else {
      player.y = Math.min(player.y, world.floorY - player.height);
    }
  }
  previousPlayer = { ...player };
}

function drawStage() {
  const { width, height, floorY } = world;
  const sky = context.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#14363d");
  sky.addColorStop(0.58, "#2d5a61");
  sky.addColorStop(1, "#8ca9a0");
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(244, 234, 215, 0.055)";
  for (let x = -40; x < width + 80; x += 94) {
    context.fillRect(x, floorY - 42, 58, 2);
  }

  const glow = context.createRadialGradient(width * 0.82, height * 0.22, 0, width * 0.82, height * 0.22, Math.min(width, height) * 0.24);
  glow.addColorStop(0, "rgba(231, 111, 71, 0.24)");
  glow.addColorStop(1, "rgba(231, 111, 71, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "#b8a37d";
  context.fillRect(0, floorY, width, height - floorY);
  context.fillStyle = "#e1c998";
  context.fillRect(0, floorY, width, 5);
  context.fillStyle = "rgba(9, 29, 34, 0.2)";
  context.fillRect(0, floorY + 12, width, 2);

  context.strokeStyle = "rgba(9, 29, 34, 0.22)";
  context.lineWidth = 1;
  context.beginPath();
  for (let x = -50; x < width + 80; x += 84) {
    context.moveTo(x, floorY + 14);
    context.lineTo(x + 46, height);
  }
  context.stroke();
}

function drawPlayer(images, alpha) {
  const animation = selectAnimation(player);
  const image = images[animation.sheet];
  const drawX = previousPlayer.x + (player.x - previousPlayer.x) * alpha;
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
      player = stepPlayer(player, {
        move: frameInput.move,
        jumpPressed: pendingJump
      }, FIXED_STEP, world);
      pendingJump = false;
      accumulator -= FIXED_STEP;
    }

    drawStage();
    drawPlayer(images, accumulator / FIXED_STEP);
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
