import Vue from "vue";
// --- vuex ---
import Vuex from "vuex";
Vue.use(Vuex);
import {vuexPersist, vuexPersistCookie} from "./plugins/vuex-persist";
import undoRedoPlugin, {undoRedoHistory} from "./plugins/undo";
// ==== reduce file size, split note"s muations & actions ====
//  1. notes
import noteValueModule from "./note/value";
import noteRelationModule from "./note/relation";
import noteDisplayModule from "./note/display";
//  2. others
import savedModule from "./note/saved";
import tagModule from "./tag/tag";
import agendaModule from "./agenda/agenda";
import stateModule from "./settings/state"
import notebookModule from "./notebook/notebook"
import userModule from "./user/user";
import settingsModule from "./settings/display";
// ---- algorithm & data struct
import _ from "lodash";
import traversal from "@/lib/tree";
import { toNote } from "@/model/note";

const store = new Vuex.Store({
    strict: true,
    plugins: [vuexPersist.plugin, vuexPersistCookie.plugin, undoRedoPlugin],
    modules: {
        "note-value": noteValueModule,
        "note-relation": noteRelationModule,
        "note-display": noteDisplayModule,
        saved: savedModule, // starred & saved-filters
        tag: tagModule, // notes' #tag @tag :emoji
        agenda: agendaModule, // notes' (timestamp) or <scheduled>
        state: stateModule, // note [state]
        notebook: notebookModule, // notes' organized helper
        user: userModule, // user & session
        settings: settingsModule, // app's setting
    },
    state: {
        notes: [], // notes as tree
        flattern: [], // notes as table
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
                return n.total < note.total && noteDisplayModule.visible(n, p);
            }, {reserve:true, stop: (n) => n.archived || n.display.collapsed})
            return prev || note;
        },
        findNextVisibleNote: (state) => (note) => {
            let next = traversal.find(state.notes, (n, p) => {
                return n.total > note.total && noteDisplayModule.visible(n, p);
            }, {stop: (n) => n.archived || n.display.collapsed})
            return next || note;
        },
        findByPathTextOrCreate: (state) => (path) => {
            let parent = state;
            for (let i = 0; i < path.length; i++) {
                let text = path[i];
                let found = _.find(parent.notes, (n, p) => n.text.replace(/\xa0/g, " ") === text)
                if(!found){
                    store.dispatch("newNote", {
                        parent:parent,
                        text:text,
                        index:parent.notes.length
                    }).then((n) => found = n);
                    while(!found){
                        // blocking wait
                    }
                }
                parent = found;
            }

            if(parent.notes.length == 0){
                store.dispatch("newNote", { parent:parent});
            }
            
            return parent;
        },
        findNoteByPathText: (state) => (path) => {
            let parent = state;
            for (let i = 0; i < path.length; i++) {
                let text = path[i];
                let found = _.find(parent.notes, (n, p) => n.text.replace(/\xa0/g, " ") === text)
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
            console.log("flattern", (_.now()-start)+"ms")
        },
        mergeNotes(state, {notes}){
            notes = traversal.dup(notes, (n) => toNote(n));
            if(state.notes.length === 1 && state.notes[0].text === ""){
                Vue.set(state, "notes", notes);
            }else{
                state.notes = state.notes.concat(notes);
            }
        }
    },
    actions: {
        async init({commit, state}){
            return new Promise((resolve) => setTimeout(() => {
                let start = _.now();

                if(state.notes.length === 0){
                    this.dispatch("newNote", {});
                }else{
                    commit("flattern");
                }

                _.each(state.flattern, function([n]){
                    commit("unfocus", {note:n})
                    //let tags = [];
                    _.each(n.tokens, function(t){
                        // if(t.type === "tag"){
                        //     tags.push(t);
                        // }
                    });
                    //commit("tag/add", {tags, note:n});

                    // commit("agenda/count", {note: n})
                    // commit("agenda/add", {note: n, time: n.time})
                    // commit("agenda/add", {note: n, time: n.schedule})
                });

                console.log("init", (_.now()-start)+"ms")
                resolve();
            }, 0));
        },
        merge({commit}, payload){

            commit("mergeNotes", payload);

            return Promise.resolve();
        }
    }
});

export default store