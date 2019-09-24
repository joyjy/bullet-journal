import Vue from "vue"

export default {
    state: {
        'name': '',
        'profile': '',
        'account': '',
        'sessionId': '',
    },
    getters: {
        profile: (state) => () => {
            if(state.profile && state.profile.length > 0){
                return state.profile;
            }
            return state.name.charAt(0);
        },
        signed: (state) => () => {
            return state.name && state.name.length > 0
        }
    },
    mutations: {
        signIn(state, {name, account, sessionId}){
            state.name = name;
            state.account = account;
            state.sessionId = sessionId;
        },
        signOut(state, {}){
            state.name = '';
            state.account = '';
            state.sessionId = '';
        },
    },
    actions: {
        signIn({commit, state}, {email, password}){
            let succeed = false;
            if(email == 'joyjy2ah@gmail.com'){
                commit('signIn', {name:'JoYJY', account:email, "sessionId":'fake'})
            }
            return Promise.resolve(succeed);
        }
    }
}