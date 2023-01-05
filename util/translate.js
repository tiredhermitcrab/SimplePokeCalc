import pokemon_en from './data/pokemon_en.js'
import pokemon_ko from './data/pokemon_ko.js'
import move_en from './data/move_en.js'
import move_ko from './data/move_ko.js'
import nature_en from './data/nature_en.js'
import nature_ko from './data/nature_ko.js'
import item_en from './data/item_en.js'
import item_ko from './data/item_ko.js'

const T = {
    pokemon : name => (
        pokemon_en[pokemon_ko.indexOf(name)] || pokemon_ko[pokemon_en.indexOf(name)] || "Gengar"
    ),
    move : name => {
        return move_en[move_ko.indexOf(name)] || move_ko[move_en.indexOf(name)] || "Dark Pulse"
    },
    nature : name => {
        return nature_en[nature_ko.indexOf(name)] || nature_ko[nature_en.indexOf(name)] || "Hardy"
    },
    item : name => {
        return item_en[item_ko.indexOf(name)] || item_ko[item_en.indexOf(name)] || ""
    }
};


window.T = T;

export default T;