<template>
    <li>
        <div class="note-wrapper">
            <div class="control">
                -
            </div>
            <editable-div 
                v-model="note.text"
                @new-note="newNote($event)"
                @del-note="deleteNote"
                @merge-note="mergeNoteToLast"
                @downgrade-note="downgradeNote"
                @upgrade-note="upgradeNote"
                @nav-between-note="navigationNote($event)">
            </editable-div>
        </div>
        <ul v-show="note.notes.length > 0">
            <note-tree-item v-for="(child,i) in note.notes" :key="child.id"
                :note="child" :index="i" :parent="note">
            </note-tree-item>
        </ul>
    </li>
</template>

<script>
import EditableDiv from "../dom/EditableDiv.vue"
import Range from "../dom/Range.vue"

export default {
    name: "note-tree-item",
    props: ["parent", 'note', 'index'],
    data: function(){
        return {
            focus: Range.focus,
            focusAt: Range.focusAt,
            focusAtEnd: Range.focusAtEnd,
        };
    },
    components:{
        EditableDiv
    },
    mounted: function(){
        if(this.note.created || this.note.changed){ // new created note get focus
            this.$nextTick(() => {
                this.focus();
                this.note.created = false;
                this.note.change = false;
            })
        }
    },
    methods:{
        newNote: function(text){
            // todo: create by server
            let note = { id: new Date().getTime(), text: "" , notes:[], created: true};
            if(text){
                note.text = text;
            }
            // ----

            this.parent.notes.splice(this.index + 1, 0, note);
        },
        deleteNote: function(){
            // first node can't be remove, only empty
            if(this.index == 0 && !this.parent.text){
                return;
            }

            // todo: delete from server
            //

            this.parent.notes.splice(this.index, 1);

            if(this.index == 0){
                this.$nextTick(() => {
                    this.$parent.focusAtEnd();
                })
            }else{
                let prev = this.$el.previousSibling;
                this.$nextTick(() => {
                    this.focusAtEnd(prev);
                })
            }
        },
        mergeNoteToLast: function(){
            if(this.index == 0 && !this.parent.text){ // first node can't be remove
                return;
            }

            // todo: merged at server
            //

            let appendText = this.note.text;
            this.parent.notes.splice(this.index, 1);

            if(this.index == 0){
                // merge to parent
                this.$nextTick(() => {
                    let position = this.$parent.focusAtEnd();
                    this.parent.text += appendText;
                    this.$nextTick(() => {
                        this.$parent.focusAt(position);
                    })
                })
            }else{
                // merge to prev
                let prev = this.parent.notes[this.index-1];
                let position = prev.text.length;
                prev.text += appendText;
                let prevEl = this.$el.previousSibling;
                this.$nextTick(() => {
                    this.focusAt(position, prevEl);
                })
            }
        },
        downgradeNote: function(){
            if(this.index == 0){
                return;
            }

            // todo server
            
            let prev = this.parent.notes[this.index-1];

            this.parent.notes.splice(this.index, 1);
            prev.notes.push(this.note);
            this.note.changed = true;
        },
        upgradeNote: function(){
            if(this.index == 0 && !this.parent.text){
                return;
            }
            // todo server

            let grandParent = this.$parent.parent;

            this.parent.notes.splice(this.index, 1);
            grandParent.notes.push(this.note);
            this.note.changed = true;
        },
        navigationNote: function(direction){
            if(direction == "up"){
                if(this.index == 0){
                    if(!this.parent.text){
                        return;
                    }

                    this.$nextTick(()=>{
                        this.$parent.focusAtEnd();
                    })
                }else{
                    let prevEl = this.$el.previousSibling;
                    this.$nextTick(() => {
                        this.focusAtEnd(prevEl);
                    })
                }
            }else if(direction == "down"){
                if(this.index == this.parent.notes.length-1){
                    if(this.note.notes.length == 0){
                        return;
                    }

                    let firstChildEl = this.$el.childNodes[1];
                    this.$nextTick(() => {
                        this.focusAtEnd(firstChildEl);
                    })
                }else{
                    let nextEl = this.$el.nextSibling;
                    this.$nextTick(() => {
                        this.focusAtEnd(nextEl);
                    })
                }
            }
        },
        saveNote: function(note){
        },
    }
}
</script>

<style scoped>
.note-wrapper{
    display: flex;
}

.control{
    width: 1rem;
    cursor: pointer;
}
</style>