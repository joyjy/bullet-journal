<template>
    <div class="suggest" v-if="requireSuggest" v-show="suggests.length > 0"
            :style="{top:suggestRect.bottom+'px', left:suggestRect.left+'px'}">
            <v-list dense>
                <v-list-item v-for="s in suggests" :key="s" @click="appendTag(s)">
                    <v-list-item-title>{{s}}</v-list-item-title>
                </v-list-item>
            </v-list>
        </div>
</template>

<script>
import range from "@/lib/range"

export default {
    props: ['focus', 'lastInput', 'container'],
    data: () => ({
        requireSuggestType: '',
        requireSuggest: '',
        suggestedEl: null,
        suggests: [],
    }),
    watch:{
        lastInput(){
            this.debounceShowSuggest(this.lastInput)
        },
        focus(){
            if(!this.focus){
                setTimeout(() => {
                    this.requireSuggest = '';
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
                this.requireSuggestType = payload.type;
                this.requireSuggest = lastToken.text;
                this.suggestedEl = payload.nativeEvent.target;
                this.suggests = this.$store.getters['tag/suggests'](lastToken.text);
            }else if(lastToken && lastToken.text[0] === ":"){
                this.requireSuggestType = payload.type;
                this.requireSuggest = lastToken.text;
                this.suggestedEl = payload.nativeEvent.target;
                this.suggests = ["😀","😃","😄","😁","😆","😅","😂","🤣","😭"]; // todo
            }else{
                this.requireSuggest = "";
                this.suggests = [];
            }
        },
        debounceShowSuggest: _.debounce(function(payload){this.showSuggest(payload);}, 500),
        appendTag(tag){
            let text = this.lastInput.type == "content"? this.lastInput.note.content.text : this.lastInput.note.text;

            text += tag.substring(this.requireSuggest.length) + "\xa0";

            let payload = { 
                text: text,
                position: text.length, // change innerHtml must keep position
                type: this.lastInput.type,
                note: this.lastInput.note
            };

            this.$store.dispatch("saveNote", payload)
                .then(() => {
                    this.requireSuggest = '';
                    this.suggests = [];
                })
                .then(() => {
                    this.container.afterNoteChange(payload)
                })
        },
        navigationSuggest(payload){
            console.log(payload)
        },
    }
}
</script>

<style>

</style>