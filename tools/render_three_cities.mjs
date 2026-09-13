// Render the real shared runtime with a deterministic clock and native Canvas.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(`${process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES}/tool.js`);
const { createCanvas, Image: NativeImage } = require('@napi-rs/canvas');
const root = path.resolve(import.meta.dirname, '..');
process.chdir(root);
const out = process.argv[2] ?? '/tmp/three-cities-review';
fs.mkdirSync(out, { recursive: true });
const callbacks = new Map();
let nextId = 0, time = 100;
function element() {
  const listeners = {}, classes = new Set();
  return { style: { setProperty() {} }, hidden: false, textContent: '',
    classList: { add: c => classes.add(c), remove: c => classes.delete(c), contains: c => classes.has(c) },
    setAttribute() {}, setPointerCapture() {}, getBoundingClientRect: () => ({left:0,width:100}),
    addEventListener: (event, fn) => { (listeners[event] ??= []).push(fn); },
    emit: (event, detail={}) => { for(const fn of listeners[event] ?? []) fn({preventDefault(){},...detail}); },
  };
}
const elements = new Map();
const canvas = createCanvas(1280,800); canvas.style={}; canvas.setAttribute=()=>{};
elements.set('#game',canvas);
const get = selector => { if(!elements.has(selector)) elements.set(selector,element()); return elements.get(selector); };
globalThis.window = {...element(),innerWidth:1280,innerHeight:800,devicePixelRatio:1};
globalThis.document = {...element(),hidden:false,querySelector: selector => selector.startsWith('#chapter-') ? null : get(selector)};
globalThis.Image = class extends NativeImage { set src(value) { super.src=fs.readFileSync(value.split('?')[0]); } };
globalThis.requestAnimationFrame = fn => { callbacks.set(++nextId,fn); return nextId; };
globalThis.cancelAnimationFrame = id => callbacks.delete(id);
const { startJourney } = await import('../src/journey-game.js');
const sceneModule = process.argv[3] ?? '../src/three-cities-scene.js';
const sceneExport = process.argv[4] ?? 'THREE_CITIES';
const module = await import(sceneModule);
const scene = module[sceneExport];
if (!scene) throw new Error(`Missing scene export ${sceneExport} in ${sceneModule}`);
startJourney(0, [scene]);
for(let i=0;i<100 && !get('#status').hidden;i++) await new Promise(resolve=>setTimeout(resolve,20));
if(!get('#status').hidden) throw new Error(get('#status').textContent);
function frame() { time+=100; const batch=[...callbacks.values()]; callbacks.clear(); batch.forEach(fn=>fn(time)); }
function save(name) { fs.writeFileSync(`${out}/${name}.png`,canvas.toBuffer('image/png')); }
frame(); save('desktop-start');
window.emit('keydown',{code:'ArrowRight'});
for(let i=0;i<180;i++) { frame(); if(i%10===0)save('desktop-'+String(i).padStart(3,'0')); }
window.emit('keyup',{code:'ArrowRight'});save('desktop-end');
for(const [name,width,height] of [['portrait',390,844],['landscape',844,390],['portrait-return',390,844]]) {
  window.innerWidth=width;window.innerHeight=height;window.emit('resize');frame();frame();save(name);
}
console.log('Rendered desktop traversal, portrait, landscape, and rotate-back views to',out);
