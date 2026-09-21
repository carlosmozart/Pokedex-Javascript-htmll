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

export const fetchPokemonData = (pokemon) => fetchWithCache(`https://pokeapi.co/api/v2/pokemon/${pokemon}`, `poke_${pokemon}`);
export const fetchSpeciesData = (pokemon) => fetchWithCache(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}`, `spec_${pokemon}`);
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
