import userAPI from "@/api/user"

export default {
    state: {
        token: "",
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
        signIn(state, {token}){
            state.token = token;
        },
        signOut(state){
            state.token = "";
        },
    },
    actions: {
        signIn({commit}, {email, password}){
            return userAPI.signin(email, password).then(({result, message, data}) => {
                if(result){
                    commit("signIn", data)
                }
                return Promise.resolve({result, message})
            })
        }
    }
}