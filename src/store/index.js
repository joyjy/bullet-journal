import Vue from "vue";

import Vuex from "vuex";
Vue.use(Vuex);

import { modules, reducer } from "./modules";

import VuexPersist from "vuex-persist";
const vuexPersist = new VuexPersist({
    key: "bullet-note",
    storage: window.localStorage,
    reducer,
});

import undoRedoPlugin, {undoRedoHistory} from "./plugins/undo";
import syncPlugin from "./plugins/sync";

import dataAPI from "@/api/data";
import userAPI from "@/api/user";

import _ from "lodash";
import traversal from "@/lib/tree";

const store = new Vuex.Store({
    strict: true,
    plugins: [vuexPersist.plugin, undoRedoPlugin, syncPlugin],
    modules,
    state: {
        notes: [], // notes as tree
        flattern: [], // notes as table
        loading: false,
        lastChanged: 0,
        lastSynced: 0
    },
    getters: {
        findNoteStackById: (state) => (id) => {
            return traversal.path(state.notes, (note) => note.id === parseInt(id, 10));
        },
        findNoteBy: (state) => (predicate, parent) => {
            let from = parent || state;
            return traversal.find(from.notes, (note) => predicate(note));
        },
        findLastVisibleNote: (state) => (note) => {
            let prev = traversal.find(state.notes, (n, p) => {
                return (!note || n.total < note.total)
                        && modules["note-display"].visible(n, p);
            }, {reserve:true, stop: (n) => n.archived || n.display.collapsed});
            return prev || note;
        },
        findNextVisibleNote: (state) => (note) => {
            let next = traversal.find(state.notes, (n, p) => {
                return n.total > note.total && modules["note-display"].visible(n, p);
            }, {stop: (n) => n.archived || n.display.collapsed});
            return next || note;
        },
        findNoteByPathText: (state) => (path) => {
            let parent = state;
            for (let i = 0; i < path.length; i++) {
                let text = path[i];
                let found = _.find(parent.notes, (n) => n.text.replace(/\xa0/g, " ") === text);
                if(!found){
                    return null;
                }
                parent = found;
            }
            return parent;
        },
    },
    mutations: {
        undo(state){
            undoRedoHistory.undo(state);
        },
        flattern(state){
            let start = _.now();
            state.flattern = traversal.flattern(state.notes);
            console.log("flattern", (_.now()-start)+"ms");
        },
        loading(state, isLoading){
            state.loading = isLoading;
        },
        lastSynced(state, number){
            state.lastSynced = number;
        },
        lastChanged(state, number){
            state.lastChanged = number;
        }
    },
    actions: {
        async init({commit, state}){

            if(state.user.token){

                commit('loading', true);
                let result = await dataAPI.getData(state.user.token);
                if(result.result){
                    if(result.data.lastChanged > state.lastChanged){
                        result.data.notebook = {list:[]};
                        this.replaceState(result.data)
                        commit("flattern")
                    }
                    commit("lastSynced", result.lastModified);
                }else if(result.unauthorized){
                    commit("signOut")
                }
                commit('loading', false);
            }
        },
        async loading({state, commit}){
            commit('loading', true);
            let user = userAPI.getUser(state.user.token);
            let result = await dataAPI.getData(state.user.token);
            if(result.result){
                if(result.data.lastChanged > state.lastChanged){
                    result.data.notebook = {list:[]};
                    this.replaceState(result.data)
                    commit("flattern")
                }
                commit("lastSynced", result.data.lastChanged);
                user.then(({result, message, data}) => {
                    if(result){
                        commit("setUser", data)
                    }
                });
            }else if(result.unauthorized){
                commit("signOut")
            }
            commit('loading', false);
        },
        async save({state, commit}){
            let result = await dataAPI.saveData(state);
            if(result.result){
                commit("lastSynced", result.data.time)
            }else if(result.unauthorized){
                commit("signOut")
            }
        },
    }
});

export default store