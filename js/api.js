export const pokemonCache = new Map();
export let allPokemonNames = [];

export const fetchWithCache = async (url, cacheKey) => {
    if (pokemonCache.has(cacheKey)) return pokemonCache.get(cacheKey);
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Not found');
        const data = await response.json();
        pokemonCache.set(cacheKey, data);
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
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
        const data = await response.json();
        allPokemonNames = data.results.map(p => p.name);
    } catch (e) {
        console.error("Failed to load pokemon list for search", e);
    }
};
