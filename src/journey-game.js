import { FIXED_STEP, SPRITES } from "./config.js";
import { createInput } from "./input.js";
import { groundTileTransforms, propTransform } from "./modular-foreground.js?v=chapter-8";
import { createCamera, stepCamera } from "./parallax.js";
import { createPlayer, selectAnimation, stepPlayer } from "./player.js";
import {
  endpointAlignedFactor,
  layerPanelTransforms,
  sceneFloor,
  sceneWorld,
} from "./scene-geometry.js?v=chapter-8";
import { applyViewport, readViewport } from "./viewport.js";

import { CHAPTERS } from "./chapters.js?v=chicago-2";
import { adjacentChapter } from "./journey.js";

export function startJourney(initialChapter = 0, sceneList = CHAPTERS) {
  const CHAPTERS = sceneList;
  let chapterIndex = initialChapter;
  let chapter = CHAPTERS[chapterIndex];
  let { art: ART, layers: CHAPTER_LAYERS, assets: ASSETS, foreground: FOREGROUND } = chapter;
  let transition = null;
  const FADE_SECONDS = 0.45;
  const TITLE_SECONDS = 0.65;
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

  function chapterImagePaths(scene) {
    return {
      walk: "assets/avatar/avatar-walk-right.png",
      jump: "assets/avatar/avatar-jump-right.png",
      ...Object.fromEntries(scene.layers.flatMap(({ name, paths }) =>
        paths.map((path, index) => [`${name}-${index}`, path]))),
      ground: scene.foreground.ground.path,
      ...Object.fromEntries(Object.entries(scene.assets).map(([id, asset]) => [`foreground-${id}`, asset.path])),
    };
  }
  status.textContent = "Preparing the journey…";
  const imageCache = new Map();
  const chapterImages = CHAPTERS.map((scene) => Promise.all(
    Object.entries(chapterImagePaths(scene)).map(async ([name, path]) => {
      if (!imageCache.has(path)) imageCache.set(path, loadImage(path));
      return [name, await imageCache.get(path)];
    }),
  ).then(Object.fromEntries));
  // Observe preload failures immediately; the initial load below reports them to the user.
  chapterImages.forEach((promise) => promise.catch(() => {}));

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
    const oldHeightAboveGround = player ? oldFloor - player.y - player.height : 0;
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
      width: FOREGROUND.endSourceX * scene.scale,
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
        player.y = world.floorY - player.height - Math.max(0, oldHeightAboveGround);
      }
    }

    previousPlayer = { ...player };
    camera = stepCamera(camera, player.x + player.width / 2, width, world.width, 1);
    previousCamera = { ...camera };
  }

  function drawProps(images, props, cameraX) {
    const sceneY = world.floorY - ART.groundLine * world.scale;
    for (const prop of props) {
      const asset = ASSETS[prop.assetId];
      const transform = propTransform(
        prop,
        asset.width,
        asset.height,
        cameraX,
        world.scale,
        sceneY,
        prop.avatarScaleFactor !== undefined
          ? scale * prop.avatarScaleFactor
          : chapter.avatarScaledProps ? scale : undefined,
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

  function drawScene(images, cameraX) {
    context.fillStyle = "#8ed6f0";
    context.fillRect(0, 0, viewport.width, viewport.height);
    for (const layer of CHAPTER_LAYERS) {
      const factor = layer.name === "environment"
        ? endpointAlignedFactor(
          (layer.endSourceX ?? ART.width * layer.paths.length) * world.scale,
          viewport.width,
          world.width,
        )
        : layer.factor;
      // Opaque far plates must also cover viewports wider than their native art.
      // Scale both dimensions together; never stretch the bitmap horizontally.
      const layerScale = layer.coverViewport
        ? Math.max(world.scale, (viewport.width + Math.max(0, world.width - viewport.width) * factor) / (ART.width * layer.paths.length))
        : world.scale;
      const transforms = layerPanelTransforms(
        cameraX,
        viewport.width,
        world.width,
        factor,
        ART.width,
        ART.height,
        layer.paths.length,
        layerScale,
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

    drawProps(images, FOREGROUND.backProps, cameraX);
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

  function updateChapterLabels() {
    document.title = `David — ${chapter.label}`;
    document.querySelector(".eyebrow").textContent = chapter.label;
    document.querySelector("h1").textContent = "Walk it back.";
    stage.setAttribute("aria-label", `Playable pixel journey through ${chapter.id}`);
    canvas.setAttribute("aria-label", `A pixel character walking from ${chapter.description}`);
  }

  function enterChapter(index, direction) {
    const heightAboveGround = world.floorY - player.y - player.height;
    const incomingPlayer = { ...player };
    chapterIndex = index;
    chapter = CHAPTERS[index];
    ({ art: ART, layers: CHAPTER_LAYERS, assets: ASSETS, foreground: FOREGROUND } = chapter);
    resize();
    player = {
      ...incomingPlayer,
      width: player.width,
      height: player.height,
      x: direction > 0 ? 0 : Math.max(0, world.width - player.width),
      y: world.floorY - player.height - heightAboveGround,
    };
    previousPlayer = { ...player };
    camera = createCamera(direction > 0 ? 0 : Math.max(0, world.width - viewport.width));
    previousCamera = { ...camera };
    pendingJump = false;
    updateChapterLabels();
  }

  function drawTransition() {
    if (!transition) return;
    const elapsed = transition.elapsed;
    const opacity = elapsed < FADE_SECONDS ? elapsed / FADE_SECONDS
      : elapsed < FADE_SECONDS + TITLE_SECONDS ? 1
      : Math.max(0, 1 - (elapsed - FADE_SECONDS - TITLE_SECONDS) / FADE_SECONDS);
    context.save();
    context.globalAlpha = opacity;
    context.fillStyle = "#091d22";
    context.fillRect(0, 0, viewport.width, viewport.height);
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.font = `600 ${Math.min(30, viewport.width / 17)}px system-ui, sans-serif`;
    context.fillText(CHAPTERS[transition.nextIndex].label, viewport.width / 2, viewport.height / 2);
    context.restore();
  }

  function start(allImages) {
    let images = allImages[chapterIndex];
    resize();
    updateChapterLabels();
    status.hidden = true;

    function frame(time) {
      if (!lastTime) lastTime = time;
      accumulator += Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const frameInput = input.snapshot();
      if (frameInput.jumpPressed && !transition) pendingJump = true;
      if (frameInput.move !== 0 || frameInput.jumpPressed) dismissInstructions();

      while (accumulator >= FIXED_STEP) {
        previousPlayer = { ...player };
        previousCamera = { ...camera };
        if (transition) {
          transition.elapsed += FIXED_STEP;
          if (!transition.entered && transition.elapsed >= FADE_SECONDS) {
            enterChapter(transition.nextIndex, transition.direction);
            images = allImages[chapterIndex];
            transition.entered = true;
          }
          if (transition.elapsed >= FADE_SECONDS * 2 + TITLE_SECONDS) {
            transition = null;
            stage.classList.remove("is-transitioning");
            status.hidden = true;
          }
        } else {
          const incomingVx = player.vx;
          player = stepPlayer(player, {
            move: frameInput.move,
            jumpPressed: pendingJump,
          }, FIXED_STEP, world);
          camera = stepCamera(camera, player.x + player.width / 2, viewport.width, world.width, FIXED_STEP);
          const nextIndex = adjacentChapter(chapterIndex, CHAPTERS.length, player, frameInput.move, world);
          if (nextIndex !== null) {
            // Boundary clamping stops vx; retain momentum for the next chapter.
            player.vx = incomingVx;
            transition = { nextIndex, direction: Math.sign(frameInput.move), elapsed: 0, entered: false };
            previousPlayer = { ...player };
            previousCamera = { ...camera };
            stage.classList.add("is-transitioning");
            status.textContent = `Entering ${CHAPTERS[transition.nextIndex].label}`;
            status.hidden = false;
          }
        }
        pendingJump = false;
        accumulator -= FIXED_STEP;
      }

      const alpha = accumulator / FIXED_STEP;
      const cameraX = previousCamera.x + (camera.x - previousCamera.x) * alpha;
      drawScene(images, cameraX);
      drawPlayer(images, alpha);
      drawProps(images, FOREGROUND.frontProps, cameraX);
      drawTransition();
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

  Promise.all(chapterImages)
    .then(start)
    .catch((error) => {
      status.hidden = false;
      status.classList.add("is-error");
      status.textContent = `${error.message}. Reload the page to try again.`;
    });

}
