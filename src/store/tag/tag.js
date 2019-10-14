import Vue from "vue";
import _ from "lodash";

export default {
    namespaced: true,
    state: {
        all: {},
        count: 0,
        groups:[],
        recently: [],
    },
    getters:{
        suggests: (state) => (t) => {
            let sortable = [];
            for(const tag in state.all){
                if(!{}.hasOwnProperty.call(state.all, tag)){
                    continue;
                }
                let index = tag.indexOf(t);
                if(index === 0 && tag.length === t.length || index === -1){
                    continue;
                }
                let orderIndex = _.sortedIndexBy(sortable, tag, (tag) => -state.all[tag].lastAdd);
                sortable.splice(orderIndex, 0, tag);
            }
            return sortable;
        }
    },
    mutations: {
        add(state, {tags, note}){
            _.each(tags, (tag) => {
                if(!state.all[tag.text]){
                    Vue.set(state.all, tag.text, { count: 0, group: "", lastAdd: 0});
                    state.count++;
                }
                state.all[tag.text].count++;
                state.all[tag.text].lastAdd = note ? note.id : _.now();

                let index = state.recently.indexOf(tag.text);
                if(index > -1){
                    state.recently.splice(index, 1);
                }
                state.recently.splice(0, 0, tag.text);
            });
            state.recently.splice(20);
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
            if(_.findIndex(state.groups, (g) => g.name === name) === -1){
                state.groups.push({name});
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
                Vue.set(state.all[tag], "group", "");
            }
        },
    },
    actions: {
        replace({commit}, {oldTags, newTags}){
            let removeds = _.differenceBy(oldTags, newTags, "text");
            commit("remove", { tags: removeds });
            let addeds = _.differenceBy(newTags, oldTags, "text");
            commit("add", { tags: addeds });
        },
    }
}