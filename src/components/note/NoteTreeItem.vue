<template>
    <li :class="['note-item', col>0?'note-col-'+col:'', {archived: note.archived}]" v-show="archivedShow" :data-id="note.id">
        <div v-show="filtered || ignoreFiltered" class="note-wrapper" @mouseenter="mouseenter"> 
            <note-bullet :note="note" :collapsed = "collapsed"
                @collapse-note="switchCollapse"
                @del-note="deleteNote"
                @archive-note="$store.commit('archive', {note:note})">
            </note-bullet>
            <div class="d-flex flex-column flex-grow-1" style="width: calc(100% - 21px)">
                <editable-div :note="note" :type="'text'" :match="match" :style="{paddingRight:collapsed == 'expand'?'1rem':''}"
                    @input="debounceSaveNote"
                    @new-content="saveNote"
                    @new-note="newNote"
                    @del-note="deleteNote"
                    @downgrade-note="downgradeNote"
                    @upgrade-note="upgradeNote"
                    @up-note="upNote" 
                    @down-note="downNote" 
                    @nav-between-note="navigationNote"
                    @editing="focus = $event;"
                    @composing="composing = $event">
                </editable-div>
                <editable-div v-show="displayContent || focusContent"
                    :type="'content'" :note="note" :match="match"
                    @input="debounceSaveNote"
                    @editing="focus = $event; focusContent = $event;"
                    @composing="composing = $event"
                    @del-content="deleteContent">
                </editable-div>
            </div>
            <note-menu v-if="collapsed == 'expand'" :note="note"></note-menu>
        </div>

        <draggable tag="ul" v-model="noteList" :group="{ name: 'note-tree' }"
            @start="$store.commit('dragging', true)" @end="$store.commit('dragging', false)"
            v-show="collapsed == 'expand' || collapsed == 'filtered'">
            <note-tree-item v-for="(child,i) in noteList" :key="child.id"
                :note="child" :index="i" :parent="note" :root="root"
                :query="subQuery" @matched = "childrenMatchChanged">
            </note-tree-item>
        </draggable>

        <tag-suggest ref="suggest" :focus="focus" :composing="composing"
            :lastInput="lastInput" :container="this"></tag-suggest>
    </li>
</template>

<script>
import { mapMutations, mapGetters } from "vuex"
import _ from "lodash"
import draggable from "vuedraggable"

import NoteBullet from "./NoteBullet"
import EditableDiv from "./EditableDiv"
import NoteMenu from "./NoteMenu"
import TagSuggest from "../tag/Suggest"

import filter from "@/lib/filter"

export default {
    name: "note-tree-item",
    props: ["parent", // firstParent is NoteTree's $data, recurisive is note
            "note",
            "index",
            "query",
            "root"],
    data: () => ({
        match: {},
        childrenMatch: false,
        focusContent: false,
        ignoreFiltered: false,
        focus: false,
        composing: false,
        lastInput: {requireSuggest:''},
    }),
    components:{
        draggable,
        NoteBullet,
        EditableDiv,
        NoteMenu,
        TagSuggest
    },
    created: function(){
        this.childrenMatch = false;
        this.match = filter.match(this.note, this.query);
    },
    computed: {
        ...mapGetters({
            isStarred: "saved/isStarred",
        }),
        noteList: {
            get(){
                return this.note.notes;
            },
            set(value){
                this.$store.dispatch("dragToSort", { note: this.note, notes: value})
            }
        },
        collapsed: function(){
            if(this.note.notes.length == ""){
                return "none"
            }

            if(this.query && !this.ignoreFiltered && this.filtered){
                return "filtered"
            }

            return this.note.display.collapsed ? "collapsed" : "expand";
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
                return this.note.content.text;
            }
            return false;
        },
        col: function(){
            if(!this.parent.display || !this.parent.display.column){
                return 0;
            }
            if(this.collapsed === "filtered"){
                return 0;
            }
            if(this.parent.notes.length >= 30){
                return 3;
            }
            if(this.parent.notes.length >= 20){
                return 4;
            }
            if(this.parent.notes.length >= 10){
                return 6;
            }
            return 0;
        },
        archivedShow(){
            if(!this.note.archived){
                return true;
            }
            if(this.parent.display && this.parent.display.archived){
                return true;
            }
            if(false){ // global setting
                return true;
            }
            if(this.root === this.note){
                return true;
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
            this.$emit("matched", this.selfMatch)
        }
    },
    methods:{
        switchCollapse: function(){
            this.ignoreFiltered = true;
            this.$store.commit("collapse", { note: this.note })
        },
        childrenMatchChanged: function(childMatch){
            this.childrenMatch = this.childrenMatch || childMatch;
            this.$emit("matched", this.filtered); // up boardcast match to display path;
        },
        debounceSaveNote: _.debounce(function(payload){this.saveNote(payload);}, 100),
        saveNote: function(payload){
            payload.note = this.note;
            this.$store.dispatch("saveNote", payload)
                .then(() => {payload.requireSuggest=""; this.lastInput = payload})
                .then(() => this.afterNoteChange(payload));
            
            if(payload.type === "content"){
                this.focusContent = true;
            }
        },
        afterNoteChange: function(payload){
            if(this.isStarred(this.note.id)){
                this.$store.commit("saved/updateNote", {note: this.note})
            }
        },
        newNote: function(payload){
            if(this.lastInput.requireSuggest){
                this.$refs.suggest.appendTag();
                return;
            }

            if(this.note.text == ""){
                if(this.root && this.root != this.parent || !this.root && this.parent.id){
                    this.upgradeNote(payload);
                    return;
                }
            }

            if(this.root && this.root == this.note){ // focus
                payload.parent = this.note;
            }else{
                payload.index = payload.prev ? this.index : this.index+1;
                payload.parent = payload.sub ? this.note: this.parent;
            }

            payload.curNote = this.note;
            this.$store.dispatch("newNote", payload)
        },
        deleteNote: function(payload){
            // first node can't be remove, only empty
            if(this.index == 0 
                && (!this.parent.id // first note of forest
                    || this.root && this.root == this.parent)){ // first note of root
                return;
            }

            let batchId = "";
            let prev = this.$store.getters.findLastVisibleNote(this.note);
            let text = this.note.text;
            if(payload && payload.keyboard && text.length > 0){
                batchId = _.now().toString();

                this.$store.dispatch("saveNote", { 
                    note: prev, 
                    text: prev.text + text,
                    notes: prev.notes.concat(this.note.notes),
                    position: prev.text.length,
                    batchId: batchId,
                })
            }

            this.$store.dispatch("deleteNote", { 
                parent: this.parent, 
                note: this.note,
                index: this.index,
                keyboard: payload && payload.keyboard,
                batchId: batchId,
            })
            if(text.length == 0){
                this.$store.commit("focus", {note: prev, position: prev.text.length})
            }
        },
        downgradeNote: function(payload){
            if(this.index == 0){
                return;
            }
            payload.parent = this.parent;
            payload.index = this.index;
            payload.note = this.note;
            this.$store.dispatch("downgradeNote", payload)
        },
        downNote: function(payload){
            // last node can't down
            if(this.index == this.parent.notes.length-1){
                return;
            }
            payload.parent = this.parent;
            payload.index = this.index;
            payload.note = this.note;
            this.$store.dispatch("downNote", payload)
        },
        upgradeNote: function(payload){
            if(!this.parent.id){
                return;
            }
            if(payload.position === undefined){
                payload.position = payload.curPosition;
            }
            payload.parent = this.parent;
            payload.index = this.index;
            payload.note = this.note;
            this.$store.dispatch("upgradeNote", payload)
        },
        upNote: function(payload){
            // first node can't up
            if(this.index == 0){
                return;
            }
            payload.parent = this.parent;
            payload.index = this.index;
            payload.note = this.note;
            this.$store.dispatch("upNote", payload)
        },
        navigationNote: function(payload){
            if(this.lastInput.requireSuggest){
                this.$refs.suggest.navigationSuggest(payload);
                return;
            }
            let target;
            let position;
            switch(payload.direction){
                case "up":
                case "left":
                    target = this.$store.getters.findLastVisibleNote(this.note);
                    position = payload.position || (target ? target.text.length: 0);
                    break;
                case "down":
                case "right":
                    target = this.$store.getters.findNextVisibleNote(this.note);
                    position = payload.position || 0
                    break;
            }
            if(position > target.text.length){
                position = target.text.length;
            }
            this.$nextTick(() => {
                this.$store.commit("focus", {note: target, position: position})
            })
        },
        deleteContent(){
            this.focusContent = false;
            if(this.note.content.text.length === 1 && this.note.content.text[0] === '\n'){
                this.$store.dispatch("saveNote", { note: this.note, text: "", type:"content", position: -1});
            }
            this.$store.commit("focus", {note: this.note, position: this.note.text.length})
        },
        mouseenter(event){
            if(event.button === 0){ // pressed
                //addSelection(this)
            }
        }
    }
}
</script>

<style>
.note-item {
    list-style: none;
    position: relative;
    width: 100%;
}
.note-col-6{
    max-width: 50%!important;
}
.note-col-4{
    max-width: 33%!important;
}
.note-col-3{
    max-width: 25%!important;
}
.note-wrapper{
    display: flex;
}
.toolbar{
    position: absolute;
    right: 0;
    margin-right: 1rem;
    opacity: .3;
}
.toolbar:hover{
    opacity: .8;
}
.archived .note-text{
    opacity: .5;
}
.archived>.note-wrapper>div>.note-text{
    text-decoration-line: line-through;
}
</style>