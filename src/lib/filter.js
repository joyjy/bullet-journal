
class Query{
    
    setValue(value){
        this.value = value;
    }
}

class Match{
    constructor(matched, start, length){
        this.matched = matched;
        this.start = start,
        this.length = length;
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
            return new Match(true, 0, 0);
        }
        let start = note.text.indexOf(query.value)
        let length = query.value ? query.value.length: 0;
        return new Match(start > -1, start, length);
    }
}