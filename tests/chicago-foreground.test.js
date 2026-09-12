import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CHICAGO } from '../src/chicago-scene.js';

test('Chicago foreground props use location-owned artwork and valid ground anchors', () => {
  for (const prop of CHICAGO.foreground.props) {
    const asset = CHICAGO.assets[prop.assetId];
    assert.ok(asset.path.startsWith('assets/backgrounds/chicago/'));
    assert.ok(fs.existsSync(asset.path.split('?')[0]));
    assert.equal(prop.baseY, asset.baseY);
    assert.ok(asset.baseY >= 0 && asset.baseY < asset.height);
    assert.equal(prop.groundY, prop.plane === 'back' ? 675 : 765);
  }
});
