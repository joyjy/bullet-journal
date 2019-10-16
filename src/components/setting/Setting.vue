<template>
    <v-app>
        <app-nav-bar></app-nav-bar>
        <v-content>
            <v-tabs v-model="view" dark @change="view = $event">
                <v-tab>Account</v-tab>
                <v-tab>Note</v-tab>
            </v-tabs>
            <router-view></router-view>
        </v-content>
    </v-app>
</template>

<script>
import AppNavBar from "../app/NavBar"
import opml from "@/lib/opml"

export default {
    data: () => ({
        view: 0,
        views: ['account', 'note', 'data']
    }),
    watch: {
        view(){
            this.$router.push({path: '/setting/' + this.views[this.view]}).catch(err => {});
        },
        $route(){
            this.view = this.views.indexOf(this.$route.name);
        }
    },
    components:{
        AppNavBar
    },
    methods: {
        importJson(file){

            var reader = new FileReader();
            reader.onload = () =>{
                let data = JSON.parse(reader.result);
                this.$store.dispatch("merge", data)
            };
            reader.readAsText(file);
        },
        importWorkflowy(file){
            var reader = new FileReader();
            reader.onload = () =>{
                this.$store.dispatch("merge", { notes: opml.toNotes(reader.result) })
            };
            reader.readAsText(file);
        }
    }
}
</script>

<style>
h3{
    margin-top: 1rem;
}
</style>