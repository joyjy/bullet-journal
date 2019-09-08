import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'

const vuexPersist = new VuexPersist({
  key: 'bullet-note',
  storage: window.localStorage
})

Vue.use(Vuex)

import _ from "lodash"

import traversal from "@/lib/tree"
import parser from "@/lib/parser"

export default new Vuex.Store({
    strict: true,
    plugins: [vuexPersist.plugin],
    state: {
        notes: [
                // {
                //     id: 1,
                //     text: 'hello',
                //     tokens: [],
                //     display: { collapse: false, cursor: -1},
                //     notes: [
                //         {
                //             id:2,
                //             text:'world',
                //             display: { collapse: false, cursor: -1},
                //             tokens: [],
                //             notes: []
                //         }
                //     ]
                // }
            ],
        tagHierarchy: {},
        user: {},
        settings: {}
    },
    getters: {
        findNoteById: (state) => (id) => {
            return traversal.find(state.notes, (note) => note.id == parseInt(id));
        },
        findNoteStackById: (state) => (id) => {
            return traversal.path(state.notes, (note) => note.id == parseInt(id))
        }
    },
    mutations: {
        saveNote(state, payload){
            payload.note.text = payload.text;
            payload.note.tokens = payload.tokens;
            payload.note.display.cursor = payload.position;
        },
        newNote(state, payload){
            payload.parent.notes.splice(payload.index, 0, payload.note)
        },
        deleteNote(state, payload){
            payload.parent.notes.splice(payload.index, 1);
        },
        downgradeNote(state, payload){
            let prev = payload.parent.notes[payload.index-1];

            payload.parent.notes.splice(payload.index, 1);
            prev.notes.push(payload.note);
            payload.note.display.cursor = payload.position;
        },
        upgradeNote(state, payload){
            payload.grandParent.notes.splice(payload.grandIndex, 0, payload.note);
            payload.parent.notes.splice(payload.index, 1);
            payload.note.display.cursor = payload.position;
        },
        dragToSort(state, payload){
            if(payload.note){
                Vue.set(payload.note, "notes", payload.notes);
            }else{
                Vue.set(state, "notes", payload.notes);
            }
        },
        collapse(state, note){
            note.display.collapse = !note.display.collapse
        },
        focus(state, payload){
            payload.note.display.cursor = payload.position;
        },
        unfocus(state, note){
            note.display.cursor = -1;
        },
        switchOutline(state, payload){
            traversal.each(payload.notes, payload.level, (note, deepth) => { note.display.collapse = deepth == payload.level})
        }
    },
    actions: {
        saveNote({commit}, payload){
            payload.tokens = parser.parse(payload.text);
            commit("saveNote", payload)
        },
        addNote({commit}, payload){
            let note = { 
                id: _.now(),
                text: "" ,
                tokens: [],
                display: { collapse: false, cursor: 0},
                notes:[],
            };
            if(payload.text){
                note.text = payload.text;
                note.tokens = parser.parse(payload.text);
            }
            if(payload.parent.id){
                note.parent = { id: payload.parent.id, text: payload.parent.text }
            }

            payload.note = note;

            commit("newNote", payload)
        },
        deleteNote({commit}, payload){

            commit("deleteNote", payload)
        },
        downgradeNote({commit}, payload){

            commit("downgradeNote", payload)
        },
        upgradeNote({state, commit, getters}, payload){

            let stack = getters.findNoteStackById(payload.parent.id);
            if(stack.length > 1){
                payload.grandParent = stack[stack.length - 2];
                payload.grandIndex = _.indexOf(payload.grandParent.notes, payload.parent) + 1
            
            }else{
                payload.grandParent = state;
                payload.grandIndex = _.indexOf(state.notes, payload.parent) + 1
            }

            commit("upgradeNote", payload)
        },
        dragToSort({commit}, payload){

            commit("dragToSort", payload)
        },
    }
})