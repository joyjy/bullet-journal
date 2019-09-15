import Vue from "vue"
import VueRouter from "vue-router"

import NoteTree from "@/components/note/NoteTree"
import Diary from "@/components/notebook/Diary"
import Agenda from "@/components/agenda/Agenda"

Vue.use(VueRouter)

export default new VueRouter({
    mode: "history",
    routes: [
        { path: "/note/:id?", name: "note", component: NoteTree },
        { path: "/agenda", name: "agenda", component: Agenda},
        { path: "/notebook/", name: "notebooks"},
        { path: "/notebook/:name", name: "notebook", component: Diary },
        { path: "/*", redirect: { name: 'note' }},
    ]
})