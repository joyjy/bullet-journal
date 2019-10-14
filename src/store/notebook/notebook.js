import _ from "lodash";

import diary from "@/lib/template/diary"
import { Notebook } from "../../model/notebook";

export default {
    namespaced: true,
    state: {
        list:[

        ]
    },
    getters:{
        findByName: (state) => (name) => {
            let notebook =  _.find(state.list, n => n.name === name);

            if(notebook){
                switch(notebook.template){
                    case 'diary':
                        let result = new Notebook();
                        _.assign(result, notebook);
                        _.assign(result, diary);
                        _.assign(result, notebook.params);
                        return result;
                }
            }

            return notebook;
        }
    },
    mutations: {
        add(state, {notebook}){
            state.list.push(notebook);
        },
        remove(state, {name}){
            _.remove(state.list, n => n.name == name)
        }
    },
    actions: {
        add({commit}, payload){
            
            let notebook = new Notebook({
                name: payload.name,
                template: payload.template,
            })

            commit("add", {notebook})
        },
    }
}