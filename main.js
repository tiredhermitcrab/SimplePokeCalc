import A from "./util/analyze.js";

Object.assign(window, window.calc);

window.aaa = function () {
    const text = document.querySelector("#aaa").value;
    const gen = Generations.get(9);
    const analyzed = A.analyze(text);
    var result = '';
    if (!analyzed) {
        result = "Error";
    } else if (analyzed.iserr) {
        result = analyzed.errorText;
    } else {
        result = calculate(
            gen,
            new Pokemon(
                gen,
                analyzed.attackPokemon.name,
                analyzed.attackPokemon.options
            ),
            new Pokemon(
                gen,
                analyzed.defensePokemon.name,
                analyzed.defensePokemon.options
            ),
            new Move(gen, analyzed.move.name, analyzed.move.options),
            new Field(analyzed.field)
        ).fullDesc();
    }

    document.querySelector("#result").innerHTML = result;
};
