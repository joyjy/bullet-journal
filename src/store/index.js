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

import _ from "lodash";
import traversal from "@/lib/tree";

const store = new Vuex.Store({
    strict: true,
    plugins: [vuexPersist.plugin, undoRedoPlugin, syncPlugin],
    modules,
    state: {
        notes: [], // notes as tree
        flattern: [], // notes as table
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
        lastSynced(state, number){
            state.lastSynced = number;
        },
        lastChanged(state, number){
            state.lastChanged = number;
        }
    },
    actions: {
        async init({commit, state}){

            let {result, message, data} = await dataAPI.load(state.user.token);
            if(result){
                // todo merge from server
                commit("lastSynced", data.lastModified);
            }

            return new Promise((resolve) => setTimeout(() => {

                let start = _.now();

                if(state.notes.length === 0){
                    this.dispatch("newNote", {});
                }else{
                    commit("flattern");
                }

                //_.each(state.flattern, function([n]){
                    //commit("unfocus", {note:n})
                    //let tags = [];
                    //_.each(n.tokens, function(t){
                        // if(t.type === "tag"){
                        //     tags.push(t);
                        // }
                    //});
                    //commit("tag/add", {tags, note:n});

                    // commit("agenda/count", {note: n})
                    // commit("agenda/add", {note: n})
                //});

                console.log("init", (_.now()-start)+"ms");
                resolve();
            }, 0));
        },
        async save({state, commit}){
            let {result, message, data } = await dataAPI.save(state);
            if(result){
                commit("lastSynced", data.time)
            }
        },
    }
});

export default store