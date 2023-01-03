import {getId, getName} from 'pokemon'

const P = {
    pokemon : name => {
        var id = 1;
        var language = 'ko'
        try {
            id = getId(name);
        } catch (e) {
            try {
                id = getId(name, 'ko')
                language = 'en'
            } catch (ee) { id = 1; }
        }
        return getName(id, language)
    }
};

export default P;