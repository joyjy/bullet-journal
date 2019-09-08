
export default {

    find: function(notes, predicate){
        if(notes.length == 0){
            return;
        }
        for (let i = 0; i < notes.length; i++) {
            let note = notes[i];
            if(predicate(note)){
                return note;
            }else{
                let found = this.find(note.notes, predicate)
                if(found){
                    return found;
                }
            }
        }
    },
    path: function(notes, predicate, stack){
        if(!stack){
            stack = [];
        }
        if(notes.length == 0){
            return stack;
        }
        for (let i = 0; i < notes.length; i++) {
            let note = notes[i];
            if(predicate(note)){
                stack.push(note);
                return stack;
            }else{
                stack.push(note)
                let size = stack.length;
                let found = this.path(note.notes, predicate, stack)
                if(found.length > size){
                    return stack;
                }else{
                    stack.pop(note)
                }
            }
        }
        return stack;
    },
    each: function(notes, level, iteratee, deepth){
        if(!deepth){
            deepth = 0;
        }
        if(level > 0 && deepth > level || notes.length == 0){
            return;
        }
        for (let i = 0; i < notes.length; i++) {
            let note = notes[i];
            iteratee(note, deepth);
            this.each(note.notes, level, iteratee, deepth+1)
        }
    }
}