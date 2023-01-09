import A from "./util/analyze.js";

Object.assign(window, window.calc);

window.aaa = function () {
    const text = document.querySelector("#aaa").value;
    const gen = Generations.get(9);
    const analyzed = A.analyze(text);
    var result = "";
    if (!analyzed) {
        result = "Error";
    } else if (analyzed.iserr) {
        result = analyzed.errorText;
    } else {
        const aP = new Pokemon(
            gen,
            analyzed.attacker.name,
            analyzed.attacker.options
        );
        const dP = new Pokemon(
            gen,
            analyzed.defender.name,
            analyzed.defender.options
        );
        const move = new Move(gen, analyzed.move.name, analyzed.move.options)
        const field = new Field(analyzed.field)
        
        A.beforeCalc(gen, aP, dP, move, field, analyzed);


        result = calculate(gen, aP, dP, move, field);
        
        console.log(result.attacker ? JSON.stringify(result.attacker) : "");
        console.log(result.defender ? JSON.stringify(result.defender) : "");
        
        
    }

    document.querySelector("#result").innerHTML = result.fullDesc
        ? result.fullDesc()
        : result;

};
