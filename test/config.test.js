import test from 'node:test';
import assert from 'node:assert/strict';
import { generationsConfig, MAX_POKEMON } from '../js/config.js';

test('as gerações cobrem os IDs sem sobreposição', () => {
  const generations = Object.values(generationsConfig);
  assert.equal(generations[0].offset, 0);
  for (let index = 1; index < generations.length; index++) {
    assert.equal(generations[index].offset, generations[index - 1].limit);
  }
  assert.equal(generations.at(-1).limit, MAX_POKEMON);
});

test('cada geração possui configuração de API', () => {
  for (const generation of Object.values(generationsConfig)) {
    assert.match(generation.apiVersion, /^generation-/);
    assert.ok(generation.apiGame);
    assert.ok(generation.limit > generation.offset);
  }
});
