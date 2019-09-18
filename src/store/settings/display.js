export default {

    state: {
        view:{
            diary:0
        },
        agenda:{
            weekStart: 0, // [0,6] - sun to sat; [1,7] - mon to sun
        }
    },
    mutations:{
        switchView(state, payload){
            state.view[payload.key] = payload.value;
        }
    }
}