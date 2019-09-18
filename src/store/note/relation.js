import Vue from "vue"

import _ from "lodash"

import { Note } from "@/model/note";
import traversal from "@/lib/tree"

export default {
    mutations: {
        addNote(state, {parent, note, index}){

            parent.notes.splice(index||0, 0, note)
        },
        deleteNote(state, {parent, index}){

            parent.notes.splice(index, 1);
        },
        downgradeNote(state, {parent, note, index}){

            let prev = parent.notes[index-1];

            parent.notes.splice(index, 1);
            prev.notes.push(note);
        },
        upgradeNote(state, {grandParent, grandIndex, parent, note, index}){

            parent.notes.splice(index, 1);
            grandParent.notes.splice(grandIndex, 0, note);
        },
        swapNote(state, {parent, note, fromIndex, toIndex}){

            let last = _.clone(parent.notes[toIndex]);

            Vue.set(parent.notes, toIndex, note);
            Vue.set(parent.notes, fromIndex, last);
        },
        dragToSort(state, {note, notes}){

            Vue.set(note, "notes", notes);
        },
    },
    actions: {
        async newNote({state, commit, rootState}, payload){

            payload.note = new Note();

            if(!payload.parent){
                payload.parent = rootState;
            }
            
            commit("addNote", payload)
            commit("flattern", traversal.flattern(rootState.notes))

            if(payload.text){
                await this.dispatch('saveNote', payload)
            }

            return Promise.resolve(payload.note)
        },
        deleteNote({state, commit, rootState}, payload){

            commit("tag/remove", {tags: _.filter(payload.note.tokens, ['type','tag'])})
            commit("deleteNote", payload)
            commit("flattern", traversal.flattern(rootState.notes))

            return Promise.resolve()
        },
        downgradeNote({state, commit, rootState}, payload){

            commit("downgradeNote", payload)
            commit('focus', {note:payload.note, position:payload.position})
            commit("flattern", traversal.flattern(rootState.notes))

            return Promise.resolve()
        },
        upgradeNote({state, commit, getters, rootState, rootGetters}, payload){

            let stack = rootGetters.findNoteStackById(payload.parent.id);
            if(stack.length > 1){
                payload.grandParent = stack[stack.length - 2];
                payload.grandIndex = _.indexOf(payload.grandParent.notes, payload.parent) + 1
            }else{
                payload.grandParent = rootState;
                payload.grandIndex = _.indexOf(rootState.notes, payload.parent) + 1
            }

            commit("upgradeNote", payload)
            commit('focus', {note:payload.note, position:payload.position})
            commit("flattern", traversal.flattern(rootState.notes))

            return Promise.resolve()
        },
        downNote({state, commit, rootState}, payload){

            payload.fromIndex = payload.index;
            payload.toIndex = payload.index+1;

            commit('unfocus', { note:payload.note})
            commit("swapNote", payload)
            commit('focus', {note:payload.note, position:payload.position})
            commit("flattern", traversal.flattern(rootState.notes))

            return Promise.resolve()
        },
        upNote({state, commit, rootState}, payload){

            payload.fromIndex = payload.index;
            payload.toIndex = payload.index-1;

            commit('unfocus', { note:payload.note})
            commit("swapNote", payload)
            commit('focus', {note:payload.note, position:payload.position})
            commit("flattern", traversal.flattern(rootState.notes))

            return Promise.resolve()
        },
        dragToSort({state, commit, rootState}, payload){

            if(!payload.note){
                payload.note = rootState;
            }
            
            commit("dragToSort", payload)
            commit("flattern", traversal.flattern(rootState.notes))

            return Promise.resolve()
        },
    }
}