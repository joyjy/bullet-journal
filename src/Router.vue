<script>
import Vue from "vue"
import VueRouter from "vue-router"

import NoteTree from "./components/note/NoteTree"

Vue.use(VueRouter)

export default new VueRouter({
    mode: "history",
    routes: [
        { path: "/", component: NoteTree },
        { path: "/n/:id?", name: "note", component: NoteTree }
    ]
})

</script>