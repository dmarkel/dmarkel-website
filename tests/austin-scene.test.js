import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { AUSTIN, AUSTIN_ASSETS } from '../src/austin-scene.js';

test('Austin owns its scenery and foreground furniture', () => {
  assert.equal(AUSTIN.id, 'austin');
  assert.equal(AUSTIN.layers[0].preserveDetail, true);
  assert.equal(AUSTIN.layers[1].paths.length, 3);
  assert.ok(AUSTIN.foreground.endSourceX >= 10000);
  for (const path of [...AUSTIN.layers.flatMap(layer => layer.paths),
    ...Object.values(AUSTIN_ASSETS).map(asset => asset.path)]) {
    assert.match(path, /^assets\/backgrounds\/austin\//);
    assert.ok(existsSync(new URL(`../${path.split('?')[0]}`, import.meta.url)), path);
  }
  assert.ok(AUSTIN.foreground.props.every(prop => prop.id.startsWith('austin-')));
  assert.deepEqual(AUSTIN.foreground.frontProps, AUSTIN.foreground.props);
});
