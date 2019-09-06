<script>
import Vue from "vue"
import VueRouter from "vue-router"

import NoteTree from "./components/note/NoteTree"

Vue.use(VueRouter)

export default new VueRouter({
    routes: [
        { path: "/", component: NoteTree }
    ]
})

</script>