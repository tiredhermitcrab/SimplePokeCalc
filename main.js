import T from "./util/translate.js";
import A from "./util/analyze.js";

Object.assign(window, window.calc);

window.aaa = function () {
    const text = document.querySelector("#aaa").value;
    const gen = Generations.get(9);
    const analyzedText = A.analyze(text);
    var result = '';
    if (!analyzedText) {
        result = "Error";
    } else if (analyzedText.iserr) {
        result = analyzedText.errorText;
    } else {
        result = calculate(
            gen,
            new Pokemon(
                gen,
                analyzedText.attackPokemon.name,
                analyzedText.attackPokemon.options
            ),
            new Pokemon(
                gen,
                analyzedText.defensePokemon.name,
                analyzedText.defensePokemon.options
            ),
            new Move(gen, analyzedText.move.name, analyzedText.move.options),
            new Field(analyzedText.field)
        ).fullDesc();
    }

    document.querySelector("#tt").innerHTML = result;
};
