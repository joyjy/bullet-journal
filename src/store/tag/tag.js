import Vue from "vue";
import _ from "lodash";

export default {
    namespaced: true,
    state: {
        "#": {},
        "@": {},
        "¥": {},
        count: 0,
    },
    mutations: {
        add(state, {tags}){
            _.each(tags, tag => {
                let group = tag.text.charAt(0);
                if(!state[group][tag.text]){
                    Vue.set(state[group], tag.text, 0);
                    state.count++;
                }
                state[group][tag.text]++;
            });
        },
        remove(state, {tags}){
            _.each(tags, tag => {
                let group = tag.text.charAt(0);
                if(state[group][tag.text]){
                    state[group][tag.text]--;
                    if(state[group][tag.text] <= 0){
                        delete state[group][tag.text];
                        state.count--;
                    }
                }
            });
        },
    }
}