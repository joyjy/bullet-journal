
import Vue from "vue";
import traversal from "@/lib/tree";

export default {

    // note.display.text = {focus:false, cursor:-1}
    // note.display.content = {focus:false, cursor:-1}

    mutations: {
        collapse({state}, {note}){
            note.display.collapse = !note.display.collapse;
        },
        switchOutline({state}, payload){
            traversal.each(payload.notes, (note, depth) => {
                if(note.notes.length > 0){
                    note.display.collapse = depth == payload.level;
                }
            }, {level: payload.level});
        },
        focus({state}, {note, position, type}){
            
            let display = type == 'content' ? note.display.content: note.display.text;

            display.focus = true;
            display.cursor = position;
        },
        unfocus({state}, {note}){
            note.display.content.focus = false;
            note.display.content.cursor = -1;
            note.display.text.focus = false;
            note.display.text.cursor = -1;
        },
        displayColumn({state}, {note, value}){
            Vue.set(note.display,"column", value);
        }
    }
}