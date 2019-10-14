import Vue from "vue";
import _ from "lodash";
import moment from "moment";
import traversal from "@/lib/tree";
import { Note } from "@/model/note";

export default {
    mutations: {
        addNote(state, {parent, note, index}){

            parent.notes.splice(index||0, 0, note);
        },
        deleteNote(state, {parent, index}){

            parent.notes.splice(index, 1);
        },
        downgradeNote(state, {parent, newParent, note, index}){

            parent.notes.splice(index, 1);
            newParent.notes.push(note);
        },
        upgradeNote(state, {grandParent, grandIndex, parent, note, index}){

            parent.notes.splice(index, 1);
            grandParent.notes.splice(grandIndex, 0, note);
        },
        swapNote(state, {parent, note, fromIndex, toIndex}){

            let last = parent.notes[toIndex];
            last = _.clone(last);

            parent.notes.splice(fromIndex, 1, last);
            parent.notes.splice(toIndex, 1, note);
        },
        dragToSort(state, {note, notes}){

            Vue.set(note, "notes", notes);
        },
    },
    actions: {
        newNote({commit, rootState}, payload){

            payload.note = new Note();

            if(!payload.parent){
                payload.parent = rootState;
            }

            if(payload.position){
                payload.note.display.text.cursor = payload.position;
            }
            
            commit("addNote", payload);
            commit("flattern");
            commit("agenda/count", {date: moment(payload.note.id).format("YYYY-MM-DD"), type: "added"});

            if(payload.text){
                this.dispatch("saveNote", payload);
            }

            return payload.note;
        },
        deleteNote({commit}, payload){

            traversal.each(payload.note.notes, (n) => {
                commit("tag/remove", {tags: _.filter(n.tokens.concat(n.content.tokens), ["type","tag"])});
                commit("agenda/remove", {note: n});
            })

            commit("tag/remove", {tags: _.filter(payload.note.tokens.concat(payload.note.content.tokens), ["type","tag"])});
            commit("agenda/remove", {note: payload.note});

            commit("deleteNote", payload);
            commit("flattern");
            commit("agenda/count", {date: moment().format("YYYY-MM-DD"), type: "removed"});
        },
        downgradeNote({commit}, payload){

            payload.newParent = payload.parent.notes[payload.index-1];
            commit("downgradeNote", payload);
            if(payload.newParent.display.collapsed){
                commit("collapse", {note: payload.newParent});
            }
            commit("focus", {note:payload.note, position:payload.position});
            commit("flattern");

            return Promise.resolve()
        },
        upgradeNote({commit, rootState, rootGetters}, payload){

            let stack = rootGetters.findNoteStackById(payload.parent.id);
            if(stack.length > 1){
                payload.grandParent = stack[stack.length - 2];
                payload.grandIndex = _.indexOf(payload.grandParent.notes, payload.parent) + 1;
            }else{
                payload.grandParent = rootState;
                payload.grandIndex = _.indexOf(rootState.notes, payload.parent) + 1;
            }

            commit("upgradeNote", payload);
            commit("focus", {note:payload.note, position:payload.position});
            commit("flattern");

            return Promise.resolve()
        },
        downNote({commit}, payload){

            payload.fromIndex = payload.index;
            payload.toIndex = payload.index+1;

            commit("unfocus", {note:payload.note});
            commit("swapNote", payload);
            commit("focus", {note:payload.note, position:payload.position});
            commit("flattern");

            return Promise.resolve();
        },
        upNote({commit}, payload){

            payload.fromIndex = payload.index;
            payload.toIndex = payload.index-1;

            commit("unfocus", {note:payload.note});
            commit("swapNote", payload);
            commit("focus", {note:payload.note, position:payload.position});
            commit("flattern");

            return Promise.resolve();
        },
        dragToSort({commit, rootState}, payload){

            if(!payload.note){
                payload.note = rootState;
            }
            
            commit("dragToSort", payload);
            commit("flattern");

            return Promise.resolve();
        },
    }
}