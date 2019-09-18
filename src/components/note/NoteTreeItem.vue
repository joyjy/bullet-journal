<template>
    <li class="note-item">
        <div v-show="filtered || ignoreFiltered" class="note-wrapper"> 
            <note-bullet :note="note" :collapsed = "collapsed"
                @collapse-note="switchCollapse"
                @del-note="deleteNote">
            </note-bullet>
            <div class="d-flex flex-column flex-grow-1" style="width:100%">
                <editable-div :note="note" :match="match"
                    @input="saveNote"
                    @new-content="saveNote"
                    @new-note="newNote"
                    @del-note="deleteNote"
                    @downgrade-note="downgradeNote"
                    @upgrade-note="upgradeNote"
                    @up-note="upNote" 
                    @down-note="downNote" 
                    @nav-between-note="navigationNote">
                </editable-div>
                <editable-div v-if="displayContent" :type="'content'" :focus="focusContent"
                    :note="note" :match="match" @input="saveNote" @editing="focusContent = $event">
                </editable-div>
            </div>
        </div>
        <draggable tag="ul" v-model="noteList" :group="{ name: 'note-tree' }" ghost-class="moving-ghost"
            v-show="collapsed == 'expand' || collapsed == 'filtered'">
            <note-tree-item v-for="(child,i) in noteList" :key="child.id"
                :note="child" :index="i" :parent="note"
                :query="subQuery" @matched = "childrenMatchChanged">
            </note-tree-item>
        </draggable>
    </li>
</template>

<script>
import NoteBullet from "./NoteBullet.vue"
import EditableDiv from "./EditableDiv.vue"
import range from "@/lib/range"

import filter from "@/lib/filter"

import draggable from "vuedraggable"

export default {
    name: "note-tree-item",
    props: ["parent", 'note', 'index', 'query'],
    data: () => ({
        match: {},
        childrenMatch: false,
        focusContent: false,
        ignoreFiltered: false,
    }),
    components:{
        draggable,
        NoteBullet,
        EditableDiv
    },
    created: function(){
        this.childrenMatch = false;
        this.match = filter.match(this.note, this.query);
    },
    computed: {
        noteList: {
            get(){
                return this.note.notes;
            },
            set(value){
                // this.$store.dispatch("dragToSort", { notes: value, note: this.note})
            }
        },
        collapsed: function(){
            if(this.note.notes.length == ''){
                return 'none'
            }

            if(this.query && !this.ignoreFiltered && this.filtered){
                return 'filtered'
            }

            return this.note.display.collapse ? 'collapsed' : 'expand';
        },
        filtered: function(){
            return this.selfMatch || this.childrenMatch;
        },
        selfMatch: function(){
            return this.match && this.match.matched
        },
        subQuery: function(){
            if(this.ignoreFiltered){
                return null;
            }
            return this.query;
        },
        displayContent: function(){
            if(this.note.content){
                return this.note.content.text || this.note.display.cursor.content >= 0;
            }
            return false;
        }
    },
    watch: {
        query: function(){ // new query input
            this.ignoreFiltered = false;
            this.childrenMatch = false; // reset child match
            this.match = filter.match(this.note, this.query); // search self
        },
        match: function(){ // after searched, $emit result;
            this.$emit('matched', this.selfMatch)
        }
    },
    methods:{
        switchCollapse: function(){
            this.ignoreFiltered = true;
            this.$store.commit('collapse', { note: this.note })
        },
        childrenMatchChanged: function(childMatch){
            this.childrenMatch = this.childrenMatch || childMatch;
            this.$emit('matched', this.filtered); // up boardcast match to display path;
        },
        saveNote: function(payload){
            payload.note = this.note;
            this.$store.dispatch('saveNote', payload)
        },
        newNote: function(payload){
            payload.index = payload.last ? this.index : this.index+1;
            payload.parent = this.parent;
            this.$store.dispatch('newNote', payload)
        },
        deleteNote: function(payload){
            // first node can't be remove, only empty
            if(this.index == 0 && this.parent.notes.length == 1 && !this.parent.id){
                return;
            }

            if(payload && payload.keyboard){
                let text = this.note.text;
                let notes = this.note.notes;

                let prev = this.$store.getters.findPrevNote(this.note)

                if(!prev){
                    throw "prev undefined"
                }

                let position = prev.text.length;
                this.$store.dispatch('saveNote', { 
                    note: prev, 
                    text: prev.text + text,
                    notes: prev.notes.concat(notes)
                }).then(() => {
                    this.$store.commit("focus", {note: prev, position: position})
                })
            }
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
        downNote: function(payload){
            // last node can't down
            if(this.index == this.parent.notes.length-1){
                return;
            }
            payload.parent = this.parent;
            payload.index = this.index;
            payload.note = this.note;
            this.$store.dispatch('downNote', payload)
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
        upNote: function(payload){
            // first node can't up
            if(this.index == 0){
                return;
            }
            payload.parent = this.parent;
            payload.index = this.index;
            payload.note = this.note;
            this.$store.dispatch('upNote', payload)
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
        },
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