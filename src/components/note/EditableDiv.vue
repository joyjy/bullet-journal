<template>
    <div class="note-text" contenteditable="true" 
        v-html="innerHtml" 
        @focus="editing = true"
        @blur="editing = false"
        @input="inputText($event)" 
        @keypress.enter.prevent="pressEnter($event)" 
        @keyup.delete="pressDelete($event)" 
        @keydown.tab.prevent="pressTab($event)" 
        @keydown.up.prevent="pressNav($event)"
        @keydown.down.prevent="pressNav($event)"
        @keyup.left="pressNav($event)"
        @keyup.right="pressNav($event)">
    </div>
</template>

<script>
import range from "../../lib/range"
import parser from "../../lib/parser"

// keyboard events' $emit
// - [x] new-note(with optional text arg)
// - [x] del-note
// - [x] merge-note(delete self, content merge to prev)
// - [x] downgrade-note
// - [x] upgrade-note
// - [ ] nav-between-note

export default {
    name: "editable-div",
    props: ['note'],
    data(){
        return {
            innerHtml: "",
            editing: false,
            beforeDelete: "",
        }
    },
    created: function() {
        this.innerHtml = parser.html(this.note)
        this.beforeDelete = this.note.text;
    },
    mounted: function(){
        if(this.note.display.cursor > -1){ // new created or recreated(up/down)
            this.$nextTick(() => {
                range.focus(this.$el, this.note.display.cursor);
            })
        }
    },
    computed: {
        text(){
            return this.note.text;
        },
        cursor(){
            return this.note.display.cursor;
        }
    },
    watch: {
        text: function(){
            this.innerHtml = parser.html(this.note)
            if(this.editing){
                this.$nextTick(() => {
                    range.focus(this.$el, this.note.display.cursor)
                })
            }
        },
        cursor: function(cursor, old){
            if(cursor >= 0){
                range.focus(this.$el, cursor)
            }
        },
        editing(){
            if(!this.editing){
                this.$store.commit("unfocus", this.note);
            }
        }
    },
    methods: {
        inputText(e){
            // console.log(e);
            if(e.isComposing && e.data == "　"){ // ime hasn't submit 
                return;
            }
            if(e.data){ // only insert has data
                this.beforeDelete = e.target.innerText;
            }
            let payload = { 
                text: e.target.innerText,
                position: range.position(this.$el)
            };
            this.$emit("input", payload)
        },
        pressEnter(e){
            // console.log(e);
            let text = e.target.innerText;
            let position = range.position(this.$el);
            if (position < text.length) {
                let left = text.substring(0, position);
                this.$emit('input', left)
                this.$emit('new-note', text.substring(position))
            } else{
                this.$emit('new-note');
            }
        },
        pressDelete(e){
            //console.log(e, e.target.innerText, this.beforeDelete, range.position(this.$el));
            if(e.isComposing){ // ime hasn't submit 
                return;
            }
            let text = e.target.innerText;
            let position = range.position(this.$el);

            if(this.beforeDelete == ""){
                this.$emit('del-note', {keyboard:true})
            }else if(text == this.beforeDelete && position == 0){
                this.$emit('merge-note')
            }
            this.beforeDelete = text;
        },
        pressTab(e){
            // console.log(e);
            if(e.shiftKey){
                this.$emit("upgrade-note", {position: range.position(this.$el)})
            }else{
                this.$emit("downgrade-note", {position: range.position(this.$el)})
            }
        },
        pressNav(e){
            //left arrow          37
            //up arrow            38
            //right arrow         39
            //down arrow          40
            // console.log(e);
            if(e.keyCode == 37){
                let position = range.position(this.$el)
                if(position == 0){
                    this.$emit("nav-between-note", "left");
                }
            }else if(e.keyCode == 39){
                let position = range.position(this.$el)
                if(position == this.beforeDelete.length){ // todo
                    this.$emit("nav-between-note", "right");
                }
            }else if(e.keyCode == 38){
                this.$emit("nav-between-note", { direction: "up", position: range.position(this.$el) });
            }else if(e.keyCode == 40){
                this.$emit("nav-between-note", { direction: "down", position: range.position(this.$el) })
            }
        }
    }
}
</script>

<style>
[contenteditable="true"]{
    width: 96%;
}
[contenteditable="true"]:active,[contenteditable="true"]:focus{
    border:none;
    outline:none;
}
span.tag{
    color:cadetblue;
    cursor: pointer;
}
</style>