import alias from "./data/alias.js";
import pokemon_ko from "./data/pokemon_ko.js";
import move_ko from "./data/move_ko.js";
import nature_ko from "./data/nature_ko.js";
import item_ko from "./data/item_ko.js";
import ability_ko from "./data/ability_ko.js";

import T from "./translate.js";
const merge = (target, source) => {
    for (let key of Object.keys(source)) {
      if (source[key] instanceof Object) Object.assign(source[key], merge(target[key], source[key]))
    }
    Object.assign(target || {}, source)
    return target
  }

const A = {
    chkAlias: (token) => alias[token] || token,
    isPokemon: (p) => (pokemon_ko.indexOf(p) > -1 ? true : false),
    isMove: (p) => (move_ko.indexOf(p) > -1 ? true : false),
    isNature: (p) => (nature_ko.indexOf(p) > -1 ? true : false),
    isItem: (p) => (item_ko.indexOf(p) > -1 ? true : false),
    isAbility: (p) => (ability_ko.indexOf(p) > -1 ? true : false),
    isWeather: (p) => (T.weather(p) ? true : false),
    isStatus : (p) => (T.status(p) ? true : false),

    analyze: (text) => {
        const result = {
            mode: '',
            iserr: false,
            errorText: "",
            attacker: { name: "", options: {} },
            defender: { name: "", options: {} },
            move: { name: "", options: {} },
            field: {},
        };

        text = text.replace(/->/g, "vs").replace(/=>/g, "vs").replace(/>/g, "vs");

        const pokemons = text.split("vs");

        result.attacker = A.analyzePoke(pokemons[0].trim());

        if (pokemons.length > 1)
            result.defender = A.analyzePoke(pokemons[1].trim(), false, result.attacker);
        else result.defender = null;

        if (result.attacker && result.attacker.field) result.field = result.attacker.field
        if (result.defender && result.defender.field) result.field = merge(result.field, result.defender.field)

        if (result.attacker && !result.defender && result.attacker.move) {
            result.mode = 'firepower';
            result.move = result.attacker.move
            A.calcFirepower(result);
            return result;
        }
        if (result.defender && !result.attacker) {
            result.mode = 'durability';
            A.calcDurability(result);
            return result;
        }
        if (!result.attacker) {
            result.iserr = true;
            result.errorText += "?????? ????????? ???????????? ??????";
            return result;
        }
        if (!result.defender) {
            result.iserr = true;
            result.errorText += "?????? ????????? ???????????? ??????";
            return result;
        }

        result.mode = 'vs'
        result.move = result.attacker.move;
        result.crit = result.attacker.crit || result.defender.crit;



        return result;
    },

    analyzePoke: (text, isAttacker = true, attacker = null) => {
        const result = {
            name: "",
            options: { 
                level: 50, 
                evs: {}, 
                ability : T.ability('????????????'), 
                item : T.item('????????????') 
            },
            move: { name: "", options: {}, bp:0 },
            field: {attackerSide: {}, defenderSide: {}},
            needNature: null,
            crit: false,
            boost : '',
            itemName : false,
        };
        if (!text) return null;
        const tokens = text.split(" ").map(t => A.chkAlias(t)).join(' ').split(' ');
        tokens.forEach((token) => {
            if (!token) return;
            if (A.fieldAnalyze(token, result.field, isAttacker)) return;
            if (A.isPokemon(token)) result.name = T.pokemon(token);
            if (A.isItem(token)) result.options.item = T.item(token);
            if (A.isNature(token)) result.options.nature = T.nature(token);
            if (A.isStatus(token)) result.options.status = T.status(token);
            if (A.isAbility(token)) {
                result.options.ability = T.ability(token);
                result.options.abilityOn = true;
            }
            if (/????[habcds????????????]\d{1,3}$/i.test(token))
                result.options.evs = Object.assign(
                    result.options.evs,
                    A.evAnalyze(token)
                );
            if (/????[habcds????????????]\d{1,3}\+$/i.test(token)) {
                result.options.evs = Object.assign(
                    result.options.evs,
                    A.evAnalyze(token.replace("+", ""))
                );
                result.needNature = A.evAnalyze(token.replace("+", ""));
            }
            if (token == "?????????") {
                result.options.evs = {
                    hp: 252,
                    atk: 252,
                    def: 252,
                    spa: 252,
                    spd: 252,
                };
                result.needNature = result.options.evs;
            }
            if (/^[2345]???$/.test(token)) result.move.options.hits = Number(token.slice(0, 1))
            if (/^[\+\-]\d$/.test(token)) result.boost = token;
            if (token.slice(-2) == "??????")
                result.options.teraType = T.type(token.slice(0, -2));
            if (/^\d??????$/.test(token)) result.options.alliesFainted = Number(/\d/.exec(token));
            if (token == "??????") result.crit = true;
            if (/^[123456]????????????$/.test(token)) {
                if (isAttacker) result.boost = '+' + (2 * Number(token.slice(0,1)));
                else result.boost = "-" + token.slice(0,1);
            }
            if (token == '????????????' && !isAttacker) result.options.isSaltCure = true;
            if (token == '??????') result.options.item = '';
            
            if (A.isMove(token)) result.move.name = T.move(token);
        });

        if (!result.name) return null;
        var move = {};
        const gen = Generations.get(9);

        if (attacker && attacker.move) result.move = attacker.move;
        if (result.move.name) {
            move = new Move(gen, result.move.name, result.move.options)
        }

        if (move && move.hits == 3 && !attacker && !result.move.options.hits && T.item(result.options.item) == '??????????????????') {
            result.move.options.hits = 4;
            result.itemName = true;
        }

        if (result.needNature && move && move.name != 'Tera Blast') {
            if (move.category == 'Physical') {
                if (isAttacker) result.options.nature = T.nature('??????')
                else if (result.needNature.def) result.options.nature = T.nature('???????????????')
                if (isAttacker && move.name == T.move('???????????????')) result.options.nature = T.nature('???????????????')
            } else {
                if (isAttacker) result.options.nature = T.nature('??????')
                else if (result.needNature.spd) result.options.nature = T.nature('??????')
                else if (result.needNature.def) result.options.nature = T.nature('???????????????')
            }
        } 
        if (!attacker) return result;
        const rPokemon = isAttacker ? new Pokemon(gen, result.name, result.options) : new Pokemon(gen, attacker.name, attacker.options)

        if (result.move.name == "Tera Blast" && result.needNature) {
            if (rPokemon.stats.atk > rPokemon.stats.spa * 1.1) {
                if (isAttacker) result.options.nature = T.nature('??????')
                else if (result.needNature.def) result.options.nature = T.nature('???????????????')
            } else if (rPokemon.stats.atk * 1.1 < rPokemon.stats.spa) {
                if (isAttacker) result.options.nature = T.nature('??????')
                else if (result.needNature.spd) result.options.nature = T.nature('??????')
            } else if (rPokemon.stats.atk > rPokemon.stats.spa) {
                if (isAttacker) result.options.nature = T.nature('??????')
                else if (result.needNature.def) result.options.nature = T.nature('???????????????')
            } else {
                if (isAttacker) result.options.nature = T.nature('??????')
                else if (result.needNature.spd) result.options.nature = T.nature('??????')
            }
        }


        return result;
    },

    evAnalyze: (text) => {
        const ev = text.match(/\d{3}$/)
            ? text.match(/\d{3}$/)[0]
            : text.match(/\d{2}$/)
            ? text.match(/\d{2}$/)[0]
            : text.match(/\d{1}$/)[0];
        const evnum = Number(ev);
        if (/^[Hh???]/i.test(text)) return { hp: evnum };
        if (/^[Aa???]/i.test(text)) return { atk: evnum };
        if (/^[Bb???]/i.test(text)) return { def: evnum };
        if (/^[Cc]/i.test(text)) return { spa: evnum };
        if (/^[Dd]/i.test(text)) return { spd: evnum };
        if (/^??????/i.test(text)) return { spa: evnum };
        if (/^??????/i.test(text)) return { spd: evnum };
        if (/^[Ss???]/i.test(text)) return { spe: evnum };
        return {};
    },

    beforeCalc: (gen, aP, dP, move, field, analyzed) => {

        if(analyzed.attacker && analyzed.attacker.boost) {
            aP.boosts.atk = Number(analyzed.attacker.boost)
            aP.boosts.spa = Number(analyzed.attacker.boost)
            if (move.name == T.move('???????????????')) aP.boosts.def = Number(analyzed.attacker.boost)
        }
        if(analyzed.defender && analyzed.defender.boost) {
            dP.boosts.def = Number(analyzed.defender.boost)
            dP.boosts.spd = Number(analyzed.defender.boost)
        }

        if (aP.hasAbility(T.ability("???????????????"))) {
            if(aP.stats.spe > dP.stats.spe) {
                aP.species.baseStats.spe = dP.species.baseStats.spe - 1;
            }
        }
        if (aP.hasAbility(T.ability("???????????????"))) {
            field.weather = T.weather('??????')
        }

        if (
            (aP.hasAbility(T.ability("??????")) ||
                aP.hasAbility(T.ability("??????")) ||
                aP.hasAbility(T.ability("??????")) ||
                aP.hasAbility(T.ability("?????????")) ||
                aP.hasAbility(T.ability("???????????????"))) &&
            aP.abilityOn
        ) {
            aP.originalCurHP = 1;
        }

        if (aP.hasAbility(T.ability('????????????')) && aP.abilityOn && /????????????/.test(T.pokemon(aP.name))) {
            aP.species = gen.species.get(toID(T.pokemon('????????????' + T.pokemon(aP.name))));
            analyzed.attackerName = T.pokemon('????????????' + T.pokemon(aP.name));
        }

        if (dP.hasAbility(T.ability('????????????')) && dP.abilityOn && /????????????/.test(T.pokemon(dP.name))) {
            dP.species = gen.species.get(toID(T.pokemon('????????????' + T.pokemon(dP.name))));
            analyzed.defenderName = T.pokemon('????????????' + T.pokemon(dP.name));
        }

        if (aP.hasAbility(T.ability('????????????'))) move.hits = 5;

        if (analyzed.crit) move.isCrit = true;

    },

    fieldAnalyze : (token, field, isAttacker) => {
        if (token == "??????" || token == "????????????") field.gameType = 'Doubles';
        if (token == '?????????' && isAttacker) {
            field.attackerSide.isHelpingHand = true
            return true;
        }
        if (token == '????????????' && isAttacker) {
            field.attackerSide.isPowerSpot = true
            return true;
        }
        if (token == '?????????' && isAttacker) {
            field.attackerSide.isPowerSpot = true
            return true;
        }
        if (token == '????????????' && isAttacker) {
            field.attackerSide.isSeeded = true
            return true;
        }
        if (token == '??????' && !isAttacker) {
            field.defenderSide.isProtected = true
            return true;
        }
        if (token == '????????????' && !isAttacker) {
            field.defenderSide.isReflect = true
            return true;
        }
        if (token == '????????????' && !isAttacker) {
            field.defenderSide.isLightScreen = true
            return true;
        }
        if (token == '???????????????' && !isAttacker) {
            field.defenderSide.isAuroraVeil = true
            return true;
        }
        if (token == '???????????????' && !isAttacker) {
            field.defenderSide.isFriendGuard = true
            return true;
        }
        if (token == '????????????' && !isAttacker) {
            field.defenderSide.isSeeded = true
            return true;
        }
        if (token == '????????????' && !isAttacker) {
            field.defenderSide.isSR = true
            return true;
        }
        if (/^\d??????$/.test(token) && !isAttacker) {
            field.defenderSide.spikes = Number(/\d/.exec(token))
            return true;
        }
        if (token == '?????????') {
            field.isMagicRoom = true
            return true;
        }
        if (token == '?????????') {
            field.isWonderRoom = true
            return true;
        }
        if (token == '??????') {
            field.isGravity = true
            return true;
        }
        if (/??????$/.test(token)) {
            field.terrain = T.terrain(token.slice(0,-2));
            return true;
        }
        if (A.isWeather(token)) {
            field.weather = T.weather(token);
            return true;
        }
        return false;
    },

    calcFirepower : (result) => {
        const aP = new Pokemon(Generations.get(9), result.attacker.name, result.attacker.options)
        const dP = new Pokemon(Generations.get(9), 'Lumineon', {level:50,ivs:{spd:18}, evs:{def:28}})
        const move = new Move(Generations.get(9), result.move.name, result.move.options)
        const field = new Field(result.field)

        A.beforeCalc(Generations.get(9), aP, dP, move, field, result);

        var damage = calculate(Generations.get(9), aP, dP, move, field).range()[1];

        switch (T.type(move.type)) {
            case '???':
            case '??????':
                damage /= 2;
                break;
            case '??????':
            case '???':
            case '??????':
            case '??????':
                damage *= 2;
                break;
        }
        if (move.name == 'Freeze-Dry') damage /= 4;

        result.firepower = damage * 100 * 50 / 22;
    },

    calcDurability : (result) => {
        const dP = new Pokemon(Generations.get(9), result.defender.name, result.defender.options)
        const boost = eval('(2'+result.defender.boost+')/2')

        let physRatio = 1;
        let speRatio = 1;

        if (dP.hasItem(T.item('???????????????'))) {
            physRatio *= 1.5;
            speRatio *= 1.5;
        }
        if (dP.hasItem(T.item('????????????'))) speRatio *= 1.5;
        if (dP.hasType(T.type('??????')) && result.field.weather == T.weather('????????????')) speRatio *= 1.5;
        if (dP.hasType(T.type('??????')) && result.field.weather == T.weather('??????')) physRatio *= 1.5;

        result.physicalDurability = dP.stats.hp * dP.stats.def * boost / 0.411 * physRatio;
        result.specialDurability = dP.stats.hp * dP.stats.spd * boost / 0.411 * speRatio;
    },
};

window.A = A;

export default A;
