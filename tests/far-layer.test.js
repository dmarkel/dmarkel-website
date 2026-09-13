import test from 'node:test';
import assert from 'node:assert/strict';
import { farLayerGeometry } from '../src/far-layer.js';
import { THREE_CITIES } from '../src/three-cities-scene.js';
import { layerPanelTransforms, sceneFloor } from '../src/scene-geometry.js';

test('chapter four distant art covers the walk without unnecessary pixel enlargement', () => {
  const art = THREE_CITIES.art, layer = THREE_CITIES.layers[0];
  assert.ok(layer.paths[0].includes('far-v2.webp'));
  for (const [width,height] of [[390,844],[844,390],[1280,800],[1920,1080],[2560,1080]]) {
    const scale = Math.max(1,height/art.height);
    const world = {scale,width:11000*scale};
    const far = farLayerGeometry(layer,art,world,{width,height});
    assert.equal(far.scale,Math.max(scale,width/layer.width));
    assert.ok(far.factor <= 0.12);
    const floor = sceneFloor(height,art.height,art.groundLine,scale);
    for (const camera of [0,(world.width-width)/2,world.width-width]) {
      const [t] = layerPanelTransforms(camera,width,world.width,far.factor,far.width,far.height,1,far.scale,art.groundLine,floor);
      assert.ok(t.x <= 0);
      assert.ok(t.x+t.width >= width-0.001);
      assert.ok(t.y <= 0.001);
      assert.ok(t.y+t.height >= floor-(art.groundLine-665)*scale);
      assert.ok(Math.abs(t.width/t.height-layer.width/layer.height) < 1e-10);
    }
  }
});
