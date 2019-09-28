import Vue from "vue";

export default {

    state: {
        note: {
            clickType: "sgl" // sgl or dbl
        },
        agenda:{
            weekStart: 0, // [0,6] - sun to sat; [1,7] - mon to sun
            type: "month",
        },
        drawer: {
            pinned: false
        },
        view:{
            diary:0
        },
    },
    mutations:{
        switchView(state, {key, value}){
            state.view[key] = value;
        },
        agendaType(state, type){
            state.agenda.type = type;
        },
        drawerPinned(state, pinned){
            state.drawer.pinned = pinned;
        },
        updateSettings(state, {select, key, value}){
            let left = select(state);
            Vue.set(left, key, value);
        },
    }
}