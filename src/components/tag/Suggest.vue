<template>
    <div class="suggest" v-if="lastInput.requireSuggest" v-show="suggests.length > 0"
            :style="{top:suggestRect.bottom+'px', left:suggestRect.left+'px'}">
            <v-list dense>
                <v-list-item v-for="(s, i) in suggests" :key="s" @click="appendTag(s)" :class="{selected: selected == i}">
                    <v-list-item-title>{{s}}</v-list-item-title>
                </v-list-item>
            </v-list>
        </div>
</template>

<script>
import range from "@/lib/range"

export default {
    props: ['focus', 'lastInput', 'container', 'composing'],
    data: () => ({
        suggestedEl: null,
        suggests: [],
        selected: 0,
    }),
    watch:{
        lastInput(){
            this.debounceShowSuggest(this.lastInput)
        },
        focus(){
            if(!this.focus){
                setTimeout(() => {
                    this.lastInput.requireSuggest = '';
                    this.suggests = [];
                }, 10);
            }
        }
    },
    computed: {
        suggestRect(){
            let targetRect = range.rect(this.suggestedEl);
            targetRect = targetRect || this.suggestedEl ? this.suggestedEl.getBoundingClientRect() : undefined;
            let elRect = this.container.$el.getBoundingClientRect();
            if(elRect && targetRect){
                return {
                    left:targetRect.left - elRect.left,
                    bottom: targetRect.top - elRect.top + targetRect.height
                };
            }
            return {top:0, bottom:0};
        },
    },
    methods: {
        showSuggest(payload){
            let tokens = payload.type == "content" ? payload.note.content.tokens : payload.note.tokens;
            let lastToken = tokens[tokens.length-1];
            if(lastToken && (lastToken.type ==="tag" || ["#","@"].includes(lastToken.text))){
                this.lastInput.requireSuggest = lastToken.text;
                this.suggestedEl = payload.nativeEvent.target;
                this.suggests = this.$store.getters['tag/suggests'](lastToken.text);
            }else if(lastToken && lastToken.text === ":"){
                this.lastInput.requireSuggest = lastToken.text;
                this.suggestedEl = payload.nativeEvent.target;
                this.suggests = [":😀",":😃",":😄",":😁",":😆",":😅",":😂",":🤣",":😭"]; // todo
            }else{
                this.lastInput.requireSuggest = "";
                this.suggests = [];
            }
        },
        debounceShowSuggest: _.debounce(function(payload){this.showSuggest(payload);}, 500),
        appendTag(tag){
            tag = tag || this.suggests[this.selected];
            if(!tag){
                throw "appendTag";
            }
            let text = this.lastInput.type == "content"? this.lastInput.note.content.text : this.lastInput.note.text;

            text += tag.substring(this.lastInput.requireSuggest.length) + "\xa0";

            let payload = { 
                text: text,
                position: text.length, // change innerHtml must keep position
                type: this.lastInput.type,
                note: this.lastInput.note
            };

            this.$store.dispatch("saveNote", payload)
                .then(() => {
                    this.lastInput.requireSuggest = '';
                    this.suggests = [];
                })
                .then(() => {
                    this.container.afterNoteChange(payload)
                })
        },
        navigationSuggest(payload){
            switch(payload.direction){
                case "down":
                    this.selected++;
                    if(this.selected >= this.suggests.length){
                        this.selected = 0;
                    }
                    break;
                case "up":
                    this.selected--;
                    if(this.selected < 0){
                        this.selected = this.suggests.length-1;
                    }
                    break;
            }
        },
    }
}
</script>

<style>
.selected::before{
    background-color: currentColor;
    top: 0; 
    left: 0;
    width: 100%; 
    height: 100%;
    opacity: .1;
}
</style>