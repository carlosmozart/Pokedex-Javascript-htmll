
const pokemonName = document.querySelector('.pokemon__name');
const pokemonNumber = document.querySelector('.pokemon__number');
const pokemonImage = document.querySelector('.pokemon__image');
const pokemonType1 = document.querySelector('.pokemon__type1');
const pokemonType2 = document.querySelector('.pokemon__type2');
const pokemonDesc = document.querySelector('.pokemon__desc');
const form = document.querySelector('.form');
const input = document.querySelector('.input__search');
const buttonPrev = document.querySelector('.btn-prev');
const buttonNext = document.querySelector('.btn-next');
const audio = new Audio('./sound/pokedex_sound.mp3');
const bulba = new Audio(`./sound/cries/1.mp3`);

//const cry = new Audio('./sound/pokedex_sound.mp3');
//const cry = new pkmC(`./sound/cries/${cryId.mp3}`);
let a = 1;

let type1;
let type2;
let slot;

let searchPokemon = 1;
const generations = [
    {
        ids: [1, 151],
        generation: 'generation-i',
        sprites: {
            game: 'red-blue',
            type: 'front_transparent',
            cry: `${a}.mp3`,
        }
    },
    {
        ids: [152, 251],
        generation: 'generation-ii',
        sprites: {
            game: 'crystal',
            type: 'front_transparent'
        }
    },
    {
        ids: [252, 386],
        generation: 'generation-iii',
        sprites: {
            game: 'emerald',
            type: 'front_default'
        }
    },
    {
        ids: [387, 493],
        generation: 'generation-iv',
        sprites: {
            game: 'heartgold-soulsilver',
            type: 'front_default'
        }
    },
    {
        ids: [494, 648],
        generation: 'generation-v',
        sprites: {
            game: 'black-white',
            type: 'front_default'
        }
    },
    {
        ids: [649, 721],
        generation: 'generation-vi',
        sprites: {
            game: 'omegaruby-alphasapphire',
            type: 'front_default'
        }
    },
    {
        ids: [722, 809],
        generation: 'generation-vii',
        sprites: {
            game: 'ultra-sun-ultra-moon',
            type: 'front_default'
        }
    },
    {
        ids: [810, 905],
        generation: 'generation-viii',
        sprites: {
            game: 'icons',
            type: 'front_default'
        }
    }

]


function pokemonCry(){
    
    bulba.play();
}

const fetchPokemon = async (pokemon) => {
    const APIResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);

    if (APIResponse.status === 200) {
        const data = await APIResponse.json();
        return data;
    }
}

const fetchPokemon2 = async (pokemon) => {
    const APIResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}`);

    if (APIResponse.status === 200) {
        const data2 = await APIResponse.json();
        return data2;
    }
}

const renderPokemon2 = async (pokemon) => {
    const data2 = await fetchPokemon2(pokemon);
    let options = getGeneration(data2.id);
    if (options.generation == 'generation-i') {
        pokemonDesc.innerHTML = data2['flavor_text_entries']['6']['flavor_text'];
        input.value = '';
        searchPokemon = data2['pokedex_numbers']['0']['entry_number']
    }

    if (options.generation == 'generation-ii') {
        pokemonDesc.innerHTML = data2['flavor_text_entries']['6']['flavor_text'];
        input.value = '';
        searchPokemon = data2['pokedex_numbers']['0']['entry_number']
    }
    if (options.generation == 'generation-iii') {
        pokemonDesc.innerHTML = data2['flavor_text_entries']['6']['flavor_text'];
        input.value = '';
        searchPokemon = data2['pokedex_numbers']['0']['entry_number']
    }

    if (options.generation == 'generation-iv') {
        pokemonDesc.innerHTML = data2['flavor_text_entries']['6']['flavor_text'];
        input.value = '';
        searchPokemon = data2['pokedex_numbers']['0']['entry_number']
    }

    if (options.generation == 'generation-v') {
        pokemonDesc.innerHTML = data2['flavor_text_entries']['5']['flavor_text'];
        input.value = '';
        searchPokemon = data2['pokedex_numbers']['0']['entry_number']
    }

    if (options.generation == 'generation-vi') {
        pokemonDesc.innerHTML = data2['flavor_text_entries']['6']['flavor_text'];
        input.value = '';
        searchPokemon = data2['pokedex_numbers']['0']['entry_number']
    }
    if (options.generation == 'generation-vii') {
        pokemonDesc.innerHTML = data2['flavor_text_entries']['7']['flavor_text'];
        input.value = '';
        searchPokemon = data2['pokedex_numbers']['0']['entry_number']
    }
    if (options.generation == 'generation-viii') {
        pokemonDesc.innerHTML = data2['flavor_text_entries']['7']['flavor_text'];
        input.value = '';
        searchPokemon = data2['pokedex_numbers']['0']['entry_number']
    }






    /* if (data2) {
 
         pokemonDesc.innerHTML = data2['flavor_text_entries']['7']['flavor_text'];
         input.value = '';
         searchPokemon = data2['pokedex_numbers']['0']['entry_number']
     }*/

}

function getGeneration(id) {
    for (let index = 0; index < generations.length; index++) {

        if (id >= generations[index].ids[0] && id <= generations[index].ids[1]) {
            return generations[index];
        }
    }

}

const renderPokemon = async (pokemon) => {
    pokemonName.innerHTML = 'Procurando...';
    const data = await fetchPokemon(pokemon);
    let teste;
    let options = getGeneration(data.id);
    pokemonName.innerHTML = data.name;
    pokemonNumber.innerHTML = data.id;
    pokemonImage.src = data['sprites']['versions'][options.generation][options.sprites.game][options.sprites.type];
    type1 = data['types']['0']['type']['name'];
    if (data['types']['1'] != undefined) {
        type2 = data['types']['1']['type']['name'];
    }
    a = data.id;
    const audio2 = new Audio(`./sound/cries/${a}.mp3`);
    audio2.play();

    pokemon_Type1();
    pokemon_Type2();
    teste = data['types']['1'];
    if (typeof (teste) !== "object") {
        pokemonType2.src = './images/types/none.png';
    }

    input.value = '';
    searchPokemon = data.id;
    renderPokemon2(searchPokemon);





    /*else {
       pokemonName.innerHTML = 'Prof. Carvalho: WTF?'
       pokemonNumber.innerHTML = '';
       pokemonImage.src ='./images/miss.png';
       pokemonDesc.innerHTML = '';
       pokemonType1.innerHTML ='???';
       pokemonType2.innerHTML ='';
   }*/

}

function pokemon_Type1() {
    if (type1 === 'grass') {
        pokemonType1.src = './images/types/grass.png';
    }

    if (type1 === 'fire') {
        pokemonType1.src = './images/types/fire.png';
    }

    if (type1 === 'bug') {
        pokemonType1.src = './images/types/bug.png';
    }

    if (type1 === 'dark') {
        pokemonType1.src = './images/types/dark.png';
    }

    if (type1 === 'dragon') {
        pokemonType1.src = './images/types/dragon.png';
    }

    if (type1 === 'electric') {
        pokemonType1.src = './images/types/electric.png';
    }

    if (type1 === 'fairy') {
        pokemonType1.src = './images/types/fairy.png';
    }

    if (type1 === 'fighting') {
        pokemonType1.src = './images/types/fighting.png';
    }

    if (type1 === 'flying') {
        pokemonType1.src = './images/types/flying.png';
    }

    if (type1 === 'ghost') {
        pokemonType1.src = './images/types/ghost.png';
    }

    if (type1 === 'ground') {
        pokemonType1.src = './images/types/ground.png';
    }

    if (type1 === 'ice') {
        pokemonType1.src = './images/types/ice.png';
    }

    if (type1 === 'normal') {
        pokemonType1.src = './images/types/normal.png';
    }

    if (type1 === 'poison') {
        pokemonType1.src = './images/types/poison.png';
    }

    if (type1 === 'psychic') {
        pokemonType1.src = './images/types/psychic.png';
    }

    if (type1 === 'rock') {
        pokemonType1.src = './images/types/rock.png';
    }

    if (type1 === 'steel') {
        pokemonType1.src = './images/types/steel.png';
    }

    if (type1 === 'water') {
        pokemonType1.src = './images/types/water.png';
    }
}

function pokemon_Type2() {
    if (type2 === 'grass') {
        pokemonType2.src = './images/types/grass.png';
    }

    if (type2 === 'fire') {
        pokemonType2.src = './images/types/fire.png';
    }

    if (type2 === 'bug') {
        pokemonType2.src = './images/types/bug.png';
    }

    if (type2 === 'dark') {
        pokemonType2.src = './images/types/dark.png';
    }

    if (type2 === 'dragon') {
        pokemonType2.src = './images/types/dragon.png';
    }

    if (type2 === 'electric') {
        pokemonType2.src = './images/types/electric.png';
    }

    if (type2 === 'fairy') {
        pokemonType2.src = './images/types/fairy.png';
    }

    if (type2 === 'fighting') {
        pokemonType2.src = './images/types/fighting.png';
    }

    if (type2 === 'flying') {
        pokemonType2.src = './images/types/flying.png';
    }

    if (type2 === 'ghost') {
        pokemonType2.src = './images/types/ghost.png';
    }

    if (type2 === 'ground') {
        pokemonType2.src = './images/types/ground.png';
    }

    if (type2 === 'ice') {
        pokemonType2.src = './images/types/ice.png';
    }

    if (type2 === 'normal') {
        pokemonType2.src = './images/types/normal.png';
    }

    if (type2 === 'poison') {
        pokemonType2.src = './images/types/poison.png';
    }

    if (type2 === 'psychic') {
        pokemonType2.src = './images/types/psychic.png';
    }

    if (type2 === 'rock') {
        pokemonType2.src = './images/types/rock.png';
    }

    if (type2 === 'steel') {
        pokemonType2.src = './images/types/steel.png';
    }

    if (type2 === 'water') {
        pokemonType2.src = './images/types/water.png';
    }
}



form.addEventListener('submit', (event) => {
    event.preventDefault();
    renderPokemon(input.value.toLowerCase());
});


buttonPrev.addEventListener('click', () => {
    if (searchPokemon > 1) {
        searchPokemon--;
        audio.play();
        renderPokemon(searchPokemon);
        renderPokemon2(searchPokemon);
    }
});


buttonNext.addEventListener('click', () => {
    searchPokemon++;
    audio.play();
    renderPokemon(searchPokemon);
    renderPokemon2(searchPokemon);
});
renderPokemon(searchPokemon);
renderPokemon2(searchPokemon);
pokemon_Type1(type1);
pokemon_Type2(type2);
pokemonCry();

