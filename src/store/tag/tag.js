import Vue from "vue";
import _ from "lodash";

// {name}

export default {
    namespaced: true,
    state: {
        all: {},
        count: 0,
        groups:[],
        recently: [],
    },
    mutations: {
        add(state, {tags}){
            _.each(tags, tag => {
                if(!state.all[tag.text]){
                    Vue.set(state.all, tag.text, { count: 0, group: '' });
                    state.count++;
                }
                state.all[tag.text].count++;

                let index = state.recently.indexOf(tag.text);
                if(index > -1){
                    state.recently.splice(index, 1);
                }
                state.recently.splice(0, 0, tag.text);
            });
            state.recently.splice(10);
        },
        remove(state, {tags}){
            _.each(tags, tag => {
                if(state.all[tag.text]){
                    state.all[tag.text].count--;
                    if(state.all[tag.text].count <= 0){
                        delete state.all[tag.text];
                        let index = state.recently.indexOf(tag.text);
                        if(index > -1){
                            state.recently.splice(index, 1);
                        }
                        state.count--;
                    }
                }
            });
        },
        addGroup(state, {name}){
            if(_.findIndex(state.groups, (g) => g.name === name) == -1){
                state.groups.push({name:name})
            }
        },
        removeGroup(state, {name}){
            let index = _.findIndex(state.groups, (g) => g.name === name);
            state.groups.splice(index, 1);
        },
        addToGroup(state, {tag, group}){
            Vue.set(state.all[tag], "group", group);
        },
        removeFromGroup(state, {tag}){
            if(state.all[tag]){
                Vue.set(state.all[tag], "group", '');
            }
        },
    }
}