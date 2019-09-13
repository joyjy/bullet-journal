import Vue from "vue"
import VueRouter from "vue-router"

import NoteTree from "@/components/note/NoteTree"
import Jibun from "@/components/notebook/Jibun"

Vue.use(VueRouter)

export default new VueRouter({
    mode: "history",
    routes: [
        { path: "/", redirect: { name: 'note' }},
        { path: "/note/:id?", name: "note", component: NoteTree },
        { path: "/filter", name: "filter", component: NoteTree },
        { path: "/agenda", name: "agenda"},
        { path: "/notebook/", name: "notebooks"},
        { path: "/notebook/:name", name: "notebook", component: Jibun }
    ]
})