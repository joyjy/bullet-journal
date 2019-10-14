<template>
    <v-app>
        <app-nav-bar></app-nav-bar>
        <v-content>
            <v-tabs dark @change="$router.push({path: '/setting/' + views[$event]})">
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
        views: ['account', 'note', 'data']
    }),
    components:{
        AppNavBar
    },
    computed:{
    },
    methods: {
        exportJson(){
            let dataStr = JSON.stringify(this.$store.state);
            let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

            let exportFileDefaultName = 'data.json';

            let linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        },
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

</style>