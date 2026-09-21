const safeGetItem = (key, defaultValue) => {
    try {
        return localStorage.getItem(key) || defaultValue;
    } catch (e) {
        return defaultValue;
    }
};

const safeGetJSON = (key, defaultValue) => {
    try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : defaultValue;
    } catch (e) {
        return defaultValue;
    }
};

const safeSetItem = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        // Ignora no modo anônimo
    }
};

export const state = {
    searchPokemon: 1,
    currentGenId: 1,
    isShiny: false,
    currentPokemonData: null,
    currentLang: safeGetItem('pokedex-lang', 'pt'),
    spriteMode: safeGetItem('pokedex-sprite-mode', 'classic'),
    favoriteList: safeGetJSON('pokedex-favorites', [])
};

export const saveLang = (lang) => {
    state.currentLang = lang;
    safeSetItem('pokedex-lang', lang);
};

export const saveSpriteMode = (mode) => {
    state.spriteMode = mode;
    safeSetItem('pokedex-sprite-mode', mode);
};

export const toggleFavorite = (id) => {
    if (state.favoriteList.includes(id)) {
        state.favoriteList = state.favoriteList.filter(f => f !== id);
    } else {
        state.favoriteList.push(id);
    }
    safeSetItem('pokedex-favorites', JSON.stringify(state.favoriteList));
};
