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
    btnFav: document.querySelector('#btn-fav'),
    btnShiny: document.querySelector('#btn-shiny'),
    btnVoice: document.querySelector('#btn-voice'),
    btnCry: document.querySelector('#btn-cry'),
    btnFav: document.querySelector('#btn-fav'),
    btnOpenGrid: document.querySelector('#btn-open-grid'),
    btnCloseGrid: document.querySelector('#btn-close-grid'),
    genSelect: document.querySelector('#generation-select'),
    themeToggle: document.querySelector('#theme-toggle'),
    langSelect: document.querySelector('#lang-select'),
    spriteSelect: document.querySelector('#sprite-select'),
    dynamicBg: document.querySelector('#dynamic-bg'),
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

let radarChart = null;

export const renderStats = (stats) => {
    try {
        const ctx = document.getElementById('stats-radar');
        if (!ctx) return;
        
        const statValues = stats.map(stat => stat.base_stat);
        let primaryColor = '#FF5959';
        if (state.currentPokemonData && state.currentPokemonData.types) {
            primaryColor = getComputedStyle(document.documentElement).getPropertyValue(`--type-${state.currentPokemonData.types[0].type.name}`).trim() || '#FF5959';
        }

        if (radarChart) {
            radarChart.data.datasets[0].data = statValues;
            radarChart.data.datasets[0].backgroundColor = `${primaryColor}88`; // 88 is hex for 53% opacity
            radarChart.data.datasets[0].borderColor = primaryColor;
            radarChart.update();
        } else {
            radarChart = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: ['HP', 'Ataque', 'Defesa', 'Velocidade', 'Defesa Esp.', 'Ataque Esp.'],
                    datasets: [{
                        label: 'Status Base',
                        data: [statValues[0], statValues[1], statValues[2], statValues[5], statValues[4], statValues[3]], // Reordered for better shape
                        backgroundColor: `${primaryColor}88`,
                        borderColor: primaryColor,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: primaryColor,
                        pointHoverBackgroundColor: primaryColor,
                        pointHoverBorderColor: '#fff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
                            grid: { color: 'rgba(255, 255, 255, 0.2)' },
                            pointLabels: { color: 'var(--text-color)', font: { size: 11, family: 'Inter', weight: 'bold' } },
                            ticks: { 
                                display: true, 
                                backdropColor: 'transparent', 
                                color: 'rgba(255, 255, 255, 0.6)', 
                                font: { size: 10, family: 'Inter' },
                                stepSize: 50,
                                min: 0, 
                                max: 255 
                            }
                        }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }
    } catch (error) {
        console.error('Erro ao renderizar gráfico:', error);
    }
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

const updateTypes = (types, speciesData) => {
    const primaryType = types[0].type.name;
    const secondaryType = types[1] ? types[1].type.name : primaryType;
    
    // Usa a cor baseada na espécie ou fallback para o tipo primário
    const speciesColor = speciesData && speciesData.color ? speciesData.color.name : primaryType;

    // Converte nome de cor nativo da PokeAPI para var se existir, se não usa a nativa
    const colorMap = {
        'red': '#FF5959', 'blue': '#58ABF6', 'yellow': '#FAE078',
        'green': '#A7DB8D', 'black': '#705746', 'brown': '#B1736C',
        'purple': '#9F5BBA', 'gray': '#B7B7CE', 'white': '#E2E2E2', 'pink': '#FA92B2'
    };
    
    const bgPrimary = colorMap[speciesColor] || `var(--type-${primaryType})`;
    const bgSecondary = `var(--type-${secondaryType})`;

    dom.dynamicBg.className = '';
    dom.dynamicBg.style.backgroundImage = `var(--pattern-dots), linear-gradient(135deg, ${bgPrimary} 0%, ${bgSecondary} 100%)`;

    dom.badge1.textContent = typeTranslations[primaryType] || primaryType;
    dom.badge1.className = `pokemon-type-badge badge1 badge-${primaryType}`;
    dom.badge1.style.display = 'block';

    if (types[1]) {
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
    const skeletonElements = [
        dom.pokemonName, dom.pokemonNumber, dom.pokemonHeight, 
        dom.pokemonWeight, dom.pokemonCategory, dom.pokemonAbility, 
        dom.pokemonDesc
    ];
    
    skeletonElements.forEach(el => {
        el.classList.add('skeleton');
        el.innerHTML = 'Carregando...';
    });
    
    dom.pokemonImage.classList.remove('pop-in');
    dom.pokemonImage.src = './images/miss.png';

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
        updateTypes(data.types, speciesData);
        updateDescriptionAndCategory(speciesData);

        renderStats(data.stats);
        renderTypeMatchups(data.types);
        renderEvolutions(speciesData);
        
        skeletonElements.forEach(el => el.classList.remove('skeleton'));
        
        // Ativa a animação de entrada do sprite
        void dom.pokemonImage.offsetWidth; // Trigger reflow
        dom.pokemonImage.classList.add('pop-in');

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
        skeletonElements.forEach(el => el.classList.remove('skeleton'));
    }
};
