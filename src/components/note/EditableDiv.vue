<template>
    <div :class="['note-' + (type || 'text'), {editing: editing}]" contenteditable="true" 
        v-html="innerHtml" 
        @focus="editing = true"
        @blur="editing = false"
        @input="inputText" 
        @keydown.delete="pressDelete" 
        @keypress.enter.prevent="pressEnter" 
        @keydown.tab.prevent="pressTab" 
        @keydown.up.prevent="pressNav"
        @keydown.down.prevent="pressNav"
        @keydown.left="pressNav"
        @keydown.right="pressNav"
        @dblclick.capture="click('dbl', $event)"
        @click.capture="click('sgl', $event)">
    </div>
</template>

<script>
import Vue from "vue"

import moment from "moment"

import range from "@/lib/range"
import parser from "@/lib/parser"

export default {
    props: ["note", "match", "type"],
    data(){
        return {
            innerHtml: "",
            editing: false,
        }
    },
    created: function() {
        this.innerHtml = parser.html(this.note, this.match, this.type)
    },
    mounted: function(){
        console.log("mounted")
        if(this.cursor > -1){ // new created
            this.$nextTick(() => {
                range.focus(this.$el, this.cursor);
            })
        }
    },
    computed: {
        text(){
            if(this.type == "content"){
                return this.note.content;
            }
            return this.note.text;
        },
        cursor(){
            if(this.type == "content"){
                return this.note.display.content.cursor;
            }
            return this.note.display.text.cursor;
        }
    },
    watch: {
        match: function(){
            this.innerHtml = parser.html(this.note, this.match, this.type);
        },
        text: function(){
            this.innerHtml = parser.html(this.note, this.match, this.type);
            console.log("text")
            if(this.editing){ // change innerHtml must keep position
                this.$nextTick(() => {
                    range.focus(this.$el, this.cursor)
                })
            }
        },
        cursor: function(to, from){
            console.log("cursor", from, to)
            if(!this.editing && to > 0){ // after other note event, may lead this getting focus
                this.$nextTick(() => {
                    range.focus(this.$el, this.cursor)
                })
            }
        },
        editing: function(){
            if(this.editing){ // mouse range not accurate

            }else{
                this.$store.commit("unfocus", {note:this.note});
            }
        }
    },
    methods: {
        inputText(e){
            if(e.isComposing && e.data == "　"){ // ime hasn"t submit 
                return;
            }
            
            let payload = { 
                text: e.target.innerText,
                position: range.position(this.$el), // change innerHtml must keep position
                type: this.type,
            };

            this.$emit("input", payload)
        },
        pressDelete(e){
            if(this.type == "content"){
                return;
            }

            console.log(e)

            if(e.isComposing){ // ime hasn"t submit 
                return;
            }

            if(range.position(this.$el) == 0){
                this.$emit("del-note", { keyboard:true })
                e.preventDefault();
            }
        },
        pressEnter(e){
            if(this.type == "content"){
                return;
            }

            if(e.shiftKey){
                if(!this.note.content.text){
                    this.$emit("new-content", {
                        text: "",
                        position: 0,
                        type:"content"
                    })
                }
                return;
            }

            let text = e.target.innerText;
            let position = range.position(this.$el);
            if (position < text.length) { // split
                let left = text.substring(0, position);
                let right = text.substring(position);

                this.$emit("new-note", { text: left, prev: true, position: -1}) // default add at next
                this.$emit("input", { text:right, position: 0})
                return;
            }
            
            this.$emit("new-note", {curPosition: range.position(this.$el)});
        },
        pressTab(e){
            if(this.type == "content"){
                return;
            }
            if(e.shiftKey){
                this.$emit("upgrade-note", { position: range.position(this.$el) })
            }else{
                this.$emit("downgrade-note", { position: range.position(this.$el) })
            }
        },
        pressNav(e){
            // left arrow          37
            // up arrow            38
            // right arrow         39
            // down arrow          40

            if(this.type == "content"){
                return;
            }

            let position = range.position(this.$el)
            switch(e.keyCode){
                case 37: //left
                    if(position == 0){
                        this.$emit("nav-between-note", { direction: "left" });
                        e.preventDefault()
                    }else{
                        this.$store.commit("focus", {note: this.note, position: position-1})
                    }
                    break;
                case 39: //right
                    if(position == this.text.length){
                        this.$emit("nav-between-note", { direction: "right" });
                        e.preventDefault()
                    }else{
                        this.$store.commit("focus", {note: this.note, position: position+1})
                    }
                    break;
                case 38: // up
                    if(e.shiftKey){
                        this.$emit("up-note", { position: position });
                    }else{
                        this.$emit("nav-between-note", { direction: "up", position: position });
                    }
                    break;
                case 40: // down
                    if(e.shiftKey){
                        this.$emit("down-note", { position: position });
                    }else{
                        this.$emit("nav-between-note", { direction: "down", position: position })
                    }
            }
        },
        click(type, e){
            if(type != this.$store.state.settings.note.clickType){
                return;
            }

            if(this.$route.name != "note"){
                this.$router.push({ name:"note", query: {q: e.target.innerText}});
            }else{
                if(e.target.classList.contains("tag")){
                    this.$eventbus.$emit("search", e.target.innerText)
                }else if(e.target.classList.contains("matched")){
                    this.$eventbus.$emit("search", "")
                }
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
.note-text{
    padding-top:.125rem;
    padding-bottom: .125rem;
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