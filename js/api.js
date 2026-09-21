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
        types: (local.tipos || []).map(t => ({ type: { name: t } })),
        stats: [
            { base_stat: local.stats ? local.stats.hp : 0, stat: { name: 'hp' } },
            { base_stat: local.stats ? local.stats.attack : 0, stat: { name: 'attack' } },
            { base_stat: local.stats ? local.stats.defense : 0, stat: { name: 'defense' } },
            { base_stat: local.stats ? local.stats["special-attack"] : 0, stat: { name: 'special-attack' } },
            { base_stat: local.stats ? local.stats["special-defense"] : 0, stat: { name: 'special-defense' } },
            { base_stat: local.stats ? local.stats.speed : 0, stat: { name: 'speed' } }
        ],
        abilities: (local.habilidades || []).map(h => ({ is_hidden: h.oculta, ability: { name: h.nome } })),
        cries: local.cries || null,
        sprites: { 
            front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${local.id}.png`,
            front_shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${local.id}.png`,
            other: {
                showdown: {
                    front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${local.id}.gif`,
                    front_shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/shiny/${local.id}.gif`
                },
                'official-artwork': {
                    front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${local.id}.png`,
                    front_shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${local.id}.png`
                }
            }
        },
        _isLocal: true,
        _localEvolutions: local.evolucoes || [],
        _rawLocal: local
    };
};

const adaptLocalToPokeAPISpecies = (local, translatedDesc) => {
    const desc = translatedDesc || local.descricao || "Descrição indisponível.";
    return {
        color: { name: local.tipos && local.tipos[0] ? local.tipos[0] : 'normal' },
        genera: [
            { genus: local.categoria || 'Pokémon', language: { name: 'pt-BR' } },
            { genus: local.categoria || 'Pokémon', language: { name: 'en' } }
        ],
        flavor_text_entries: [
            { flavor_text: desc, language: { name: 'pt-BR' } },
            { flavor_text: desc, language: { name: 'en' } }
        ]
    };
};

export const fetchTranslations = async (lang, genId) => {
    const cacheKey = `i18n_${lang}_g${genId}`;
    const cached = safeSessionGet(cacheKey);
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch(e) {}
    }
    
    try {
        const response = await fetch(`./data/gen${genId}/i18n/${lang}.json`);
        if (response.ok) {
            const data = await response.json();
            safeSessionSet(cacheKey, JSON.stringify(data));
            return data;
        }
    } catch (e) {}
    return null;
};

const resolvePokemonId = (pokemon) => {
    if (typeof pokemon === 'number') return pokemon;
    if (!isNaN(parseInt(pokemon))) return parseInt(pokemon);
    const found = allPokemonNames.find(p => p.name === pokemon.toLowerCase());
    return found ? found.id : null;
};

export const fetchPokemonData = async (pokemon) => {
    const id = resolvePokemonId(pokemon);
    if (id && id <= 807) {
        let targetGen = state.currentGenId;
        if (targetGen < 3 || targetGen > 7) targetGen = 7;
        
        const cacheKey = `local_poke_v2_${id}_g${targetGen}`;
        const cached = safeSessionGet(cacheKey);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch(e) {}
        }
        
        try {
            const response = await fetch(`./data/gen${targetGen}/pokemon/${id}.json`);
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
    return fetchWithCache(`https://pokeapi.co/api/v2/pokemon/${pokemon}`, `poke_${pokemon}`);
};

export const fetchSpeciesData = async (pokemon) => {
    const id = resolvePokemonId(pokemon);
    if (id && id <= 807) {
        let targetGen = state.currentGenId;
        if (targetGen < 3 || targetGen > 7) targetGen = 7;
        
        const cacheKey = `local_spec_${id}_g${targetGen}_${state.currentLang}`;
        const cached = safeSessionGet(cacheKey);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch(e) {}
        }
        
        try {
            const response = await fetch(`./data/gen${targetGen}/pokemon/${id}.json`);
            if (response.ok) {
                const rawLocal = await response.json();
                
                let translatedDesc = null;
                const i18n = await fetchTranslations(state.currentLang, targetGen);
                if (i18n && i18n.pokedex && i18n.pokedex[id]) {
                    translatedDesc = i18n.pokedex[id];
                }
                
                const adapted = adaptLocalToPokeAPISpecies(rawLocal, translatedDesc);
                safeSessionSet(cacheKey, JSON.stringify(adapted));
                return adapted;
            }
        } catch (e) {
            console.warn("Failed to fetch local species data", e);
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
