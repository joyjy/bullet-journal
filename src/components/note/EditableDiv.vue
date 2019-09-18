<template>
    <div :class="'note-' + (type || 'text')" contenteditable="true" 
        v-html="innerHtml" 
        @focus="editing = true; $emit('editing', editing)"
        @blur="editing = false; $emit('editing', editing)"
        @input="inputText" 
        @keypress.enter.prevent="pressEnter" 
        @keyup.delete="pressDelete" 
        @keydown.tab.prevent="pressTab" 
        @keydown.up.prevent="pressNav"
        @keydown.down.prevent="pressNav"
        @keyup.left="pressNav"
        @keyup.right="pressNav"
        @dblclick.capture="click">
    </div>
</template>

<script>
import Vue from "vue"
import moment from "moment"
import range from "@/lib/range"
import parser from "@/lib/parser"

export default {
    props: ['note', 'match', 'type'],
    data(){
        return {
            innerHtml: "",
            editing: false,
            beforeDelete: "",
        }
    },
    created: function() {
        this.innerHtml = parser.html(this.note, this.match, this.type)
        this.beforeDelete = this.text;
    },
    mounted: function(){
        this.$eventbus.$on('timestamp', () => {})
        if(Number.isInteger(this.note.display.cursor)){ // todo old spec
            return
        }
        if(this.note.display.cursor.text > -1){ // new created or recreated(up/down)
            this.$nextTick(() => {
                range.focus(this.$el, this.note.display.cursor.text);
            })
        }
    },
    destroyed: function(){
        this.$eventbus.$off('timestamp', () => {})
    },
    computed: {
        text(){
            if(this.type == 'content'){
                return this.note.content;
            }
            return this.note.text;
        },
        cursor(){
            if(this.type == 'content'){
                return this.note.display.cursor.content;
            }
            if(Number.isInteger(this.note.display.cursor)){
                return this.note.display.cursor;
            }
            return this.note.display.cursor.text;
        }
    },
    watch: {
        match: function(){
            this.innerHtml = parser.html(this.note, this.match, this.type);
        },
        text: function(){
            this.innerHtml = parser.html(this.note, this.match, this.type);
            if(this.editing){
                this.$nextTick(() => {
                    range.focus(this.$el, this.cursor)
                })
            }
        },
        cursor: function(){
            if(this.cursor >= 0){
                range.focus(this.$el, this.cursor)
            }
        },
        editing(){
            if(!this.editing){
                this.$store.commit("unfocus", { note: this.note});
            }
        }
    },
    methods: {
        inputText(e){
            // console.log(e);
            if(e.inputType == "historyUndo"){
                return; // document will handle ctrl+z
            }
            if(e.isComposing && e.data == "　"){ // ime hasn't submit 
                return;
            }
            if(e.data){ // only insert has data
                this.beforeDelete = e.target.innerText;
            }
            let payload = { 
                text: e.target.innerText,
                type: this.type,
                position: range.position(this.$el)
            };
            this.$emit("input", payload)
        },
        pressEnter(e){
            // console.log(e);
            switch(this.type){
                case 'content':
                    this.$emit('input', {text: this.note.content + "\n", position: this.note.content.length})
                    break;
                default:
                    if(e.shiftKey){
                        if(!this.note.content.text){
                            this.$emit('new-content', { text:"", position: 0, type:'content'})
                        }
                        return;
                    }
                    let text = e.target.innerText;
                    let position = range.position(this.$el);
                    if (position < text.length) {
                        let left = text.substring(0, position);
                        let right = text.substring(position);
                        this.$emit('new-note', {text:left, last: true})
                        this.$nextTick(() => {
                            this.$emit('input', { text:right, position: -1})
                            this.$store.commit("focus", { note: this.note, position: 0});
                        })
                    } else { // new at last
                        this.$emit('new-note', {});
                    }
                    break;
            }
        },
        pressDelete(e){
            console.log(e, e.target.innerText, this.beforeDelete, range.position(this.$el));
            switch(this.type){
                case 'content':
                    break;
                default:
                    if(e.isComposing){ // ime hasn't submit 
                        this.beforeDelete =  e.target.innerText;
                        return;
                    }
                    let text = e.target.innerText;
                    let position = range.position(this.$el);

                    if(this.beforeDelete == "" || text == this.beforeDelete && position == 0){
                        this.$emit('del-note', {keyboard:true})
                    }
                    this.beforeDelete = text;
                    break;
            }
        },
        pressTab(e){
            if(this.type == 'content'){
                return;
            }
            // console.log(e);
            if(e.shiftKey){
                this.$emit("upgrade-note", {position: range.position(this.$el)})
            }else{
                this.$emit("downgrade-note", {position: range.position(this.$el)})
            }
        },
        pressNav(e){
            // left arrow          37
            // up arrow            38
            // right arrow         39
            // down arrow          40
            // console.log(e);
            if(this.type == 'content'){
                return;
            }
            let position = range.position(this.$el)
            if(e.keyCode == 37){
                if(position == 0){
                    this.$emit("nav-between-note", "left");
                }
            }else if(e.keyCode == 39){
                if(position == this.beforeDelete.length){
                    this.$emit("nav-between-note", "right");
                }
            }else if(e.keyCode == 38){
                if(e.shiftKey){
                    this.$emit("up-note", { position: position });
                }else{
                    this.$emit("nav-between-note", { direction: "up", position: position });
                }
            }else if(e.keyCode == 40){
                if(e.shiftKey){
                    this.$emit("down-note", { position: position });
                }else{
                    this.$emit("nav-between-note", { direction: "down", position: position })
                }
            }
        },
        click(e){
            if(e.target.classList.contains('tag')){
                this.$eventbus.$emit('search', e.target.innerText)
            }else if(e.target.classList.contains('matched')){
                this.$eventbus.$emit('search', '')
            }
        }
    }
}
</script>

<style>
[contenteditable="true"]{
    width: calc(100% - 2rem);
}
[contenteditable="true"]:active,[contenteditable="true"]:focus{
    border:none;
    outline:none;
}
.note-content{
    font-size: 13px;
    color: #757575; /* grey darken-1 */
    white-space: pre-wrap;
}
span.tag{
    color:#78909C; /*blue-grey lighten-1*/
    cursor: pointer;
}
span.state{
    padding: 0 .2rem;
    margin-right: .1rem;
    border-radius: 2px;
    background-color: #757575; /*grey darken-1*/
    font-weight: 700; /*.font-weight-bold */
    color: #ffffff;
    cursor: pointer;
}
span.state.todo{
    background-color: #FDD835 /* yellow darken-1 */
}
span.state.done{
    background-color: #7CB342 /* light-green darken-1 */
}
span.state.time{
    color: #78909C; /*blue-grey lighten-1*/
    background-color: inherit;
}
span.matched{
    background-color: #FFF9C4;  /* yellow lighten-4 */
    border: 1px solid #E0E0E0; /* grey lighten-2 */
}
span.state > .matched{
    color: #424242; /* grey darken-3 */
}
</style>