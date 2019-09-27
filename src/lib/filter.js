
class Query{
    
    setValue(value){
        this.value = value;

        let ors = value.split("OR");

        this.querys = _.flatMap(ors, (or) => {
            let ands = or.split("AND");
            let result = [];
            for (let i = 0; i < ands.length; i++) {
                const text = ands[i];
                result.push({type:i==0?"OR":"AND", value: text.trim()})
            }
            return result;
        })
    }
}

class Match{

    constructor(matched, start, length){
        this.matched = matched;
        this.ranges = []
        this.start = start,
        this.length = length;
    }

    addMatchRange(start, length){
        this.ranges.push([start, length]);
    }
}

export default {

    parse: function(q){
        let query = new Query()
        query.setValue(q)
        return query;
    },
    match: function(note, query){
        if(!query || !query.value){
            return new Match(true);
        }

        let match = new Match();
        for (let i = 0; i < query.querys.length; i++) {
            const q = query.querys[i];
            if(q.type === "OR"){
                let start = note.text.indexOf(q.value)
                match.matched = match.matched || start > -1;
                if(start > -1){
                    match.addMatchRange(start, q.value.length)
                }
            }
        }
        return match;
    }
}