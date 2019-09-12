
import traversal from "@/lib/tree"

export default {

    mutations: {
        collapse(state, note){
            note.display.collapse = !note.display.collapse
        },
        focus(state, payload){
            payload.note.display.cursor = payload.position;
        },
        unfocus(state, payload){
            payload.note.display.cursor = -1;
        },
        switchOutline(state, payload){
            traversal.each(payload.notes, payload.level, (note, depth) => {
                if(note.notes.length > 0){
                    note.display.collapse = depth == payload.level
                }
            })
        },
    }
}