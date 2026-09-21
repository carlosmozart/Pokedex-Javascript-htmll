import { state } from './state.js';
import { typeTranslations, generationsConfig } from './config.js';
import { getPokemonSprite, parseEvolutionLinks, playCry } from './utils.js';
import { fetchPokemonData, fetchSpeciesData, fetchTypeData, fetchWithCache } from './api.js';

export const dom = {
    pokemonName: document.querySelector('.pokemon-name'),
    pokemonNumber: document.querySelector('.pokemon-number'),
    pokemonImage: document.querySelector('.pokemon-image'),
    badge1: document.querySelector('.badge1'),
    badge2: document.querySelector('.badge2'),
    pokemonDesc: document.querySelector('.pokemon-description'),
    pokemonCategory: document.querySelector('.pokemon-category'),
    pokemonHeight: document.querySelector('.pokemon-height'),
    pokemonWeight: document.querySelector('.pokemon-weight'),
    pokemonAbility: document.querySelector('.pokemon-ability'),
    
    hpVal: document.querySelector('.hp-val'), hpBar: document.querySelector('.stat-hp'),
    atkVal: document.querySelector('.atk-val'), atkBar: document.querySelector('.stat-atk'),
    defVal: document.querySelector('.def-val'), defBar: document.querySelector('.stat-def'),
    spaVal: document.querySelector('.spa-val'), spaBar: document.querySelector('.stat-spa'),
    spdVal: document.querySelector('.spd-val'), spdBar: document.querySelector('.stat-spd'),
    speVal: document.querySelector('.spe-val'), speBar: document.querySelector('.stat-spe'),
    
    form: document.querySelector('.search-form'),
    input: document.querySelector('.input-search'),
    autocompleteList: document.getElementById('autocomplete-list'),
    btnPrev: document.querySelector('.btn-prev'),
    btnNext: document.querySelector('.btn-next'),
    btnRandom: document.querySelector('.btn-random'),
    btnShiny: document.querySelector('#btn-shiny'),
    btnCry: document.querySelector('#btn-cry'),
    btnFav: document.querySelector('#btn-fav'),
    btnOpenGrid: document.querySelector('#btn-open-grid'),
    btnCloseGrid: document.querySelector('#btn-close-grid'),
    genSelect: document.querySelector('#generation-select'),
    themeToggle: document.querySelector('#theme-toggle'),
    langSelect: document.querySelector('#lang-select'),
    spriteSelect: document.querySelector('#sprite-select'),
    dynamicBg: document.querySelector('#dynamic-bg'),
    loadingOverlay: document.querySelector('#loading-overlay'),
    gridModal: document.querySelector('#grid-modal'),
    gridContainer: document.querySelector('#grid-container'),
    gridGenNumber: document.querySelector('#grid-gen-number'),
    toast: document.querySelector('#toast'),
    toastMessage: document.querySelector('#toast-message'),
    
    matchupsContainer: document.querySelector('.matchups-container'),
    evolutionContainer: document.querySelector('.evolution-container'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content')
};

export const initTheme = () => {
    const savedTheme = localStorage.getItem('pokedex-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    dom.themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
};

export const updateFavButton = (id) => {
    if (state.favoriteList.includes(id)) {
        dom.btnFav.classList.add('active');
        dom.btnFav.textContent = '❤️';
    } else {
        dom.btnFav.classList.remove('active');
        dom.btnFav.textContent = '🤍';
    }
};

export const renderStats = (stats) => {
    const maxStat = 255;
    const statBars = [
        { valEl: dom.hpVal, barEl: dom.hpBar }, { valEl: dom.atkVal, barEl: dom.atkBar },
        { valEl: dom.defVal, barEl: dom.defBar }, { valEl: dom.spaVal, barEl: dom.spaBar },
        { valEl: dom.spdVal, barEl: dom.spdBar }, { valEl: dom.speVal, barEl: dom.speBar }
    ];
    stats.forEach((stat, index) => {
        const value = stat.base_stat;
        statBars[index].valEl.textContent = value;
        statBars[index].barEl.style.width = `${Math.min((value / maxStat) * 100, 100)}%`;
    });
};

export const renderTypeMatchups = async (types) => {
    dom.matchupsContainer.innerHTML = '<div class="spinner"></div>';
    
    const typePromises = types.map(t => fetchTypeData(t.type.name));
    const typeResults = await Promise.all(typePromises);
    
    const multiplierMap = {};
    Object.keys(typeTranslations).forEach(t => multiplierMap[t] = 1);

    typeResults.forEach(result => {
        if (!result) return;
        const damage = result.damage_relations;
        damage.double_damage_from.forEach(t => multiplierMap[t.name] *= 2);
        damage.half_damage_from.forEach(t => multiplierMap[t.name] *= 0.5);
        damage.no_damage_from.forEach(t => multiplierMap[t.name] *= 0);
    });

    let html = '';
    for (const [type, mult] of Object.entries(multiplierMap)) {
        if (mult === 1) continue; 
        let multClass = mult === 4 ? 'mult-4' : mult === 2 ? 'mult-2' : mult === 0.5 ? 'mult-05' : mult === 0.25 ? 'mult-025' : 'mult-0';
        html += `
            <div class="matchup-item badge-${type} ${multClass}">
                <span>${typeTranslations[type]}</span>
                <span class="matchup-mult">x${mult}</span>
            </div>
        `;
    }
    dom.matchupsContainer.innerHTML = html || '<span>Sem fraquezas/vantagens notáveis.</span>';
};

export const renderEvolutions = async (speciesData) => {
    dom.evolutionContainer.innerHTML = '<div class="spinner"></div>';
    if (!speciesData || !speciesData.evolution_chain) {
        dom.evolutionContainer.innerHTML = '<span>Sem evolução.</span>';
        return;
    }
    const chainUrl = speciesData.evolution_chain.url;
    const chainData = await fetchWithCache(chainUrl, `evo_${chainUrl}`);
    if (!chainData) return;

    const links = parseEvolutionLinks(chainData.chain);
    
    if (links.length === 0) {
        dom.evolutionContainer.innerHTML = '<span>Sem evolução.</span>';
        return;
    }

    let html = '<div style="display:flex; flex-wrap: wrap; justify-content: center; gap: 15px; width: 100%;">';
    
    for (let link of links) {
        const fromData = await fetchPokemonData(link.fromId);
        const toData = await fetchPokemonData(link.toId);
        const fromSprite = fromData ? fromData.sprites.front_default : './images/miss.png';
        const toSprite = toData ? toData.sprites.front_default : './images/miss.png';

        html += `
            <div style="display:flex; align-items:center; justify-content: center; gap: 10px; background: var(--stat-bar-bg); padding: 10px; border-radius: 10px;">
                <div class="evo-item" data-id="${link.fromId}">
                    <img src="${fromSprite}" class="evo-img">
                    <span class="evo-name">${link.fromName}</span>
                </div>
                
                <div style="display:flex; flex-direction:column; align-items:center; font-size: 0.75rem; color: var(--text-muted); font-weight: bold; width: 80px; text-align: center;">
                    <span>➔</span>
                    <span>${link.method}</span>
                </div>

                <div class="evo-item" data-id="${link.toId}">
                    <img src="${toSprite}" class="evo-img">
                    <span class="evo-name">${link.toName}</span>
                </div>
            </div>
        `;
    }
    html += '</div>';
    dom.evolutionContainer.innerHTML = html;
    
    dom.evolutionContainer.querySelectorAll('.evo-item').forEach(item => {
        item.addEventListener('click', () => {
            renderPokemon(item.dataset.id);
        });
    });
};

export const resetUI = () => {
    dom.pokemonName.innerHTML = 'Não Encontrado';
    dom.pokemonNumber.innerHTML = '#???';
    dom.pokemonImage.src = './images/miss.png';
    dom.pokemonCategory.innerHTML = '--';
    dom.pokemonDesc.innerHTML = 'Dados não encontrados no PokéAPI.';
    dom.badge1.style.display = 'none';
    dom.badge2.style.display = 'none';
    dom.pokemonHeight.innerHTML = '-- m';
    dom.pokemonWeight.innerHTML = '-- kg';
    dom.pokemonAbility.innerHTML = '--';
    dom.dynamicBg.className = '';
    dom.dynamicBg.style.backgroundColor = 'var(--type-normal)';
    renderStats([{base_stat:0},{base_stat:0},{base_stat:0},{base_stat:0},{base_stat:0},{base_stat:0}]);
    dom.matchupsContainer.innerHTML = '';
    dom.evolutionContainer.innerHTML = '';
    dom.btnFav.textContent = '🤍';
    dom.btnFav.classList.remove('active');
};

export const showToast = (message) => {
    if (!dom.toast) return;
    dom.toastMessage.textContent = message;
    dom.toast.classList.remove('hidden');
    setTimeout(() => {
        dom.toast.classList.add('hidden');
    }, 3000);
};

const updateBasicInfo = (data) => {
    dom.pokemonName.innerHTML = data.name;
    dom.pokemonNumber.innerHTML = `#${String(data.id).padStart(3, '0')}`;
    dom.pokemonImage.src = getPokemonSprite(data, false);
    dom.pokemonHeight.innerHTML = `${(data.height / 10).toFixed(1)} m`;
    dom.pokemonWeight.innerHTML = `${(data.weight / 10).toFixed(1)} kg`;
    const mainAbility = data.abilities.find(a => !a.is_hidden) || data.abilities[0];
    dom.pokemonAbility.innerHTML = mainAbility ? mainAbility.ability.name.replace('-', ' ') : 'N/A';
};

const updateTypes = (types) => {
    const primaryType = types[0].type.name;
    dom.dynamicBg.className = '';
    dom.dynamicBg.style.backgroundColor = `var(--type-${primaryType})`;

    dom.badge1.textContent = typeTranslations[primaryType] || primaryType;
    dom.badge1.className = `pokemon-type-badge badge1 badge-${primaryType}`;
    dom.badge1.style.display = 'block';

    if (types[1]) {
        const secondaryType = types[1].type.name;
        dom.badge2.textContent = typeTranslations[secondaryType] || secondaryType;
        dom.badge2.className = `pokemon-type-badge badge2 badge-${secondaryType}`;
        dom.badge2.style.display = 'block';
    } else {
        dom.badge2.style.display = 'none';
    }
};

const updateDescriptionAndCategory = (speciesData) => {
    let genusObj = speciesData.genera.find(g => g.language.name === state.currentLang || (state.currentLang === 'pt' && g.language.name === 'pt-BR'));
    if (!genusObj && state.currentLang === 'pt') genusObj = speciesData.genera.find(g => g.language.name === 'es');
    if (!genusObj) genusObj = speciesData.genera.find(g => g.language.name === 'en');
    dom.pokemonCategory.innerHTML = genusObj ? genusObj.genus : 'Pokémon';

    let flavorObj = speciesData.flavor_text_entries.find(entry => entry.language.name === state.currentLang || (state.currentLang === 'pt' && entry.language.name === 'pt-BR'));
    if (!flavorObj && state.currentLang === 'pt') flavorObj = speciesData.flavor_text_entries.find(entry => entry.language.name === 'es');
    if (!flavorObj) flavorObj = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
    dom.pokemonDesc.innerHTML = flavorObj ? flavorObj.flavor_text.replace(/[\n\f]/g, ' ') : 'Descrição indisponível.';
};

export const renderPokemon = async (pokemon) => {
    dom.loadingOverlay.classList.add('active');
    state.isShiny = false;
    dom.btnShiny.style.transform = 'scale(1)';
    dom.btnShiny.style.background = 'var(--btn-bg)';

    const data = await fetchPokemonData(pokemon);
    const speciesData = await fetchSpeciesData(pokemon);

    if (data && speciesData) {
        state.currentPokemonData = data;
        state.searchPokemon = data.id;

        updateFavButton(data.id);
        updateBasicInfo(data);
        updateTypes(data.types);
        updateDescriptionAndCategory(speciesData);

        renderStats(data.stats);
        renderTypeMatchups(data.types);
        renderEvolutions(speciesData);

        playCry(data);
        dom.input.value = '';
    } else {
        state.currentPokemonData = null;
        resetUI();
        if (!navigator.onLine || !pokemon) {
            showToast('Erro de Conexão: Não foi possível obter os dados.');
        } else {
            showToast('Pokémon não encontrado.');
        }
    }
    
    dom.loadingOverlay.classList.remove('active');
};
