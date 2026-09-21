export const pokemonCache = new Map();
export let allPokemonNames = [];

export const fetchWithCache = async (url, cacheKey) => {
    if (pokemonCache.has(cacheKey)) return pokemonCache.get(cacheKey);
    
    const sessionData = sessionStorage.getItem(cacheKey);
    if (sessionData) {
        const parsed = JSON.parse(sessionData);
        pokemonCache.set(cacheKey, parsed);
        return parsed;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Not found');
        const data = await response.json();
        pokemonCache.set(cacheKey, data);
        try { sessionStorage.setItem(cacheKey, JSON.stringify(data)); } catch (e) {}
        return data;
    } catch (error) {
        return null;
    }
};

export const fetchPokemonData = (pokemon) => fetchWithCache(`https://pokeapi.co/api/v2/pokemon/${pokemon}`, `poke_${pokemon}`);
export const fetchSpeciesData = (pokemon) => fetchWithCache(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}`, `spec_${pokemon}`);
export const fetchTypeData = (type) => fetchWithCache(`https://pokeapi.co/api/v2/type/${type}`, `type_${type}`);

export const loadAllPokemon = async () => {
    try {
        const cachedNames = sessionStorage.getItem('all_pokemon_names');
        if (cachedNames) {
            allPokemonNames = JSON.parse(cachedNames);
            return;
        }

        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
        const data = await response.json();
        allPokemonNames = data.results.map(p => p.name);
        try { sessionStorage.setItem('all_pokemon_names', JSON.stringify(allPokemonNames)); } catch (e) {}
    } catch (e) {
        console.error("Failed to load pokemon list for search", e);
    }
};
