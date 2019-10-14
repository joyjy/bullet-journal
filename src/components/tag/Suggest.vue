<template>
    <v-card class="suggest" v-if="lastInput.requireSuggest" v-show="suggests.length > 0"
        :style="{top:suggestRect.bottom+'px', left:suggestRect.left+'px'}">
        <v-list dense :class="{emoji:emoji}">
            <v-list-item v-for="(s, i) in suggests" :key="s" @click="appendTag(s)" :class="{selected: selected == i}">
                <v-list-item-title>{{s}}</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-card>
</template>

<script>
import range from "@/lib/range"
import search from "@jukben/emoji-search"

export default {
    props: ['focus', 'lastInput', 'container', 'composing'],
    data: () => ({
        suggestedEl: null,
        suggests: [],
        selected: 0,
    }),
    watch:{
        lastInput(){
            this.showSuggest(this.lastInput)
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
            targetRect = targetRect || (this.suggestedEl ? this.suggestedEl.getBoundingClientRect() : undefined);
            let elRect = this.container.$el.getBoundingClientRect();
            if(elRect && targetRect){
                return {
                    left: targetRect.left - elRect.left,
                    bottom: targetRect.top - elRect.top + targetRect.height
                };
            }
            return {top:0, bottom:0};
        },
        emoji(){
            return this.lastInput.requireSuggest && this.lastInput.requireSuggest[0] === ":"
        }
    },
    methods: {
        showSuggest(payload){

            let tokens = payload.type == "content" ? payload.note.content.tokens : payload.note.tokens;
            let lastToken = tokens[tokens.length-1];
            if(!lastToken || lastToken.type !== "tag" && !["#","@",':'].includes(lastToken.text[0])){
                this.lastInput.requireSuggest = "";
                this.suggests = [];
                return;
            }

            this.lastInput.requireSuggest = lastToken.text;
            this.suggestedEl = payload.nativeEvent.target;
            this.suggests = _.take(this.$store.getters['tag/suggests'](lastToken.text), 7);

            if(this.suggests.length == 0){
                if(lastToken.text[0] !== ':'){
                    this.lastInput.requireSuggest = "";
                }else{
                    let emojis = search(lastToken.text.substring(1)).map((e) => ":"+e.char+":"+e.name);
                    this.suggests = _.take(emojis, 7);
                }
            }
        },
        appendTag(tag){
            tag = tag || this.suggests[this.selected];
            if(!tag){
                throw "appendTag";
            }
            let text = this.lastInput.type == "content"? this.lastInput.note.content.text : this.lastInput.note.text;
            text = text.slice(0, -this.lastInput.requireSuggest.length);
            if(this.emoji){
                tag = tag.substring(0, tag.lastIndexOf(":"))
            }

            text += tag + "\xa0";

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
.suggest{
    position: absolute;
    min-width: 100px;
    z-index: 2;
}
.suggest .v-list-item{
    min-height: 1.2rem;
    font-weight: initial;
}
.suggest .v-list-item.selected::before{
    background-color: currentColor;
    top: 0; 
    left: 0;
    width: 100%; 
    height: 100%;
    opacity: .1;
}
</style>