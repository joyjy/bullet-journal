
export default {
    depth: function(notes, currentDepth){
        if(!currentDepth){
            currentDepth = 0;
        }
        let maxDepth = currentDepth;
        for (let i = 0; i < notes.length; i++) {
            let note = notes[i];
            let childDepth = this.depth(note.notes, currentDepth+1);
            if(childDepth > maxDepth){
                maxDepth = childDepth;
            }
        }
        return maxDepth;
    },
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
    each: function(notes, level, iteratee, depth){
        if(!depth){
            depth = 0;
        }
        if(level > 0 && depth > level || notes.length == 0){
            return;
        }
        for (let i = 0; i < notes.length; i++) {
            let note = notes[i];
            iteratee(note, depth);
            this.each(note.notes, level, iteratee, depth+1)
        }
    },
    flattern: function(notes){
        let array = [];
        if(notes.length == 0){
            return array;
        }
        for (let i = 0; i < notes.length; i++) {
            let note = notes[i];
            array.push(note);
            array = array.concat(this.flattern(note.notes));
        }
        return array;
    }
}