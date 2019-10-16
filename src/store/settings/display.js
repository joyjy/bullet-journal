import Vue from "vue";

export default {

    state: {
        dragging: false,
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
    },
    mutations:{
        drawerPinned(state, pinned){
            state.drawer.pinned = pinned;
        },
        dragging(state, value){
            state.dragging = value;
        },
        updateSettings(state, {select, key, value}){
            let left = select(state);
            Vue.set(left, key, value);
        },
    }
}