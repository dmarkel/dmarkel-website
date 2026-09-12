import test from "node:test";
import assert from "node:assert/strict";
import { adjacentChapter } from "../src/journey.js";
import { CHAPTERS } from "../src/chapters.js";
import { existsSync } from "node:fs";

const world = { width: 800 };
const left = { x: 0, width: 96 };
const right = { x: 704, width: 96 };

test("chapter boundaries support both directions and future chapters", () => {
  for (const count of [2, 5]) {
    for (let i = 0; i < count; i++) {
      assert.equal(adjacentChapter(i, count, right, 1, world), i + 1 < count ? i + 1 : null);
      assert.equal(adjacentChapter(i, count, left, -1, world), i > 0 ? i - 1 : null);
      assert.equal(adjacentChapter(i, count, right, -1, world), null);
      assert.equal(adjacentChapter(i, count, left, 1, world), null);
      assert.equal(adjacentChapter(i, count, right, 0, world), null);
      assert.equal(adjacentChapter(i, count, { ...left, x: 400 }, 1, world), null);
    }
  }
});

test("every journey scene references available art", () => {
  assert.deepEqual(CHAPTERS.map(({ id }) => id), ["houston", "bloomington", "chicago"]);
  for (const scene of CHAPTERS) {
    const paths = [...scene.layers.flatMap(({ paths }) => paths), scene.foreground.ground.path,
      ...Object.values(scene.assets).map(({ path }) => path)];
    for (const path of paths) assert.ok(existsSync(new URL(`../${path.split('?')[0]}`, import.meta.url)), path);
  }
});

test("held keyboard and touch input cross chapters, fade, return, and survive resize", async () => {
  const originals = Object.fromEntries(["window", "document", "Image", "requestAnimationFrame", "cancelAnimationFrame"].map(key => [key, globalThis[key]]));
  const callbacks = new Map();
  let nextId = 0;
  let time = 100;
  let lastAvatar = null;
  let fadeDraws = 0;
  let translationX = 0;
  const context = new Proxy({}, { get(target, key) {
    if (key === 'drawImage') return (image, ...args) => {
      if (image.src.includes('assets/avatar/')) { lastAvatar = [...args]; lastAvatar[4] += translationX; }
    };
    if (key === 'translate') return x => { translationX = x; };
    if (key === 'restore') return () => { translationX = 0; };
    if (key === 'fillText') return () => fadeDraws++;
    return target[key] ?? (() => {});
  }});
  function element() {
    const listeners = {};
    const classes = new Set();
    return { style: { setProperty() {} }, hidden: false, textContent: '',
      classList: { add: c => classes.add(c), remove: c => classes.delete(c), contains: c => classes.has(c) },
      setAttribute() {}, setPointerCapture() {}, getBoundingClientRect: () => ({ left: 0, width: 100 }),
      addEventListener: (event, fn) => { (listeners[event] ??= []).push(fn); },
      emit: (event, detail = {}) => { for (const fn of listeners[event] ?? []) fn({ preventDefault() {}, ...detail }); },
      getContext: () => context,
    };
  }
  const elements = new Map();
  const get = selector => { if (!elements.has(selector)) elements.set(selector, element()); return elements.get(selector); };
  try {
    globalThis.window = { ...element(), innerWidth: 1280, innerHeight: 800, devicePixelRatio: 1 };
    globalThis.document = { ...element(), hidden: false, querySelector: get };
    globalThis.Image = class { set src(value) { this._src = value; queueMicrotask(() => this.onload()); } get src() { return this._src; } };
    globalThis.requestAnimationFrame = fn => { callbacks.set(++nextId, fn); return nextId; };
    globalThis.cancelAnimationFrame = id => callbacks.delete(id);
    const { startJourney } = await import('../src/journey-game.js');
    startJourney();
    await new Promise(resolve => setImmediate(resolve));
    function frame() { time += 1000 / 60; const batch = [...callbacks.values()]; callbacks.clear(); batch.forEach(fn => fn(time)); }
    function until(predicate, limit = 1800) { for (let i = 0; i < limit && !predicate(); i++) frame(); assert.ok(predicate(), 'expected state reached'); }
    const transitioning = () => get('.stage').classList.contains('is-transitioning');
    assert.equal(get('.eyebrow').textContent, CHAPTERS[0].label);
    window.emit('keydown', { code: 'ArrowRight' });
    until(transitioning);
    assert.equal(get('.eyebrow').textContent, CHAPTERS[0].label, 'fade starts in Houston');
    until(() => get('.eyebrow').textContent === CHAPTERS[1].label);
    assert.ok(transitioning(), 'scene swaps under fade');
    until(() => !transitioning());
    frame();
    assert.ok(lastAvatar[4] < 50, 'arrives at Bloomington left edge');
    for (let i = 0; i < 60; i++) frame();
    assert.ok(lastAvatar[4] > 100, 'held right keeps walking after fade');
    // Continue through Bloomington into Chicago, then return to Bloomington.
    until(() => get('.eyebrow').textContent === CHAPTERS[2].label);
    until(() => !transitioning());
    for (let i = 0; i < 60; i++) frame();
    window.emit('keyup', { code: 'ArrowRight' });
    window.emit('keydown', { code: 'ArrowLeft' });
    until(() => get('.eyebrow').textContent === CHAPTERS[1].label);
    until(() => !transitioning());
    window.emit('keyup', { code: 'ArrowLeft' });
    get('#joystick').emit('pointerdown', { pointerId: 1, clientX: 0 });
    until(transitioning);
    window.innerWidth = 390; window.innerHeight = 844; window.emit('resize'); frame();
    until(() => get('.eyebrow').textContent === CHAPTERS[0].label);
    until(() => !transitioning());
    frame();
    assert.ok(lastAvatar[4] > 200, 'returns to Houston right edge on mobile');
    assert.ok(fadeDraws > 0);
    get('#joystick').emit('pointerup', { pointerId: 1 });
    for (let i = 0; i < 60; i++) frame();
    assert.equal(transitioning(), false, 'no automatic bounce at arrival');
  } finally {
    for (const [key, value] of Object.entries(originals)) {
      if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
    }
  }
});
