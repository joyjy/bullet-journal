export default {

    state: {
        view:{
            diary:0
        },
        agenda:{
            weekStart: 0, // [0,6] - sun to sat; [1,7] - mon to sun
            type: 'month',
        },
        drawer: {
            pinned: false
        }
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
        }
    }
}