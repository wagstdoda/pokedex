async function fetchValidNames () {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon/?limit=2000"); //entire pokemon list

    if(!response.ok){
        throw new Error("Fetch failed");
    }

    const data = await response.json();

    const nameArray = data.results.map(pokemon => pokemon.name); //take every pokemon name from the dataset and put into a new array

    return nameArray;
}

async function fetchPokemon(validNameArray) {
    const enteredInput = input.value.trim();

    if (!validNameArray.includes(enteredInput)) {
        input.classList.add("flash-red");
        errorMessage.classList.add("fade-out");
        setTimeout(() => {
            input.classList.remove("flash-red");
            errorMessage.classList.remove("fade-out");
        }, 2000); //2sec represents duration of flashing red animation

        return;
    }

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${enteredInput}`); //one specific pokemon

    if(!response.ok){
        throw new Error("Fetch failed");
    }

    const data = await response.json();
    return data;
}

let validNameArray;

const input = document.getElementById("pokemon-input");
const suggestionList = document.getElementById("suggestions");
const searchButton = document.getElementById("search-button");
const errorMessage = document.getElementById("error-message");
const pokemonName = document.querySelector("h1");
const photo = document.getElementById("photo");

input.addEventListener("blur", () => {
    setTimeout(() => {
        suggestionList.style.display = "none";
    }, 200); //200ms delay allows "click" event on li to fire before display disappears
});

input.addEventListener("focus", () => {
    suggestionList.style.display = "block";
});

fetchValidNames()
    .then(nameArray => {
        validNameArray = nameArray;
        input.addEventListener("input", () => {
            const value = input.value.toLowerCase();
            if(value === ""){
                suggestionList.innerHTML = "";
                return;
            }
            const matches = nameArray.filter(name => name.startsWith(value)).slice(0,5);
            suggestionList.innerHTML = "";
            matches.forEach(match => { //populate <ul> with <li>s that match the search bar
                const suggestion = document.createElement("li");
                suggestion.innerText = match;
                suggestion.addEventListener("click", () => {
                    input.value = match;
                    suggestionList.innerHTML = "";
                });
                suggestionList.appendChild(suggestion);
            });
        });
    })
    .catch(err => {
        console.warn(err);
    });

searchButton.addEventListener("click", () => {
    fetchPokemon(validNameArray)
        .then(pokemonData => { //display pokemon photo, audio, stats
            console.log(pokemonData);
            document.getElementById("type").innerText = "TYPE:";
            document.getElementById("height").innerText = "HEIGHT:";
            document.getElementById("weight").innerText = "WEIGHT:";
            document.getElementById("hp").innerText = "HP:";
            document.getElementById("attack").innerText = "ATTACK:";
            document.getElementById("defense").innerText = "DEFENSE:";
            pokemonName.innerText = pokemonData.name;
            photo.style.backgroundImage = `url(${pokemonData.sprites.front_default})`;
            const cry = new Audio(pokemonData.cries.latest);
            cry.play();
            document.getElementById("info").style.opacity = "1";
            document.getElementById("type").innerText += " " + pokemonData.types[0].type.name;
            document.getElementById("height").innerText += " " + pokemonData.height;
            document.getElementById("weight").innerText += " " + pokemonData.weight;
            document.getElementById("hp").innerText += " " + pokemonData.stats[0].base_stat;
            document.getElementById("attack").innerText += " " + pokemonData.stats[1].base_stat;
            document.getElementById("defense").innerText += " " + pokemonData.stats[2].base_stat;
        })
        .catch(err => {
            console.warn(err);
        });
});