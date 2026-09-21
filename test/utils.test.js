import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEvolutionLinks } from '../js/utils.js';

const species = id => ({ name: `pokemon-${id}`, url: `https://pokeapi.co/api/v2/pokemon-species/${id}/` });

test('parseEvolutionLinks converte uma cadeia simples', () => {
  const links = parseEvolutionLinks({
    species: species(1),
    evolves_to: [{
      species: species(2),
      evolution_details: [{ trigger: { name: 'level-up' }, min_level: 16 }],
      evolves_to: []
    }]
  });

  assert.deepEqual(links.map(link => ({ fromId: link.fromId, toId: link.toId, method: link.method })), [
    { fromId: 1, toId: 2, method: 'Level 16' }
  ]);
});

test('parseEvolutionLinks trata cadeia vazia', () => {
  assert.deepEqual(parseEvolutionLinks(null), []);
  assert.deepEqual(parseEvolutionLinks({ evolves_to: [] }), []);
});
