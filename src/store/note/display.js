
import Vue from "vue"
import traversal from "@/lib/tree"

export default {

    mutations: {
        collapse(state, {note}){
            note.display.collapse = !note.display.collapse
        },
        switchOutline(state, payload){
            traversal.each(payload.notes, payload.level, (note, depth) => {
                if(note.notes.length > 0){
                    note.display.collapse = depth == payload.level
                }
            })
        },
        focus(state, {note, position, type}){
            if(Number.isInteger(note.display.cursor)){
                Vue.set(note.display, "cursor", {text:-1, content:-1});
            }
            if(type == 'content'){
                note.display.cursor.content = position;
            }else{
                note.display.cursor.text = position;
            }
        },
        unfocus(state, {note}){
            if(Number.isInteger(note.display.cursor)){
                Vue.set(note.display, "cursor", {text:-1, content:-1});
            }
            note.display.cursor.content = -1;
            note.display.cursor.text = -1;
        },
    }
}