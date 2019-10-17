import userAPI from "@/api/user";

export default {
    state: {
        token: "",
        account: "",
        username: "",
        profile: "",
    },
    getters: {
        profile: (state) => () => {
            if(state.profile && state.profile.length > 0){
                return state.profile;
            }
            return state.username.charAt(0);
        },
        signed: (state) => () => {
            return state.account && state.account.length > 0
        }
    },
    mutations: {
        signIn(state, {token}){
            state.token = token;
        },
        setUser(state, {account, username, profile}){
            state.account = account;
            state.username = username;
            state.profile = profile;
        },
        signOut(state){
            state.token = "";
        },
    },
    actions: {
        async signIn({state, commit}, {email, password}){
            var {result, message, data} = await userAPI.signin(email, password);
            if(!result){
                return Promise.resolve({result, message})
            }

            commit("signIn", data)

            return Promise.resolve({result, message})
        }
    }
}