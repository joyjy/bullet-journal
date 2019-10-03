<template>
    <div :class="['note-' + (type || 'text'), {imeSpace: text.includes('　')}]" contenteditable="true" 
        v-html="innerHtml" 
        @focus="editing = true"
        @blur="editing = false"
        @input="inputText" 
        @keydown.delete="pressDelete" 
        @keypress.enter.prevent="pressEnter" 
        @keydown.tab.prevent="pressTab" 
        @keydown.up="pressNav"
        @keydown.down="pressNav"
        @keydown.left="pressNav"
        @keydown.right="pressNav"
        @dblclick.capture="click('dbl', $event)"
        @click.capture="click('sgl', $event)">
    </div>
</template>

<script>
import Vue from "vue";
import { mapState, mapGetters, mapMutations } from "vuex"
import _ from "lodash";
import moment from "moment";

import range from "@/lib/range"
import parser from "@/lib/parser"

export default {
    props: ["note", "match", "type"],
    data(){
        return {
            innerHtml: "",
            editing: false,
            swapDown: false,
        }
    },
    created: function() {
        this.innerHtml = parser.html(this.note, this.match, this.type)
    },
    mounted: function(){
        if(this.cursor > -1){ // new created
            this.$nextTick(() => {
                range.focus(this.$el, this.cursor);
            })
        }
    },
    computed: {
        ...mapGetters('state', ["nextState"]),
        text(){
            if(this.type == "content"){
                return this.note.content.text;
            }
            return this.note.text;
        },
        cursor(){
            if(this.type == "content"){
                return this.note.display.content.cursor;
            }
            return this.note.display.text.cursor;
        },
    },
    watch: {
        match: function(){
            this.innerHtml = parser.html(this.note, this.match, this.type);
        },
        text: function(){
            this.innerHtml = parser.html(this.note, this.match, this.type);
            if(this.editing){ // change innerHtml must keep position
                this.$nextTick(() => {
                    range.focus(this.$el, this.cursor)
                })
            }
        },
        cursor: function(to, from){
            if(!this.editing && this.cursor > -1){ // after other note event, may lead this getting focus
                this.$nextTick(() => {
                    range.focus(this.$el, this.cursor)
                })
            }
        },
        editing: function(to, from){
            if(this.editing){
                // mouse range not accurate so do not record position
            }else{
                if(this.swapDown){ // swapDown(Shift + ↓ will trigger blur )
                    range.focus(this.$el, this.cursor); // refocus
                    this.swapDown = false;
                }else{
                    this.$store.commit("unfocus", {note:this.note});
                }
            }
            this.$emit("editing", this.editing)
        }
    },
    methods: {
        inputText(e){
            if(e.isComposing && e.data == "　"){ // ime hasn"t submit 
                this.$emit("composing", true);
                return;
            }
            this.$emit("composing", false);
            
            let payload = { 
                text: e.target.innerText,
                position: range.position(this.$el), // change innerHtml must keep position
                type: this.type,
                nativeEvent: e,
            };

            this.$emit("input", payload)
        },
        pressDelete(e){
            if(e.isComposing){ // ime hasn"t submit 
                this.$emit("composing", true);
                return;
            }
            this.$emit("composing", false);

            let [position, length] = range.positionAndLength(this.$el);
            if(position == 0 && length == 0){
                if(this.type == "content"){
                    this.$emit("del-content")
                }else{
                    this.$emit("del-note", { keyboard:true })
                }
                e.preventDefault();
            }
        },
        pressEnter(e){
            if(this.type == "content"){

                let payload = { 
                    text: e.target.innerText + "\n",
                    position: range.position(this.$el)+1, // change innerHtml must keep position
                    type: this.type,
                };

                this.$emit("input", payload)
                return;
            }

            if(e.shiftKey){
                if(!this.note.content.text){
                    this.$emit("new-content", {
                        text: "",
                        position: 0,
                        type:"content"
                    });
                }
                return;
            }

            let text = e.target.innerText;
            let position = range.position(this.$el);
            if (position < text.length) { // split
                let left = text.substring(0, position);
                let right = text.substring(position);

                let batchId = _.now();
                this.$emit("input", { text: right, position: 0, batchId: batchId});
                this.$emit("new-note", { text: left, prev: true, position: -1, batchId: batchId}); // default add at next
                return;
            }
            
            this.$emit("new-note", {
                keyboard: true,
                curPosition: range.position(this.$el)
            });
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

            let handled = false;

            if(this.type == "content"){
                return;
            }

            let position = range.position(this.$el)
            switch(e.keyCode){
                case 37: //left
                    if(position == 0){
                        handled = this.$emit("nav-between-note", { direction: "left" });
                    }else{
                        this.$store.commit("focus", {note: this.note, position: position-1})
                    }
                    break;
                case 39: //right
                    if(position == this.text.length){
                        handled = this.$emit("nav-between-note", { direction: "right" });
                    }else{
                        this.$store.commit("focus", {note: this.note, position: position+1})
                    }
                    break;
                case 38: // up
                    if(e.shiftKey){
                        handled = this.$emit("up-note", { position: position });
                    }else{
                        handled = this.$emit("nav-between-note", { direction: "up", position: position });
                    }
                    break;
                case 40: // down
                    if(e.shiftKey){
                        this.swapDown = true;
                        handled = this.$emit("down-note", { position: position });
                    }else{
                        handled = this.$emit("nav-between-note", { direction: "down", position: position })
                    }
                    break;
            }

            if(handled){
                e.preventDefault();
                e.stopPropagation();
            }
        },
        targetType(dom, target){
            return dom.classList.contains(target) || dom.classList.contains("matched") && dom.parentElement.classList.contains(target)
        },
        click(type, e){
            if(navigator.platform.indexOf('Mac') > -1 && event.metaKey || event.ctrlKey){
                if(this.targetType(e.target, "state")){
                        
                    let nextStateText = this.nextState(this.note);
                    if(nextStateText){
                        this.$emit("input", { 
                            text: nextStateText,
                            position: -1,
                            type: this.type,
                        })
                    }
                }else if(this.targetType(e.target, "link")){
                    window.open(e.target.getAttribute("href"), "_blank");
                }
                return;
            }

            if(type != this.$store.state.settings.note.clickType){
                return;
            }

            if(e.target.classList.contains("matched")){
                this.$eventbus.$emit("search", "")
                return;
            }

            if(e.target.classList.contains("tag") || e.target.classList.contains("state")){
                if(this.$route.name != "note"){
                    this.$router.push({ name:"note", query: {q: e.target.innerText}});
                }else{
                    this.$eventbus.$emit("search", e.target.innerText);
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
.imeSpace{
    text-decoration: dashed underline pink;
}
</style>