
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
let searchPokemon = 1;

const fetchPokemon = async (pokemon) => {
    const APIResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
    
    if (APIResponse.status === 200){
        const data = await APIResponse.json();
        return data;  
    }
}

const fetchPokemon2 = async (pokemon) => {
    const APIResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}`);
    
    if (APIResponse.status === 200){
        const data2 = await APIResponse.json();
        return data2;  
    }
}

const renderPokemon2 = async (pokemon) => {
    pokemonName.innerHTML = 'Procurando...';
    const data2 = await fetchPokemon2(pokemon);
if(data2){
 
    pokemonDesc.innerHTML = data2['flavor_text_entries']['6']['flavor_text'];
    input.value = '';
    searchPokemon = data2['pokedex_numbers']['0']['entry_number']
} 

}



const renderPokemon = async (pokemon) => {
    pokemonName.innerHTML = 'Procurando...';
    const data = await fetchPokemon(pokemon);
    let teste;
if(data){
    pokemonName.innerHTML = data.name;
    pokemonNumber.innerHTML = data.id;
    pokemonImage.src = data['sprites']['versions']['generation-vi']['omegaruby-alphasapphire']['front_default'];
    pokemonType1.innerHTML = data['types']['0']['type']['name'].toUpperCase();
    teste = data['types']['1'];
        if (typeof(teste) === "object"){
        pokemonType2.innerHTML = data['types']['1']['type']['name'].toUpperCase();
    }else{
        pokemonType2.innerHTML ='';
    }
    
    input.value = '';
    searchPokemon = data.id;

} else {
    pokemonName.innerHTML = 'Prof. Carvalho: WTF?'
    pokemonNumber.innerHTML = '';
    pokemonImage.src ='./images/miss.png';
    pokemonDesc.innerHTML = '';
    pokemonType1.innerHTML ='???';
    pokemonType2.innerHTML ='';
}

}

form.addEventListener('submit', (event) =>{
    event.preventDefault();
    renderPokemon(input.value.toLowerCase());
});


buttonPrev.addEventListener('click', () =>{
    if (searchPokemon >1){
        searchPokemon--;
    renderPokemon(searchPokemon);
    renderPokemon2(searchPokemon);
    }
});


buttonNext.addEventListener('click', () =>{
    searchPokemon++;
    renderPokemon(searchPokemon);
    renderPokemon2(searchPokemon);
});
renderPokemon(searchPokemon);
renderPokemon2(searchPokemon);

