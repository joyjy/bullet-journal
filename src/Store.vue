<template>
  
</template>

<script>
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export default new Vuex.Store({
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
        find: (state, getters) => (array, id) => {
            if(array.length == 0){
                return;
            }
            let found;
            array.forEach((note) => {
                if(note.id == parseInt(id)){
                    found = note;
                }else{
                    found = getters.find(note.notes, id);
                }
            })
            return found;
        },
        findNoteById: (state, getters) => (id) => {
            return getters.find(state.notes, id)
        }
    },
    mutations: {
    },
    actions: {
    }})

</script>

<style>

</style>