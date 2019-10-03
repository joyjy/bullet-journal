import Vue from "vue";
import _ from "lodash";
import parser from "@/lib/parser";
import { toTime } from "@/model/time";

export default {
    mutations:{
        saveText(state, {note, text, tokens, notes, time}){

            note.text = text;
            note.tokens = tokens;

            if(notes){ // when merge note
                note.notes = notes;
            }

            if(time){ // has timestamp
                Vue.set(note, "time", time);
            }else{
                Vue.delete(note, "time");
            }
        },
        saveContent(state, {note, text, tokens, time}){

            _.each(tokens, function(token){ // filter except schedule state
                if(token.type === "state" && !token.time || token.time && token.time.type === "stamp"){
                    token.type = "text";
                }
            });
            note.content.text = text;
            note.content.tokens = tokens;

            if(time && time.type === 'schedule'){
                Vue.set(note, "schedule", time);
            }else{
                Vue.delete(note, "schedule");
            }
        },
        setTimePrototype(state, {note, token}){
            token.time = toTime(token.time, note);
        }
    },
    actions: {
        saveNote({state, commit}, payload){

            payload.before = _.clone(payload.note); // for undo
            payload.tokens = parser.parse(payload.text);

            let timeToken = _.find(payload.tokens, token => token.time);
            if(timeToken && timeToken.time){
                payload.time = timeToken.time;
                payload.time.context = { id: payload.note.id };
            }

            let newTags = _.filter(payload.tokens, ["type", "tag"])
            let oldTags;

            if(payload.type === "content"){
                oldTags = _.filter(payload.note.content.tokens, ["type","tag"]);
                
                commit("agenda/remove", {time: payload.note.time, note: payload.note});
                commit("saveContent", payload);
                commit("agenda/add", {time: payload.note.time, note: payload.note});
                commit("focus", payload);

            } else { // text
                oldTags = _.filter(payload.note.tokens, ["type","tag"]);
                
                commit("agenda/remove", {time: payload.note.schedule, note: payload.note});
                commit("saveText", payload);
                commit("agenda/add", {time: payload.note.schedule, note: payload.note});
                commit("focus", payload);
            }
            
            this.dispatch("tag/replace", {oldTags, newTags});
            
            return Promise.resolve();
        },
    }
}