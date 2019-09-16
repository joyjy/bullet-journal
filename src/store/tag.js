import Vue from "vue"
import traversal from "@/lib/tree"
import parser from "@/lib/parser"

export default {
    state: {
        '#': {},
        '@': {},
        '¥': {},
    },
    mutations: {
        resetTag(state, notes){
            Vue.set(state, "#", {})
            Vue.set(state, "@", {})
            Vue.set(state, "¥", {})
            Vue.delete(state, 'flattern')
            traversal.each(notes, -1, (n) => {
                n.tokens = parser.parse(n.text);
                _.each(n.tokens, (token) => {
                    if(token.type == 'tag'){
                        let group = token.text.charAt(0);
                        if(!state[group][token.text]){
                            Vue.set(state[group], token.text, 0);
                        }
                        state[group][token.text]++;
                    }
                })
            })
        },
        replaceTag(state, payload){
            _.each(payload.oldTags, tag => {
                let group = tag.text.charAt(0);
                if(state[group][tag.text]){
                    state[group][tag.text]--;
                    if(state[group][tag.text] <= 0){
                        delete state[group][tag.text];
                    }
                }
            })
            _.each(payload.newTags, tag => {
                let group = tag.text.charAt(0);
                if(!state[group][tag.text]){
                    Vue.set(state[group], tag.text, 0);
                }
                state[group][tag.text]++;
            })
        },
    }
}