import alias from "./data/alias.js";
import pokemon_en from "./data/pokemon_en.js";
import pokemon_ko from "./data/pokemon_ko.js";
import move_en from "./data/move_en.js";
import move_ko from "./data/move_ko.js";
import nature_en from "./data/nature_en.js";
import nature_ko from "./data/nature_ko.js";
import item_en from "./data/item_en.js";
import item_ko from "./data/item_ko.js";
import ability_en from "./data/ability_en.js";
import ability_ko from "./data/ability_ko.js";

import T from "./translate.js";

const A = {
    chkAlias: (token) => alias[token] || token,
    isPokemon: (p) => (pokemon_ko.indexOf(p) > -1 ? true : false),
    isMove: (p) => (move_ko.indexOf(p) > -1 ? true : false),
    isNature: (p) => (nature_ko.indexOf(p) > -1 ? true : false),
    isItem: (p) => (item_ko.indexOf(p) > -1 ? true : false),
    isAbility: (p) => (ability_ko.indexOf(p) > -1 ? true : false),

    analyze: (text) => {
        const result = {
            iserr : false,
            errorText : '',
            attackPokemon: { name: "", options: {} },
            defensePokemon: { name: "", options: {} },
            move: { name: "", options: {} },
            field: {},
        };
        
        text = text.replace(/->/g, 'vs').replace(/=>/g, 'vs');

        const pokemons = text.split('vs')

        result.attackPokemon = A.analyzePoke(pokemons[0].trim())
        if (pokemons.length > 1) result.defensePokemon = A.analyzePoke(pokemons[1].trim())
        else result.defensePokemon = null;

        if (!result.attackPokemon) {
            result.iserr = true;
            result.errorText += '공격 포켓몬 존재하지 않음<br>'
            return result;
        }
        if (!result.defensePokemon) {
            result.iserr = true;
            result.errorText += '수비 포켓몬 존재하지 않음<br>'
            return result;
        }

        result.move = result.attackPokemon.move;

        result.field = Object.assign(result.attackPokemon.field, result.defensePokemon.field);

        //result.iserr = true;

        /*

        result.attackPokemon.name = "Charizard";
        result.attackPokemon.options = {
            item: "Choice Specs",
            nature: "Timid",
            evs: { spa: 252 },
            boosts: { spa: 1 },
        };
        result.defensePokemon.name = "Chansey";
        result.defensePokemon.options = {
            item: "Eviolite",
            nature: "Calm",
            evs: { hp: 252, spd: 252 },
        };
        result.move.name = "Focus Blast"

        */
        return result;
    },

    analyzePoke : (text) => {
        const result = { name: "", options: {level:50, evs:{}}, move: {name : '', options : {}}, field:{} , needNature : false}
        if (!text) return null;
        const tokens = text.split(' ');
        tokens.forEach((token) => {
            token = A.chkAlias(token);
            if (A.isPokemon(token)) result.name = T.pokemon(token);
            if (A.isMove(token)) result.move.name = T.move(token);
            if (A.isItem(token)) result.options.item = T.item(token);
            if (A.isNature(token)) result.options.nature = T.nature(token);
            if (A.isAbility(token)) result.options.ability = T.ability(token);
            if (/특?[habcd체공방]\d{1,3}$/i.test(token)) result.options.evs = Object.assign(result.options.evs, A.evAnalyze(token))
            if (/특?[habcd체공방]\d{1,3}\+$/i.test(token)) {
                result.options.evs = Object.assign(result.options.evs, A.evAnalyze(token.replace('+','')))
                result.needNature = true;
            }
            if (token == "풀보정") {
                result.options.evs = {hp : 252, atk : 252, def : 252, spa : 252, spd : 252, spe : 252}
                result.needNature = true;
            }
            if (token.slice(-2) == '테라') result.options.teraType = T.type(token.slice(0, -2));
        })

        if (!result.name) return null;
        return result;
    },

    evAnalyze : (text) => {
        const ev = text.match(/\d{3}$/) ? text.match(/\d{3}$/)[0] : text.match(/\d{2}$/) ? text.match(/\d{2}$/)[0] : text.match(/\d{1}$/)[0]
        const evnum = Number(ev)
        if (/^[Hh체]/i.test(text)) return {hp:evnum}
        if (/^[Aa공]/i.test(text)) return {atk:evnum}
        if (/^[Bb방]/i.test(text)) return {def:evnum}
        if (/^[Cc]/i.test(text)) return {spa:evnum}
        if (/^[Dd]/i.test(text)) return {spd:evnum}
        if (/^[Ss]/i.test(text)) return {spe:evnum}
        return {};
    },
};

window.A = A;

export default A;
