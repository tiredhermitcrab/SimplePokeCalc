const P = require('pokemon')

function translatePokemon(engName, language='ko') {
    return P.getName(P.getId(engName), language)
}

exports.translatePokemon = translatePokemon;