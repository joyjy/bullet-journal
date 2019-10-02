
export default {
    depth(notes, currentDepth){
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
    find(notes, predicate, options = {}){
        if(notes.length === 0){
            return null;
        }
        for (let i = 0; i < notes.length; i++) {
            let index = i;
            if(options.reserve){
                index = notes.length - i - 1;
            }
            let note = notes[index];
            
            if(predicate(note)){
                return note;
            }

            let found = this.find(note.notes, predicate, options);
            if(found){
                return found;
            }
        }
        return null;
    },
    path(notes, predicate, stack){
        if(!stack){
            stack = [];
        }
        if(notes.length === 0){
            return stack;
        }
        for (let i = 0; i < notes.length; i++) {
            let note = notes[i];
            if(predicate(note)){
                stack.push(note);
                return stack;
            }else{
                stack.push(note);
                let size = stack.length;
                let found = this.path(note.notes, predicate, stack);
                if(found.length > size){
                    return stack;
                }else{
                    stack.pop(note);
                }
            }
        }
        return stack;
    },
    each(notes, iteratee, {level, depth} = {}){
        if(!depth){
            depth = 0;
        }
        if(level > 0 && depth > level || notes.length === 0){
            return;
        }
        for (let i = 0; i < notes.length; i++) {
            let note = notes[i];
            iteratee(note, depth);
            this.each(note.notes, iteratee, {level, depth: depth+1});
        }
    },
    flattern(notes){
        let array = [];
        if(notes.length === 0){
            return array;
        }
        for (let i = 0; i < notes.length; i++) {
            let note = notes[i];
            array.push(note);
            array = array.concat(this.flattern(note.notes));
        }
        return array;
    },
    dup(notes, iteratee){
        let dupNotes = [];
        for (let i = 0; i < notes.length; i++) {
            notes[i].notes = this.dup(notes[i].notes, iteratee)
            dupNotes.push(iteratee(notes[i]))
        }
        return dupNotes;
    }
}