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

const terrain_en = ['Electric', 'Psychic', 'Grassy', 'Misty']
const terrain_ko = ['일렉트릭', '사이코', '그래스', '미스트']

const weather_en = ['Sand', 'Sun', 'Rain', 'Hail', 'Snow', 'Harsh Sunshine', 'Heavy Rain', 'Strong Winds']
const weather_ko = ['모래바람', '쾌청', '비', '싸라기눈', '눈', '큰가뭄', '폭우', '난기류']

const status_en = ['slp' , 'psn' , 'brn' , 'frz' , 'par' , 'tox'];
const status_ko = ['잠듦', '독', '화상', '얼음', '마비', '맹독']

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
    terrain : name => {
        return terrain_en[terrain_ko.indexOf(name)] || terrain_ko[terrain_en.indexOf(name)] || ""
    },
    weather : name => {
        return weather_en[weather_ko.indexOf(name)] || weather_ko[weather_en.indexOf(name)] || ""
    },
    status : name => {
        return status_en[status_ko.indexOf(name)] || status_ko[status_en.indexOf(name)] || ""
    },
    ev : evText => {
        const evTrans = {
            Atk : 'a',
            Def : 'b',
            SpD : 'd',
            SpA : 'c',
            HP : 'h',
            Spe : 's'
        }
        for (var et in evTrans) {
            if (new RegExp(et).test(evText)) {
                if (/\d+\+?/g.exec(evText) == '0') return '';
                return evTrans[et] + /\d+\+?/g.exec(evText);
            }
        }
        return "";
    },
    types_en : type_en,
    types_ko : type_ko
};


window.T = T;

export default T;