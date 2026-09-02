export const state = {
    searchPokemon: 1,
    currentGenId: 1,
    isShiny: false,
    currentPokemonData: null,
    currentLang: localStorage.getItem('pokedex-lang') || 'pt',
    spriteMode: localStorage.getItem('pokedex-sprite-mode') || 'classic',
    favoriteList: JSON.parse(localStorage.getItem('pokedex-favorites') || '[]')
};

export const saveLang = (lang) => {
    state.currentLang = lang;
    localStorage.setItem('pokedex-lang', lang);
};

export const saveSpriteMode = (mode) => {
    state.spriteMode = mode;
    localStorage.setItem('pokedex-sprite-mode', mode);
};

export const toggleFavorite = (id) => {
    if (state.favoriteList.includes(id)) {
        state.favoriteList = state.favoriteList.filter(f => f !== id);
    } else {
        state.favoriteList.push(id);
    }
    localStorage.setItem('pokedex-favorites', JSON.stringify(state.favoriteList));
};
