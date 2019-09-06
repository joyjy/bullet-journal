<template>
    <li class="note-item">
        <div class="note-wrapper"> 
            <note-bullet :note="note"></note-bullet>
            <editable-div :value="note.text"
                @input="saveNote($event)"
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
import NoteBullet from "./NoteBullet.vue"
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
        NoteBullet,
        EditableDiv
    },
    mounted: function(){
        if(this.note.created || this.note.changed){ // new created or recreated(up/down) note get focus
            this.$nextTick(() => {
                this.focus();
                this.$store.commit("afterMounted", this.note)
            })
        }
    },
    methods:{
        saveNote: function(text){
            this.$store.dispatch('saveNote', { 
                note: this.note,
                text: text
            })
        },
        newNote: function(text){
            this.$store.dispatch('addNote', {
                parent: this.parent, 
                index: this.index+1, 
                text: text
            })
        },
        deleteNote: function(){
            // first node can't be remove, only empty
            if(this.index == 0 && !this.parent.id){
                return;
            }
            this.$store.dispatch('deleteNote', {
                parent: this.parent,
                index: this.index
            }).then(() => {
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
            })
        },
        mergeNoteToLast: function(){
            if(this.index == 0 && !this.parent.id){ // first node can't be remove
                return;
            }

            if(this.index == 0){
                // merge to parent
                let position = this.$parent.focusAtEnd();
                this.$store.dispatch('saveNote', { 
                    note: this.parent, 
                    text: this.parent.text + this.note.text
                }).then(() => {
                    this.$nextTick(() => {
                        this.$parent.focusAt(position);
                    })
                })
            }else{
                // merge to prev
                let prev = this.parent.notes[this.index-1];
                let prevEl = this.$el.previousSibling;

                let position = prev.text.length;
                this.$store.dispatch('saveNote', {
                    note: prev,
                    text: prev.text + this.note.text
                }).then(() => {
                    this.$nextTick(() => {
                        this.focusAt(position, prevEl);
                    })
                })
            }

            this.$store.dispatch('deleteNote', { parent: this.parent, index: this.index})
        },
        downgradeNote: function(){
            if(this.index == 0){
                return;
            }
            this.$store.dispatch('downgradeNote', { 
                parent: this.parent, 
                index: this.index, 
                note: this.note
            })
        },
        upgradeNote: function(){
            if(!this.parent.id){
                return;
            }
            // todo server
            this.$store.dispatch('upgradeNote', {
                grandParent: this.$parent.parent,
                grandIndex: this.$parent.index+1,
                parent: this.parent,
                index: this.index,
                note: this.note
            })
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
    }
}
</script>

<style>
.note-item {
    list-style: none;
}
.note-wrapper{
    display: flex;
    align-items: center;
}
</style>