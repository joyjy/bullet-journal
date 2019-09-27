
import VuexPersist from "vuex-persist";
import Cookies from "js-cookie";

const vuexPersist = new VuexPersist({
    key: "bullet-note",
    storage: window.localStorage,
    reducer: (state) => ({
        agenda: state.agenda,
        // flattern: state.flattern,
        notes: state.notes,
        saved: state.saved,
        settings: state.settings,
        // tag: state.tag,
    }),
});

const vuexPersistCookie = new VuexPersist({
    restoreState: (key, storage) => Cookies.getJSON(key),
    saveState: (key, state, storage) =>  Cookies.set(key, state, {expires: 3}),
    modules: ["user"], //only save user module,
    filter: (mutation) => mutation.type === "signIn" || mutation.type === "signOut",
});

export {vuexPersist, vuexPersistCookie}