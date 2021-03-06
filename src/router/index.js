import Vue from "vue";
import VueRouter from "vue-router";

import NoteTree from "@/components/note/NoteTree";
import Agenda from "@/components/agenda/Agenda";
import Setting from "@/components/setting/Setting";
import AccountSetting from "@/components/setting/AccountSetting"
import NoteSetting from "@/components/setting/NoteSetting"
import Signin from "@/components/app/Signin";

import notebook from "@/components/notebook/Notebook";

Vue.use(VueRouter)

export default new VueRouter({
    mode: "history",
    routes: [
        { path: "/note/:id?", name: "note", component: NoteTree },
        { path: "/agenda/:type?/:start?", name: "agenda", component: Agenda},
        { path: "/notebook/", name: "notebooks", component:notebook},
        { path: "/notebook/:name", name: "notebook", component: notebook },
        { path: "/setting", redirect: {path:"/setting/account"},
            name: "setting", component: Setting, 
            children: [
                { path: "account", name: "account", component: AccountSetting },
                { path: "note", name: "note", component: NoteSetting }
            ]
        },
        { path: "/signin", name: "signin", component: Signin },
        { path: "/*", redirect: { name: "note" }},
    ]
})