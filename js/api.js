import { state } from './state.js';

export const pokemonCache = new Map();
export let allPokemonNames = [];

const safeSessionGet = (key) => {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
};

const safeSessionSet = (key, value) => {
    try { sessionStorage.setItem(key, value); } catch (e) {}
};

export const fetchWithCache = async (url, cacheKey) => {
    if (pokemonCache.has(cacheKey)) return pokemonCache.get(cacheKey);
    
    const sessionData = safeSessionGet(cacheKey);
    if (sessionData) {
        try {
            const parsed = JSON.parse(sessionData);
            pokemonCache.set(cacheKey, parsed);
            return parsed;
        } catch(e) {}
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Not found');
        const data = await response.json();
        pokemonCache.set(cacheKey, data);
        safeSessionSet(cacheKey, JSON.stringify(data));
        return data;
    } catch (error) {
        return null;
    }
};

const adaptLocalToPokeAPI = (local) => {
    return {
        id: local.id,
        name: local.nome,
        height: local.altura,
        weight: local.peso,
        types: local.tipos.map(t => ({ type: { name: t } })),
        stats: [
            { base_stat: local.stats.hp, stat: { name: 'hp' } },
            { base_stat: local.stats.attack, stat: { name: 'attack' } },
            { base_stat: local.stats.defense, stat: { name: 'defense' } },
            { base_stat: local.stats["special-attack"], stat: { name: 'special-attack' } },
            { base_stat: local.stats["special-defense"], stat: { name: 'special-defense' } },
            { base_stat: local.stats.speed, stat: { name: 'speed' } }
        ],
        abilities: local.habilidades.map(h => ({ is_hidden: h.oculta, ability: { name: h.nome } })),
        cries: local.cries,
        sprites: { front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${local.id}.png` },
        _isLocal: true,
        _localEvolutions: local.evolucoes
    };
};

const adaptLocalToPokeAPISpecies = (local) => {
    return {
        color: { name: local.tipos[0] }, // Fallback para tipo primário
        genera: [
            { genus: local.categoria, language: { name: 'pt-BR' } },
            { genus: local.categoria, language: { name: 'en' } }
        ],
        flavor_text_entries: [
            { flavor_text: local.descricao, language: { name: 'pt-BR' } },
            { flavor_text: local.descricao, language: { name: 'en' } }
        ]
    };
};

const resolvePokemonId = (pokemon) => {
    if (typeof pokemon === 'number') return pokemon;
    if (!isNaN(parseInt(pokemon))) return parseInt(pokemon);
    const found = allPokemonNames.find(p => p.name === pokemon.toLowerCase());
    return found ? found.id : null;
};

export const fetchPokemonData = async (pokemon) => {
    if (state.currentGenId >= 3 && state.currentGenId <= 7) {
        const id = resolvePokemonId(pokemon);
        if (id && id <= 807) {
            const cacheKey = `local_poke_${id}_g${state.currentGenId}`;
            const cached = safeSessionGet(cacheKey);
            if (cached) return JSON.parse(cached);
            
            try {
                const response = await fetch(`./data/gen${state.currentGenId}/pokemon/${id}.json`);
                if (response.ok) {
                    const rawLocal = await response.json();
                    const adapted = adaptLocalToPokeAPI(rawLocal);
                    safeSessionSet(cacheKey, JSON.stringify(adapted));
                    return adapted;
                }
            } catch (e) {
                console.warn("Failed to fetch local pokemon data", e);
            }
        }
    }
    return fetchWithCache(`https://pokeapi.co/api/v2/pokemon/${pokemon}`, `poke_${pokemon}`);
};

export const fetchSpeciesData = async (pokemon) => {
    if (state.currentGenId >= 3 && state.currentGenId <= 7) {
        const id = resolvePokemonId(pokemon);
        if (id && id <= 807) {
            const cacheKey = `local_spec_${id}_g${state.currentGenId}`;
            const cached = safeSessionGet(cacheKey);
            if (cached) return JSON.parse(cached);
            
            try {
                const response = await fetch(`./data/gen${state.currentGenId}/pokemon/${id}.json`);
                if (response.ok) {
                    const rawLocal = await response.json();
                    const adapted = adaptLocalToPokeAPISpecies(rawLocal);
                    safeSessionSet(cacheKey, JSON.stringify(adapted));
                    return adapted;
                }
            } catch (e) {
                console.warn("Failed to fetch local species data", e);
            }
        }
    }
    return fetchWithCache(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}`, `spec_${pokemon}`);
};

export const fetchTypeData = (type) => fetchWithCache(`https://pokeapi.co/api/v2/type/${type}`, `type_${type}`);

export const loadAllPokemon = async () => {
    try {
        const cachedNames = safeSessionGet('all_pokemon_names');
        if (cachedNames) {
            try {
                allPokemonNames = JSON.parse(cachedNames);
                return;
            } catch(e) {}
        }

        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
        const data = await response.json();
        allPokemonNames = data.results.map((p, index) => ({ name: p.name, id: index + 1 }));
        safeSessionSet('all_pokemon_names', JSON.stringify(allPokemonNames));
    } catch (error) {
        console.error("Erro ao carregar lista de nomes", error);
    }
};
