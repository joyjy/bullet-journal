import Vue from 'vue'

import Vuex from 'vuex'
Vue.use(Vuex)

import VuexPersist from 'vuex-persist'
const vuexPersist = new VuexPersist({
  key: 'bullet-note',
  storage: window.localStorage
})

import _ from "lodash"

import traversal from "@/lib/tree"
import parser from "@/lib/parser"

import undoRedoPlugin, {undoRedoHistory} from "./plugins/undo"

import noteTreeDisplayModule from "./display"
import tagModule from "./tag"

export default new Vuex.Store({
    strict: true,
    plugins: [vuexPersist.plugin, undoRedoPlugin],
    modules: {
        display: noteTreeDisplayModule,
        tag: tagModule,
    },
    state: {
        notes: []
    },
    getters: {
        findNoteById: (state) => (id) => {
            return traversal.find(state.notes, (note) => note.id == parseInt(id));
        },
        findNoteStackById: (state) => (id) => {
            return traversal.path(state.notes, (note) => note.id == parseInt(id))
        },
        findNoteByText: (state) => (text) => {
            return traversal.find(state.notes, (note) => note.text == text);
        }
    },
    mutations: {
        saveNote(state, payload){
            payload.before = _.clone(payload.note);

            payload.note.text = payload.text;
            payload.note.tokens = payload.tokens;
            payload.note.display.cursor = payload.position;
        },
        addNote(state, payload){
            let index = payload.index || 0;
            if(payload.parent){
                payload.parent.notes.splice(index, 0, payload.note)
            }else{
                state.notes.splice(index, 0, payload.note)
            }
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
        undo(state){
            undoRedoHistory.undo(state)
        }
    },
    actions: {
        saveNote({commit}, payload){
            payload.tokens = parser.parse(payload.text);

            let oldTags = _.filter(payload.note.tokens, ['type','tag']);
            let newTags = _.filter(payload.tokens, ['type','tag'])

            commit("saveNote", payload)
            commit("replaceTag", {oldTags, newTags})
        },
        newNote({commit}, payload){
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

            payload.note = note;

            commit("addNote", payload)
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
        }
    }
})