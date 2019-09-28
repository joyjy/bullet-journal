import Vue from "vue";

import Vuex from "vuex";
Vue.use(Vuex);

import {vuexPersist, vuexPersistCookie} from "./plugins/vuex-persist"
import undoRedoPlugin, {undoRedoHistory} from "./plugins/undo";

import _ from "lodash";
import traversal from "@/lib/tree";

// reduce file size, split note"s muations & actions
import noteValueModule from "./note/value";
import noteRelationModule from "./note/relation";
import noteDisplayModule from "./note/display";

import savedModule from "./note/saved";
import tagModule from "./tag/tag";
import agendaModule from "./agenda/agenda";
import settingsModule from "./settings/display";
import stateModule from "./settings/state"
import userModule from "./user/user";

import { toNote } from "@/model/note";

export default new Vuex.Store({
    strict: true,
    plugins: [vuexPersist.plugin, vuexPersistCookie.plugin, undoRedoPlugin],
    modules: {
        "note-value": noteValueModule,
        "note-relation": noteRelationModule,
        "note-display": noteDisplayModule,
        saved: savedModule,
        agenda: agendaModule,
        tag: tagModule,
        user: userModule,
        state: stateModule,
        settings: settingsModule,
    },
    state: {
        notes: [],
        flattern: [],
    },
    getters: {
        findNoteById: (state) => (id) => {
            return traversal.find(state.notes, (note) => note.id === parseInt(id));
        },
        findNoteStackById: (state) => (id) => {
            return traversal.path(state.notes, (note) => note.id === parseInt(id));
        },
        findNoteByText: (state) => (text, parent) => {
            let from = parent || state;
            return traversal.find(from.notes, (note) => note.text.replace(/\xa0/g, " ") === text);
        },
        findNoteBy: (state) => (predicate, parent) => {
            let from = parent || state;
            return traversal.find(from.notes, (note) => predicate(note));
        },
        findPrevNote: (state) => (note) => {
            let index = _.indexOf(state.flattern, note);
            if(index === 0 || index === -1){
                return undefined;
            }
            return state.flattern[index-1];
        },
        findNextNote: (state) => (note) => {
            let index = _.indexOf(state.flattern, note);
            if(index === state.flattern.length-1 || index === -1){
                return undefined;
            }
            return state.flattern[index+1];
        }
    },
    mutations: {
        undo(state){
            undoRedoHistory.undo(state);
        },
        flattern(state){
            state.flattern = traversal.flattern(state.notes);
        },
        mergeNotes(state, {notes}){
            notes = traversal.dup(notes, (n) => toNote(n));
            if(state.notes.length === 1 && state.notes[0].text ==""){
                Vue.set(state, "notes", notes);
            }else{
                state.notes = state.notes.concat(notes);
            }
        }
    },
    actions: {
        async init({commit, state}){

            if(state.notes.length === 0){
                await this.dispatch("newNote", {});
            }
            commit("flattern");
            if(state.flattern.length === 1 && !state.flattern[0].text){
                commit("focus", { note: state.flattern[0], position: 0});
            }

            _.each(state.flattern, function(n){
                let tags = [];
                _.each(n.tokens, function(t){
                    if(t.type === "tag"){
                        tags.push(t);
                    }else if(t.time){
                        if(typeof t.time === "object"){
                            commit("setTimePrototype", {note:n, token:t});
                        }
                        commit('agenda/add', {note: n, time: t.time})
                    }
                });
                commit("tag/add", {tags});
            });
            return Promise.resolve();
        },
        async findByTextOrNewNote({state, commit, getters}, payload){

            let found = getters.findNoteByText(payload.text, payload.parent);
            if(!found){
                found = await this.dispatch("newNote", payload);
            }
            return Promise.resolve(found);
        },
        async merge({commit}, payload){

            commit("mergeNotes", payload);

            return Promise.resolve();
        }
    }
})