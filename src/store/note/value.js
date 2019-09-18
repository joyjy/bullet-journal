import Vue from "vue"

import _ from "lodash"

import parser from "@/lib/parser"

export default {
    mutations:{
        saveText(state, {note, text, tokens, position, time}){

            note.text = text;
            note.tokens = tokens;

            if(Number.isInteger(note.display.cursor)){ // todo remove with clean state
                Vue.set(note.display.cursor = { text: -1, content: -1});
            }
            note.display.cursor.text = position;

            if(notes){ // when merge note
                note.notes = notes
            }

            if(time){ // has timestamp
                Vue.set(note, 'time', time);
            }else{
                Vue.delete(note, 'time');
            }
        },
        saveContent(state, {note, text, tokens, position, time}){

            if(!note.content){
                Vue.set(note, 'content', { text:'', tokens:[] })
            }

            note.content.text = text;
            note.content.tokens = tokens;

            if(Number.isInteger(note.display.cursor)){ // todo remove with clean state
                Vue.set(note.display.cursor = { text: -1, content: -1});
            }
            note.display.cursor.content = position
            
            if(time){
                Vue.set(note, 'schedule', token.time);
            }else{
                Vue.delete(note, 'schedule');
            }
        },
        saveAttrs(state, payload){
        }
    },
    actions: {
        saveNote({state, commit}, payload){

            payload.before = _.clone(payload.note); // for undo
            payload.tokens = parser.parse(payload.text);

            let timeToken = _.find(payload.tokens, token => token.time);
            if(timeToken && timeToken.time){
                payload.time = timeToken.time;
            }

            if(payload.type == 'content'){
                commit("saveContent", payload)
                commit("focus", payload)
                commit("tag/remove", {tags: _.filter(payload.note.content.tokens, ['type','tag'])})

            } else { // text
                commit("saveText", payload)
                commit("focus", payload)
                commit("tag/remove", {tags: _.filter(payload.note.tokens, ['type','tag'])})
            }

            commit("tag/add", {tags: _.filter(payload.tokens, ['type', 'tag'])})
            
            if(payload.time){
                commit("agenda/add", payload)
            }

            return Promise.resolve();
        },
    }
}