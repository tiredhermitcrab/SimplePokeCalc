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

    analyze: (text) => {
        const result = {
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

        if (result.attacker && pokemons.length > 1)
            result.defender = A.analyzePoke(pokemons[1].trim(), false, result.attacker);
        else result.defender = null;

        if (!result.attacker) {
            result.iserr = true;
            result.errorText += "공격 포켓몬 존재하지 않음";
            return result;
        }
        if (!result.defender) {
            result.iserr = true;
            result.errorText += "수비 포켓몬 존재하지 않음";
            return result;
        }
        result.move = result.attacker.move;
        result.crit = result.attacker.crit || result.defender.crit;

        result.field = merge(
            result.attacker.field,
            result.defender.field
        );


        return result;
    },

    analyzePoke: (text, isAttacker = true, attacker = null) => {
        const result = {
            name: "",
            options: { level: 50, evs: {}, ability : T.ability('꿀모으기') },
            move: { name: "", options: {} },
            field: {attackerSide: {}, defenderSide: {}},
            needNature: false,
            crit: false,
            boost : '',
            itemName : false,
        };
        if (!text) return null;
        const tokens = text.split(" ").map(t => A.chkAlias(t)).join(' ').split(' ');
        tokens.forEach((token) => {
            if (A.fieldAnalyze(token, result.field, isAttacker)) return;
            if (A.isPokemon(token)) result.name = T.pokemon(token);
            if (A.isItem(token)) result.options.item = T.item(token);
            if (A.isNature(token)) result.options.nature = T.nature(token);
            if (A.isAbility(token)) {
                result.options.ability = T.ability(token);
                result.options.abilityOn = true;
            }
            if (/특?[habcds체공방스]\d{1,3}$/i.test(token))
                result.options.evs = Object.assign(
                    result.options.evs,
                    A.evAnalyze(token)
                );
            if (/특?[habcds체공방스]\d{1,3}\+$/i.test(token)) {
                result.options.evs = Object.assign(
                    result.options.evs,
                    A.evAnalyze(token.replace("+", ""))
                );
                result.needNature = A.evAnalyze(token.replace("+", ""));
            }
            if (token == "풀보정") {
                result.options.evs = {
                    hp: 252,
                    atk: 252,
                    def: 252,
                    spa: 252,
                    spd: 252,
                };
                result.needNature = result.options.evs;
            }
            if (/^[2345]타$/.test(token)) result.move.options.hits = Number(token.slice(0, 1))
            if (/^[\+\-]\d$/.test(token)) result.boost = token;
            if (token.slice(-2) == "테라")
                result.options.teraType = T.type(token.slice(0, -2));
            if (token == "급소") result.crit = true;
            if (/^[123456]껍질깨기$/.test(token)) {
                if (isAttacker) result.boost = '+' + (2 * Number(token.slice(0,1)));
                else result.boost = "-" + token.slice(0,1);
            }
            if (A.isMove(token)) result.move.name = T.move(token);
        });


        if (!result.name) return null;
        var move = {};
        const gen = Generations.get(9);

        if (attacker && attacker.move) result.move = attacker.move;
        if (result.move.name) {
            move = new Move(gen, result.move.name, result.move.options)
        }

        if (move && move.hits == 3 && !attacker && !result.move.options.hits && T.item(result.options.item) == '속임수주사위') {
            result.move.options.hits = 4;
            result.itemName = true;
        }

        if (result.needNature && move && move.name != 'Tera Blast') {
            if (move.category == 'Physical') {
                if (isAttacker) result.options.nature = T.nature('고집')
                else if (result.needNature.def) result.options.nature = T.nature('장난꾸러기')
                if (isAttacker && move.name == T.move('바디프레스')) result.options.nature = T.nature('장난꾸러기')
            } else {
                if (isAttacker) result.options.nature = T.nature('조심')
                else if (result.needNature.spd) result.options.nature = T.nature('신중')
            }
        }
        const rPokemon = isAttacker ? new Pokemon(gen, result.name, result.options) : new Pokemon(gen, attacker.name, attacker.options)

        if (result.move.name == "Tera Blast" && result.needNature) {
            if (rPokemon.stats.atk > rPokemon.stats.spa * 1.1) {
                if (isAttacker) result.options.nature = T.nature('고집')
                else if (result.needNature.def) result.options.nature = T.nature('장난꾸러기')
            } else if (rPokemon.stats.atk * 1.1 < rPokemon.stats.spa) {
                if (isAttacker) result.options.nature = T.nature('조심')
                else if (result.needNature.spd) result.options.nature = T.nature('신중')
            } else if (rPokemon.stats.atk > rPokemon.stats.spa) {
                if (isAttacker) result.options.nature = T.nature('고집')
                else if (result.needNature.def) result.options.nature = T.nature('장난꾸러기')
            } else {
                if (isAttacker) result.options.nature = T.nature('조심')
                else if (result.needNature.spd) result.options.nature = T.nature('신중')
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
        if (/^[Hh체]/i.test(text)) return { hp: evnum };
        if (/^[Aa공]/i.test(text)) return { atk: evnum };
        if (/^[Bb방]/i.test(text)) return { def: evnum };
        if (/^[Cc]/i.test(text)) return { spa: evnum };
        if (/^[Dd]/i.test(text)) return { spd: evnum };
        if (/^특공/i.test(text)) return { spa: evnum };
        if (/^특방/i.test(text)) return { spd: evnum };
        if (/^[Ss스]/i.test(text)) return { spe: evnum };
        return {};
    },

    beforeCalc: (gen, aP, dP, move, field, analyzed) => {

        if(analyzed.attacker.boost) {
            aP.boosts.atk = Number(analyzed.attacker.boost)
            aP.boosts.spa = Number(analyzed.attacker.boost)
            if (move.name == T.move('바디프레스')) aP.boosts.def = Number(analyzed.attacker.boost)
        }
        if(analyzed.defender.boost) {
            dP.boosts.def = Number(analyzed.defender.boost)
            dP.boosts.spd = Number(analyzed.defender.boost)
        }

        if (aP.hasAbility(T.ability("애널라이즈"))) {
            if(aP.stats.spe > dP.stats.spe) {
                aP.species.baseStats.spe = dP.species.baseStats.spe - 1;
            }
        }
        if (aP.hasAbility(T.ability("진홍빛고동"))) {
            field.weather = T.weather('쾌청')
        }

        if (
            (aP.hasAbility(T.ability("심록")) ||
                aP.hasAbility(T.ability("맹화")) ||
                aP.hasAbility(T.ability("급류")) ||
                aP.hasAbility(T.ability("무기력")) ||
                aP.hasAbility(T.ability("벌레의알림"))) &&
            aP.abilityOn
        ) {
            aP.originalCurHP = 1;
        }

        if (aP.hasAbility(T.ability('달마모드')) && aP.abilityOn && /불비달마/.test(T.pokemon(aP.name))) {
            aP.species = gen.species.get(toID(T.pokemon('달마모드' + T.pokemon(aP.name))));
            analyzed.attackerName = T.pokemon('달마모드' + T.pokemon(aP.name));
        }

        if (dP.hasAbility(T.ability('달마모드')) && dP.abilityOn && /불비달마/.test(T.pokemon(dP.name))) {
            dP.species = gen.species.get(toID(T.pokemon('달마모드' + T.pokemon(dP.name))));
            analyzed.defenderName = T.pokemon('달마모드' + T.pokemon(dP.name));
        }

        if (aP.hasAbility(T.ability('스킬링크'))) move.hits = 5;

        if (analyzed.crit) move.isCrit = true;
    },

    fieldAnalyze : (token, field, isAttacker) => {
        if (token == "분산" || token == "더블배틀") field.gameType = 'Doubles';
        if (token == '도우미' && isAttacker) {
            field.attackerSide.isHelpingHand = true
            return true;
        }
        if (token == '파워스폿' && isAttacker) {
            field.attackerSide.isPowerSpot = true
            return true;
        }
        if (token == '배터리' && isBattery) {
            field.attackerSide.isPowerSpot = true
            return true;
        }
        if (token == '방어' && !isAttacker) {
            field.defenderSide.isProtected = true
            return true;
        }
        if (token == '리플렉터' && !isAttacker) {
            field.defenderSide.isReflect = true
            return true;
        }
        if (token == '빛의장막' && !isAttacker) {
            field.defenderSide.isLightScreen = true
            return true;
        }
        if (token == '오로라베일' && !isAttacker) {
            field.defenderSide.isAuroraVeil = true
            return true;
        }
        if (token == '프렌드가드' && !isAttacker) {
            field.defenderSide.isFriendGuard = true
            return true;
        }
        if (token == '매직룸') {
            field.isMagicRoom = true
            return true;
        }
        if (token == '원더룸') {
            field.isWonderRoom = true
            return true;
        }
        if (token == '중력') {
            field.isGravity = true
            return true;
        }
        if (/필드$/.test(token)) {
            field.terrain = T.terrain(token.slice(0,-2));
            return true;
        }
        if (A.isWeather(token)) {
            field.weather = T.weather(token);
            return true;
        }
        return false;
    }
};

window.A = A;

export default A;
