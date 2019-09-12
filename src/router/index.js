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
        { path: "/notebook/jibun", name: "notebook", component: Jibun }
    ]
})