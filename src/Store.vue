<script>
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export default new Vuex.Store({
    strict: true,
    state: {
        notes: [
                {
                    id: 1,
                    text: 'hello',
                    notes: [
                        {
                            id:2,
                            parent: { id: 1, text: "hello"},
                            text:'world',
                            notes: []
                        }
                    ]
                }
            ],
        user: {},
        settings: {}
    },
    getters: {
        recursiveFindNote: (state, getters) => (array, id) => {
            if(array.length == 0){
                return;
            }
            let found;
            array.forEach((note) => {
                if(note.id == parseInt(id)){
                    found = note;
                }else{
                    found = getters.recursiveFindNote(note.notes, id);
                }
            })
            return found;
        },
        findNoteById: (state, getters) => (id) => {
            return getters.recursiveFindNote(state.notes, id)
        }
    },
    mutations: {
        saveNote(state, payload){
            payload.note.text = payload.text
        },
        newNote(state, payload){
            payload.parent.notes.splice(payload.index, 0, payload.note)
        },
        deleteNote(state, payload){
            payload.parent.notes.splice(payload.index, 1);
        },
        downgradeNote(state, payload){
            let prev = payload.parent.notes[payload.index-1];

            payload.parent.notes.splice(payload.index, 1);
            prev.notes.push(payload.note);
            payload.note.changed = true;
        },
        upgradeNote(state, payload){
            payload.grandParent.notes.splice(payload.grandIndex, 0, payload.note);
            payload.parent.notes.splice(payload.index, 1);
            payload.note.changed = true;
        },
        afterMounted(state, note){
            note.created = false;
            note.change = false;
        }
    },
    actions: {
        saveNote({commit}, payload){
            commit("saveNote", payload)
        },
        addNote({commit}, payload){

            let note = { 
                id: new Date().getTime(),
                text: "" ,
                notes:[], 
                created: true
            };
            if(payload.text){
                note.text = payload.text;
            }
            if(payload.parent.id){
                note.parent = { id: payload.parent.id, text: payload.parent.text }
            }

            payload.note = note;

            commit("newNote", payload)
        },
        deleteNote({commit}, payload){

            commit("deleteNote", payload)
        },
        downgradeNote({commit}, payload){

            commit("downgradeNote", payload)
        },
        upgradeNote({commit}, payload){

            commit("upgradeNote", payload)
        }
    }})

</script>