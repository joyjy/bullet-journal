import _ from 'lodash'

export default {
    namespaced: true,
    state: {
        filters: [],
        notes: []
    },
    getters:{
        isStarred: (state) => (id) => {
            return _.findIndex(state.notes, n => n.id == id) > -1;
        },
        isSavedFilter: (state) => (text) => {
            return _.indexOf(state.filters, text) > -1;
        }
    },
    mutations:{
        filter(state, {text}){
            let index = _.indexOf(state.filters, text)
            if(index == -1){
                state.filters.push(text)
            }else{
                state.filters.splice(index, 1);
            }
        },
        note(state, {note}){
            let index = _.findIndex(state.notes, n => n.id == note.id)
            if(index == -1){
                state.notes.push({id:note.id, name:note.text})
            }else{
                state.notes.splice(index, 1);
            }
        }
    }
}