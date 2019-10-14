class Notebook{
    constructor({name, template, views, mode, current, prev, next} = {}){
        this.name = name || '';
        this.template = template ? template.template: '';
        this.view = 0;
        this.views = views || [];
        this.mode = mode || ''; // items/pages
        this.current = current || null;
        this.prev = prev || function(){};
        this.next = next || function(){};
    }
}

class View {
    constructor({title, colWidth}){
        this.colWidth = colWidth;
        this.title = title;
        this.component = {
            name: 'note-tree-root',
            props(vm){
                let note = vm.$store.getters.findNoteBy(n => n.name === title);
                if(note){
                    vm.$data.name = note.text;
                    return {
                        parent: note,
                        root: note,
                    };
                }
                return {}
            }
        }
        this.exist = false;
        this.createable = false;
    }
}

export { Notebook, View }