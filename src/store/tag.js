import Vue from "vue"
import traversal from "@/lib/tree"

export default {
    state: {
        flattern: {},
    },
    mutations: {
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