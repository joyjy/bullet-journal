import Vue from "vue";
import VueRouter from "vue-router";

import NoteTree from "@/components/note/NoteTree";
import Agenda from "@/components/agenda/Agenda";
import Setting from "@/components/setting/Setting";
import Signin from "@/components/app/Signin";

import Diary from "@/components/notebook/Diary";

Vue.use(VueRouter)

export default new VueRouter({
    mode: "history",
    routes: [
        { path: "/note/:id?", name: "note", component: NoteTree },
        { path: "/agenda/:type?/:start", name: "agenda", component: Agenda},
        { path: "/agenda", name: "agenda", component: Agenda},
        { path: "/notebook/", name: "notebooks"},
        { path: "/notebook/:name", name: "notebook", component: Diary },
        { path: "/setting", name: "setting", component: Setting },
        { path: "/signin", name: "signin", component: Signin },
        { path: "/*", redirect: { name: "note" }},
    ]
})