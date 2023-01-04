import * as fs from 'fs'

const P = {
    pokemon : name => {
        const en = JSON.parse(fs.readFileSync('util/data/pokemon_en.json').toString())
        const ko = JSON.parse(fs.readFileSync('util/data/pokemon_ko.json').toString())
        
        return en[ko.indexOf(name)] || ko[en.indexOf(name)]
    },
    move : name => {
        const en = JSON.parse(fs.readFileSync('util/data/move_en.json').toString())
        const ko = JSON.parse(fs.readFileSync('util/data/move_ko.json').toString())
        
        return en[ko.indexOf(name)] || ko[en.indexOf(name)]
    },
    nature : name => {
        const en = JSON.parse(fs.readFileSync('util/data/nature_en.json').toString())
        const ko = JSON.parse(fs.readFileSync('util/data/nature_ko.json').toString())
        
        return en[ko.indexOf(name)] || ko[en.indexOf(name)]
    },
    item : name => {
        const en = JSON.parse(fs.readFileSync('util/data/item_en.json').toString())
        const ko = JSON.parse(fs.readFileSync('util/data/item_ko.json').toString())
        
        return en[ko.indexOf(name)] || ko[en.indexOf(name)]
    }
};



export default P;