import Vue from "vue"
import traversal from "@/lib/tree"
import parser from "@/lib/parser"

export default {
    state: {
        flattern: {},
    },
    mutations: {
        resetTag(state, notes){
            Vue.set(state, "flattern", {})
            traversal.each(notes, -1, (n) => {
                n.tokens = parser.parse(n.text);
                _.each(n.tokens, (token) => {
                    if(token.type == 'tag'){
                        if(!state.flattern[token.text]){
                            Vue.set(state.flattern, token.text, 0);
                        }
                        state.flattern[token.text]++;
                    }
                })
            })
        },
        replaceTag(state, payload){
            _.each(payload.oldTags, tag => {
                if(state.flattern[tag.text]){
                    state.flattern[tag.text]--;
                    if(state.flattern[tag.text] <= 0){
                        delete state.flattern[tag.text];
                    }
                }
            })
            _.each(payload.newTags, tag => {
                if(!state.flattern[tag.text]){
                    Vue.set(state.flattern, tag.text, 0);
                }
                state.flattern[tag.text]++;
            })
        },
    }
}