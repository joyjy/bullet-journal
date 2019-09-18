import Vue from "vue"

export default {
    namespaced: true,
    state: {
        '#': {},
        '@': {},
        '¥': {},
    },
    mutations: {
        add(state, {tags}){
            _.each(tags, tag => {
                let group = tag.text.charAt(0);
                if(state[group][tag.text]){
                    state[group][tag.text]--;
                    if(state[group][tag.text] <= 0){
                        delete state[group][tag.text];
                    }
                }
            })
        },
        remove(state, {tags}){
            _.each(tags, tag => {
                let group = tag.text.charAt(0);
                if(!state[group][tag.text]){
                    Vue.set(state[group], tag.text, 0);
                }
                state[group][tag.text]++;
            })
        },
        replace(state, {oldTags, newTags}){
            this.remove(state, {tags:oldTags})
            this.add(state, {tags:newTags})
        },
    }
}