<template>
    <li class="note-item">
        <div class="note-wrapper"> 
            <note-bullet :note="note" :collapsed="collapsed"
                @collapse-note="$store.commit('collapse', note)"
                @del-note="deleteNote">
            </note-bullet>
            <editable-div :note="note"
                @input="saveNote"
                @new-note="newNote"
                @del-note="deleteNote"
                @merge-note="mergeNoteToLast"
                @downgrade-note="downgradeNote"
                @upgrade-note="upgradeNote"
                @nav-between-note="navigationNote($event)">
            </editable-div>
        </div>
        <draggable tag="ul" v-model="noteList" :group="{ name: 'note-tree' }" ghost-class="moving-ghost"
            v-show="note.notes.length > 0 && !note.display.collapse">
            <note-tree-item v-for="(child,i) in note.notes" :key="child.id"
                :note="child" :index="i" :parent="note">
            </note-tree-item>
        </draggable>
    </li>
</template>

<script>
import NoteBullet from "./NoteBullet.vue"
import EditableDiv from "./EditableDiv.vue"
import range from "@/lib/range"

import draggable from "vuedraggable"

export default {
    name: "note-tree-item",
    props: ["parent", 'note', 'index'],
    data: () => ({
    }),
    components:{
        draggable,
        NoteBullet,
        EditableDiv
    },
    computed: {
        noteList: {
            get(){
                return this.note.notes;
            },
            set(value){
                this.$store.dispatch("dragToSort", { notes: value, note: this.note})
            }
        },
        collapsed: function(){
            return this.note.display.collapse && this.note.notes.length > 0
        }
    },
    methods:{
        saveNote: function(payload){
            payload.note = this.note;
            this.$store.dispatch('saveNote', payload)
        },
        newNote: function(text){
            this.$store.dispatch('newNote', {
                parent: this.parent, 
                index: this.index+1, 
                text: text
            })
        },
        deleteNote: function(payload){
            // first node can't be remove, only empty
            if(this.index == 0 && this.parent.notes.length == 1 && !this.parent.id){
                return;
            }
            let last;
            if(this.index == 0){
                last = this.parent;
            }else{
                last = this.parent.notes[this.index-1];
            }
            this.$store.dispatch('deleteNote', {
                parent: this.parent,
                note: this.note,
                index: this.index
            }).then(() => {
                if(payload && payload.keyboard){
                    this.$store.commit("focus", {note: last, position: last.text.length})
                }
            })
        },
        mergeNoteToLast: function(){
            if(this.index == 0 && !this.parent.id){ // first node can't be remove
                return;
            }

            let last;
            if(this.index == 0){
                last = this.parent;
            }else{
                last = this.parent.notes[this.index-1];
            }
            let position = last.text.length;

            this.$store.dispatch('saveNote', { 
                note: last, 
                text: last.text + this.note.text
            }).then(() => {
                this.$nextTick(() => {
                    this.$store.commit("focus", {note: last, position: position})
                })
            })
            this.$store.dispatch('deleteNote', { 
                parent: this.parent, 
                note: this.note,
                index: this.index
            })
        },
        downgradeNote: function(payload){
            if(this.index == 0){
                return;
            }
            payload.parent = this.parent;
            payload.index = this.index;
            payload.note = this.note;
            this.$store.dispatch('downgradeNote', payload)
        },
        upgradeNote: function(payload){
            if(!this.parent.id){
                return;
            }
            payload.parent = this.parent;
            payload.index = this.index;
            payload.note = this.note;
            this.$store.dispatch('upgradeNote', payload)
        },
        navigationNote: function(payload){
            let target;
            switch(payload.direction){
                case "up":
                    if(this.index == 0 && !this.parent.id){
                        return;
                    }
                    if(this.index == 0){
                        target = this.parent;
                    }else{
                        target = this.parent.notes[this.index-1]; // todo
                    }
                    break;
                case "down":
                    if(this.index == this.parent.notes.length-1
                        && this.note.notes.length == 0){
                        return
                    }
                    if(this.index == this.parent.notes.length-1){
                        target = this.notes[0];
                    }else{
                        target = this.parent.notes[this.index+1]
                    }

                    break;
            }

            if(payload.position > target.text.length){
                payload.position = target.text.length;
            }
            this.$nextTick(() => {
                this.$store.commit("focus", {note: target, position: payload.position})
            })
        }
    }
}
</script>

<style>
.note-item {
    list-style: none;
}
.note-wrapper{
    margin-top: .25rem;
    display: flex;
}
.moving-ghost{
    display: none;
}
</style>