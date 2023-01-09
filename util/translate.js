import pokemon_en from './data/pokemon_en.js'
import pokemon_ko from './data/pokemon_ko.js'
import move_en from './data/move_en.js'
import move_ko from './data/move_ko.js'
import nature_en from './data/nature_en.js'
import nature_ko from './data/nature_ko.js'
import item_en from './data/item_en.js'
import item_ko from './data/item_ko.js'
import ability_en from './data/ability_en.js'
import ability_ko from './data/ability_ko.js'

const type_en = ['Normal','Fighting','Flying','Poison' , 'Ground' , 'Rock' , 'Bug' , 'Ghost' , 'Steel' ,'Fire' , 'Water' , 'Grass', 'Electric' , 'Psychic' , 'Ice' , 'Dragon' ,'Dark' , 'Fairy'];
const type_ko = ['노말', '격투', '비행', '독', '땅', '바위', '벌레', '고스트', '강철', '불꽃', '물','풀', '전기', '에스퍼', '얼음', '드래곤', '악', '페어리']

const T = {
    pokemon : name => (
        pokemon_en[pokemon_ko.indexOf(name)] || pokemon_ko[pokemon_en.indexOf(name)] || ""
    ),
    move : name => {
        return move_en[move_ko.indexOf(name)] || move_ko[move_en.indexOf(name)] || ""
    },
    nature : name => {
        return nature_en[nature_ko.indexOf(name)] || nature_ko[nature_en.indexOf(name)] || ""
    },
    item : name => {
        return item_en[item_ko.indexOf(name)] || item_ko[item_en.indexOf(name)] || ""
    },
    ability : name => {
        return ability_en[ability_ko.indexOf(name)] || ability_ko[ability_en.indexOf(name)] || ""
    },
    type : name => {
        return type_en[type_ko.indexOf(name)] || type_ko[type_en.indexOf(name)] || ""
    },
    types_en : type_en,
    types_ko : type_ko
};


window.T = T;

export default T;