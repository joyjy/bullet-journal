<template>
    <div class="note-text" contenteditable="true" 
        v-html="innerText" 
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
import Range from "./Range.vue"

// keyboard events' $emit
// - [x] new-note(with optional text arg)
// - [x] del-note
// - [x] merge-note(delete self, content merge to prev)
// - [x] downgrade-note
// - [x] upgrade-note
// - [ ] nav-between-note

export default {
    name: "editable-div",
    props: ['value'],
    data(){
        return {
            innerText: this.value, // display note.text
            editing: false,
            beforeDelete: this.value,
            position: Range.position,
            focus: Range.focus,
            focusAt: Range.focusAt
        }
    },
    watch: {
        'value'(){
            let position
            if(this.editing){
                position = this.position();
            }
            this.innerText = this.value;
            if(this.editing){
                this.$nextTick(() =>{
                    this.focusAt(position)
                })
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
            this.$emit("input", e.target.innerText)
        },
        pressEnter(e){
            // console.log(e);
            let text = e.target.innerText;
            let position = this.position();
            if (position < text.length) {
                let left = text.substring(0, position);
                this.$emit('input', left)
                this.$emit('new-note', text.substring(position))
            } else{
                this.$emit('new-note');
            }
        },
        pressDelete(e){
            // console.log(e);
            let text = e.target.innerText;
            let position = this.position();

            if(this.beforeDelete == ""){
                this.$emit('del-note')
            }else if(text == this.beforeDelete && position == 0){
                this.$emit('merge-note')
            }
            this.beforeDelete = text;
        },
        pressTab(e){
            // console.log(e);
            if(e.shiftKey){
                this.$emit("upgrade-note")
            }else{
                this.$emit("downgrade-note")
            }
        },
        pressNav(e){
            //left arrow          37
            //up arrow            38
            //right arrow         39
            //down arrow          40
            // console.log(e);
            if(e.keyCode == 37){
                let position = this.position()
                if(position == 0){
                    this.$emit("nav-between-note", "left");
                }
            }else if(e.keyCode == 39){
                let position = this.position()
                if(position == this.value.length){
                    this.$emit("nav-between-note", "right");
                }
            }else if(e.keyCode == 38){
                this.$emit("nav-between-note", "up")
            }else if(e.keyCode == 40){
                this.$emit("nav-between-note", "down")
            }
        }
    }
}
</script>

<style>
[contenteditable="true"]{
    width: 100%;
}
[contenteditable="true"]:active,[contenteditable="true"]:focus{
    border:none;
    outline:none;
}
</style>