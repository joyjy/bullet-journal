import Vue from "vue";
import traversal from "@/lib/tree";

export default {
    visible(note, parent){
        if(note.archived){
            if(parent){
                if(parent.display && !parent.display.archived){
                    return false; // archived and can't display
                }
            }else{ // only top level no parent, // todo
                return false;
            }
        }
        if(parent && parent.display && parent.display.collapsed){
            return false;
        }
        return true;
    },
    // note.archived
    // note.display.collapsed
    // note.display.text = {focus:false, cursor:-1}
    // note.display.content = {focus:false, cursor:-1}
    // note.display.archived
    mutations: {
        archive({state}, {note}){
            note.archived = !note.archived;
        },
        collapse({state}, {note}){
            note.display.collapsed = !note.display.collapsed;
        },
        switchOutline({state}, payload){
            traversal.each(payload.notes, (note, depth) => {
                if(note.notes.length > 0){
                    note.display.collapsed = payload.level>-1 ? depth >= payload.level : false;
                }
            });
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
        display({state}, {note, key, value}){
            Vue.set(note.display, key, value);
        }
    }
}