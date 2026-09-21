import { state, saveLang, saveSpriteMode, toggleFavorite } from './state.js';
import { generationsConfig } from './config.js';
import { allPokemonNames, loadAllPokemon, fetchPokemonData } from './api.js';
import { getPokemonSprite, playCry, debounce } from './utils.js';
import { dom, initTheme, renderPokemon, updateFavButton } from './ui.js';

if (dom.langSelect) dom.langSelect.value = state.currentLang;
if (dom.spriteSelect) dom.spriteSelect.value = state.spriteMode;

dom.langSelect.addEventListener('change', (e) => {
    saveLang(e.target.value);
    if(state.currentPokemonData) renderPokemon(state.searchPokemon);
});
dom.spriteSelect.addEventListener('change', (e) => {
    saveSpriteMode(e.target.value);
    if(state.currentPokemonData) renderPokemon(state.searchPokemon);
});

dom.themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('pokedex-theme', newTheme);
    dom.themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
});

dom.btnCry.addEventListener('click', () => {
    if (state.currentPokemonData) playCry(state.currentPokemonData);
});

dom.btnShiny.addEventListener('click', () => {
    state.isShiny = !state.isShiny;
    if (state.currentPokemonData) {
        dom.pokemonImage.src = getPokemonSprite(state.currentPokemonData, state.isShiny);
        dom.btnShiny.style.transform = state.isShiny ? 'scale(1.2)' : 'scale(1)';
        dom.btnShiny.style.background = state.isShiny ? 'var(--type-electric)' : 'var(--btn-bg)';
        
        if (state.isShiny) {
            const container = dom.pokemonImage.parentElement;
            for (let i = 0; i < 7; i++) {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                sparkle.style.left = `${Math.random() * 80 + 10}%`;
                sparkle.style.top = `${Math.random() * 80 + 10}%`;
                sparkle.style.animationDelay = `${Math.random() * 0.2}s`;
                container.appendChild(sparkle);
                setTimeout(() => sparkle.remove(), 1200);
            }
        }
    }
});

dom.btnFav.addEventListener('click', () => {
    if (!state.currentPokemonData) return;
    const id = state.currentPokemonData.id;
    toggleFavorite(id);
    updateFavButton(id);
});

dom.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        dom.tabBtns.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        dom.tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        document.getElementById(btn.dataset.target).classList.add('active');
    });
});

let observer;
const initObserver = () => {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const id = card.dataset.id;
                fetchPokemonData(id).then(data => {
                    if(data) {
                        card.querySelector('img').src = data.sprites.front_default || './images/miss.png';
                        card.querySelector('.grid-card-name').textContent = data.name;
                    }
                });
                observer.unobserve(card);
            }
        });
    }, { root: dom.gridContainer, rootMargin: '100px' });
};

dom.btnOpenGrid.addEventListener('click', () => {
    dom.gridModal.showModal();
    dom.gridGenNumber.textContent = state.currentGenId;
    dom.gridContainer.innerHTML = '';
    
    const config = generationsConfig[state.currentGenId];
    const startId = config.offset + 1;
    const endId = config.limit;
    
    initObserver();
    
    for (let i = startId; i <= endId; i++) {
        const card = document.createElement('div');
        card.className = 'grid-card';
        card.dataset.id = i;
        card.innerHTML = `
            <span class="grid-card-id">#${String(i).padStart(3, '0')}</span>
            <img src="./images/miss.png" alt="carregando">
            <span class="grid-card-name">...</span>
        `;
        card.addEventListener('click', () => {
            dom.gridModal.close();
            renderPokemon(i);
        });
        dom.gridContainer.appendChild(card);
        observer.observe(card);
    }
});

dom.btnCloseGrid.addEventListener('click', () => {
    dom.gridModal.close();
});

dom.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const val = dom.input.value.trim().toLowerCase();
    if (val) {
        dom.autocompleteList.classList.add('hidden');
        if (!isNaN(val)) {
            renderPokemon(val);
            return;
        }
        
        if (allPokemonNames.length > 0) {
            const match = allPokemonNames.find(name => name.startsWith(val)) || 
                          allPokemonNames.find(name => name.includes(val));
            if (match) {
                renderPokemon(match);
                return;
            }
        }
        
        renderPokemon(val);
    }
});

let currentFocus = -1;

const onInput = debounce(() => {
    const val = dom.input.value.trim().toLowerCase();
    dom.autocompleteList.innerHTML = '';
    currentFocus = -1;
    
    if (!val) {
        dom.autocompleteList.classList.add('hidden');
        return;
    }
    
    if (allPokemonNames.length > 0) {
        const startsWith = allPokemonNames.filter(name => name.startsWith(val));
        const includes = allPokemonNames.filter(name => name.includes(val) && !name.startsWith(val));
        const matches = [...startsWith, ...includes].slice(0, 10);
        
        if (matches.length > 0) {
            matches.forEach(match => {
                const li = document.createElement('li');
                li.className = 'autocomplete-item';
                li.textContent = match;
                li.addEventListener('click', () => {
                    dom.input.value = match;
                    dom.autocompleteList.classList.add('hidden');
                    renderPokemon(match);
                });
                dom.autocompleteList.appendChild(li);
            });
            dom.autocompleteList.classList.remove('hidden');
        } else {
            dom.autocompleteList.classList.add('hidden');
        }
    }
}, 200);

dom.input.addEventListener('input', onInput);

dom.input.addEventListener('keydown', (e) => {
    let x = dom.autocompleteList.getElementsByTagName('li');
    if (e.key === 'ArrowDown') {
        currentFocus++;
        addActive(x);
    } else if (e.key === 'ArrowUp') {
        currentFocus--;
        addActive(x);
    } else if (e.key === 'Enter') {
        if (currentFocus > -1) {
            e.preventDefault();
            if (x && x[currentFocus]) x[currentFocus].click();
        }
    }
});

function addActive(x) {
    if (!x || x.length === 0) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    x[currentFocus].classList.add('autocomplete-active');
}

function removeActive(x) {
    for (let i = 0; i < x.length; i++) {
        x[i].classList.remove('autocomplete-active');
    }
}

document.addEventListener('click', (event) => {
    if (!event.target.closest('.search-input-wrapper')) {
        dom.autocompleteList.classList.add('hidden');
    }
});

dom.btnPrev.addEventListener('click', () => {
    if (state.searchPokemon > 1) renderPokemon(state.searchPokemon - 1);
});
dom.btnNext.addEventListener('click', () => {
    const currentLimit = generationsConfig[state.currentGenId].limit;
    if (state.searchPokemon < currentLimit) renderPokemon(state.searchPokemon + 1);
});
dom.btnRandom.addEventListener('click', () => {
    const currentLimit = generationsConfig[state.currentGenId].limit;
    const randomId = Math.floor(Math.random() * currentLimit) + 1;
    renderPokemon(randomId);
});
dom.genSelect.addEventListener('change', (event) => {
    state.currentGenId = parseInt(event.target.value);
    const newLimit = generationsConfig[state.currentGenId].limit;
    if (state.searchPokemon > newLimit) state.searchPokemon = 1;
    renderPokemon(state.searchPokemon);
});

document.addEventListener('keydown', (event) => {
    if (document.activeElement === dom.input) return;
    if (event.key === 'ArrowLeft') dom.btnPrev.click();
    if (event.key === 'ArrowRight') dom.btnNext.click();
});

// Swipe Gestures
let touchStartX = 0;
let touchEndX = 0;
const pokemonCard = document.querySelector('.pokemon-card');

if (pokemonCard) {
    pokemonCard.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    pokemonCard.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
}

function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
        // Swipe Left -> Next
        dom.btnNext.click();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
        // Swipe Right -> Prev
        dom.btnPrev.click();
    }
}

// Boot
initTheme();
loadAllPokemon();
renderPokemon(state.searchPokemon);
