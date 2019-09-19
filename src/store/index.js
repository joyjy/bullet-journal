import Vue from 'vue'

import Vuex from 'vuex'
Vue.use(Vuex)

import VuexPersist from 'vuex-persist'
const vuexPersist = new VuexPersist({
    key: 'bullet-note',
    storage: window.localStorage,
    reducer: (state) => ({
        agenda: state.agenda,
        // flattern: state.flattern,
        notes: state.notes,
        saved: state.saved,
        settings: state.settings,
        // tag: state.tag
    })
})

import _ from "lodash"

import traversal from "@/lib/tree"

import undoRedoPlugin, {undoRedoHistory} from "./plugins/undo"

// reduce file size, split note's muations & actions
import noteValueModule from "./note/value"
import noteRelationModule from "./note/relation"
import noteDisplayModule from "./note/display"
// 
import savedModule from "./note/saved"
import tagModule from "./tag/tag"
import agendaModule from "./agenda/agenda"
import settings from "./settings/display"

import config from "@/config"
import axios from "axios"

export default new Vuex.Store({
    strict: true,
    plugins: [vuexPersist.plugin, undoRedoPlugin],
    modules: {
        'note-value': noteValueModule,
        'note-relation': noteRelationModule, 
        'note-display': noteDisplayModule,
        saved: savedModule,
        agenda: agendaModule,
        tag: tagModule,
        settings: settings,
    },
    state: {
        notes: [],
        flattern: []
    },
    getters: {
        findNoteById: (state) => (id) => {
            return traversal.find(state.notes, (note) => note.id == parseInt(id));
        },
        findNoteStackById: (state) => (id) => {
            return traversal.path(state.notes, (note) => note.id == parseInt(id))
        },
        findNoteByText: (state) => (text, parent) => {
            let from = parent || state
            return traversal.find(from.notes, (note) => note.text.replace(/\xa0/g, ' ') == text);
        },
        findNoteBy: (state) => (predicate, parent) => {
            let from = parent || state
            return traversal.find(from.notes, (note) => predicate(note));
        },
        findPrevNote: (state) => (note) => {
            let index = _.indexOf(state.flattern, note);
            if(index == 0 || index == -1){
                return undefined;
            }
            return state.flattern[index-1];
        },
        findNextNote: (state) => (note) => {
            let index = _.indexOf(state.flattern, note);
            if(index == state.flattern.length-1 || index == -1){
                return undefined;
            }
            return state.flattern[index+1];
        }
    },
    mutations: {
        undo(state){
            undoRedoHistory.undo(state)
        },
        flattern(state, flattern){
            state.flattern = flattern;
        },
        backup(state){
            window.localStorage.setItem("backup", window.localStorage.getItem("bullet-note"));
        },
        restore(){
            let value = window.localStorage.getItem("backup");
            if(value){
                this.replaceState(JSON.parse(value));
            }
        }
    },
    actions: {
        async init({commit, state}){
            if(state.notes.length == 0){
                await this.dispatch("newNote", {})
            }
            commit("flattern", traversal.flattern(state.notes))
            _.each(state.flattern, function(n){
                let tags = [];
                _.each(n.tokens, function(t){
                    if(t.type == 'tag'){
                        tags.push(t);
                    }else if(t.time){
                        if(typeof t.time === 'object'){
                            commit("time", {note:n, token:t})
                        }
                    }
                })
                commit("tag/add", {tags})
            })
            return Promise.resolve();
        },
        async findByTextOrNewNote({state, commit, getters}, payload){
            let found = getters.findNoteByText(payload.text, payload.parent);
            if(!found){
                found = await this.dispatch("newNote", payload)
            }
            return Promise.resolve(found);
        },
        async backup({state, commit}){
            commit('backup');
            return axios.post(config.apiBase +"/data", state);
        }
    }
})