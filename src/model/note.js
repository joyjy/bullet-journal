import _ from "lodash"

class Note{
    constructor(){
        this.id = _.now();
        this.text = '';
        this.tokens = [];
        this.content = {
            text: '',
            tokens: []
        }
        this.display = {
            collapsed: false,
            text: {
                focus: false,
                cursor: 0,
            },
            content: {
                focus: false,
                cursor: -1,
            },
        }
        this.notes = [];
    }
}

const toNote = function(note){
    if(!note){
        return;
    }
    if(note instanceof Note){
        return note;
    }
    let from = note;
    let to = new Note();
    _.assignWith(to, from, (toVal, fromVal) => {
        if(typeof toVal === 'object'){
            _.assignWith(toVal, fromVal);
            return toVal;
        }
        return _.isUndefined(fromVal) ? toVal: fromVal;
    });
    return to;
}

export { Note, toNote }