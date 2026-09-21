import { generationsConfig } from './config.js';
import { state } from './state.js';

export const playCry = (data) => {
    if (!data) return;
    const audioUrl = (data.cries && data.cries.latest) ? data.cries.latest : `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${data.id}.ogg`;
    const audio = new Audio(audioUrl);
    audio.play().catch(() => {
        if (data.cries && data.cries.legacy) {
            const legacyAudio = new Audio(data.cries.legacy);
            legacyAudio.play().catch(e => console.warn(`Cry indisponível: ${data.id}`));
        } else {
            console.warn(`Cry indisponível: ${data.id}`);
        }
    });
};

export const getPokemonSprite = (data, shiny) => {
    let spriteUrl = null;
    if (state.spriteMode === '3d') {
        spriteUrl = shiny ? data.sprites.other.showdown.front_shiny : data.sprites.other.showdown.front_default;
    } 
    
    // Se for modo clássico ou o 3D não existir, usa a imagem PNG padrão (sempre transparente)
    if (!spriteUrl) {
        spriteUrl = shiny ? data.sprites.front_shiny : data.sprites.front_default;
    }

    // Fallback final para official-artwork caso não exista sprite clássico
    if (!spriteUrl) {
        spriteUrl = shiny ? 
            (data.sprites.other['official-artwork'].front_shiny || data.sprites.front_shiny) :
            (data.sprites.other['official-artwork'].front_default || data.sprites.front_default);
    }
    return spriteUrl;
};

export const parseEvolutionLinks = (node) => {
    let links = [];
    if (!node || !node.evolves_to || node.evolves_to.length === 0) return links;

    const fromParts = node.species.url.split('/');
    const fromId = parseInt(fromParts[fromParts.length - 2]);
    const fromName = node.species.name;

    node.evolves_to.forEach(evo => {
        const toParts = evo.species.url.split('/');
        const toId = parseInt(toParts[toParts.length - 2]);
        const toName = evo.species.name;
        
        let methodDesc = "Level up";
        if (evo.evolution_details && evo.evolution_details.length > 0) {
            const details = evo.evolution_details[0];
            if (details.trigger.name === 'use-item' && details.item) {
                methodDesc = `Item: ${details.item.name}`;
            } else if (details.trigger.name === 'trade') {
                methodDesc = `Trade`;
                if (details.held_item) methodDesc += ` w/ ${details.held_item.name}`;
            } else if (details.min_level) {
                methodDesc = `Level ${details.min_level}`;
            } else if (details.min_happiness) {
                methodDesc = `Happiness`;
            } else if (details.location) {
                methodDesc = `Location: ${details.location.name}`;
            } else {
                methodDesc = details.trigger.name.replace('-', ' ');
            }
        }

        links.push({
            fromId, fromName,
            toId, toName,
            method: methodDesc
        });
        
        links = links.concat(parseEvolutionLinks(evo));
    });

    return links;
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
