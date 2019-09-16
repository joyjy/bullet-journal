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
        findNoteBy: (state) => (predicate, parent) => {
            let from = parent || state
            return traversal.find(from.notes, (note) => predicate(note));
        },
        filterNoteBy: (state) => (predicate) => {
            return _.filter(state.flattern, (note) => predicate(note));
        },
        findPrevNote: (state) => (note) => {
            let index = _.indexOf(state.flattern, note);
            if(index == 0 || index == -1){
                return undefined;
            }
            return state.flattern[index-1];
        }
    },
    mutations: {
        saveNote(state, payload){
            payload.before = _.clone(payload.note);

            payload.note.text = payload.text;
            payload.note.tokens = payload.tokens;
            payload.note.display.cursor = payload.position;
            if(payload.notes){
                payload.note.notes = payload.notes
            }
        },
        saveContent(state, payload){
            payload.before = _.clone(payload.note);

            payload.note.content = payload.text;
            payload.note.display.cursor = payload.position;
        },
        addNote(state, payload){
            let index = payload.index || 0;
            payload.parent.notes.splice(index, 0, payload.note)
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
        swapNote(state, payload){
            let last = _.clone(payload.parent.notes[payload.toIndex]);
            Vue.set(payload.parent.notes, payload.toIndex, payload.note);
            Vue.set(payload.parent.notes, payload.fromIndex, last);
            payload.note.display.cursor = payload.position;
        },
        dragToSort(state, payload){
            Vue.set(payload.note, "notes", payload.notes);
        },
        undo(state){
            undoRedoHistory.undo(state)
        },
        flattern(state, flattern){
            state.flattern = flattern;
        },
        backup(state){
            let snap = _.cloneDeep(state);
            let value = JSON.stringify(snap)
            window.localStorage.setItem("backup", value);
        },
        restore(){
            let value = window.localStorage.getItem("backup");
            if(value){
                this.replaceState(JSON.parse(value));
            }
        }
    },
    actions: {
        saveNote({state, commit}, payload){
            payload.tokens = parser.parse(payload.text);

            let oldTags = _.filter(payload.note.tokens, ['type','tag']);
            let newTags = _.filter(payload.tokens, ['type','tag'])

            commit("saveNote", payload)
            commit("replaceTag", {oldTags, newTags})
        },
        newNote({state, commit}, payload){
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

                let oldTags = []
                let newTags = _.filter(note.tokens, ['type','tag'])
                commit("replaceTag", {oldTags, newTags})
            }
            if(!payload.parent){
                payload.parent = state;
            }

            payload.note = note;

            commit("addNote", payload)
            commit("flattern", traversal.flattern(state.notes))

            return payload.note
        },
        deleteNote({state, commit}, payload){
            let oldTags = _.filter(payload.note.tokens, ['type','tag'])
            let newTags = []
            commit("replaceTag", {oldTags, newTags})
            commit("deleteNote", payload)
            commit("flattern", traversal.flattern(state.notes))
        },
        downgradeNote({state, commit}, payload){
            commit("downgradeNote", payload)
            commit("flattern", traversal.flattern(state.notes))
        },
        downNote({state, commit}, payload){
            payload.fromIndex = payload.index;
            payload.toIndex = payload.index+1;
            commit("swapNote", payload)
            commit("flattern", traversal.flattern(state.notes))
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
            commit("flattern", traversal.flattern(state.notes))
        },
        upNote({state, commit}, payload){
            payload.fromIndex = payload.index;
            payload.toIndex = payload.index-1;
            commit("swapNote", payload)
            commit("flattern", traversal.flattern(state.notes))
        },
        dragToSort({state, commit}, payload){
            if(!payload.note){
                payload.note = state;
            }
            commit("dragToSort", payload)
            commit("flattern", traversal.flattern(state.notes))
        },
        async init({commit, state}){
            if(state.notes.length == 0){
                await this.dispatch("newNote", {})
            }
            commit("flattern", traversal.flattern(state.notes))
            commit("resetTag", state.notes)
        },
        async findByTextOrNewNote({state, commit, getters}, payload){
            let found = getters.findNoteBy((note) => note.text == payload.text, payload.parent);
            if(!found){
                found = await this.dispatch("newNote", payload)
            }
            return found;
        }
    }
})