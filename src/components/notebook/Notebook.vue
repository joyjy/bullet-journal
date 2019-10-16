<template>
    <app-layout>
        <template v-slot:toolbar>
            <v-toolbar-title class="d-flex align-baseline">
                <v-icon class="mr-1">mdi-book-open-variant</v-icon>
                <span class="text-uppercase">{{ name }}</span>

                <span v-show="currentName"> > {{ currentName }}</span>
            </v-toolbar-title>

            <v-btn v-if="notebook.mode == 'pages'" fab text small @click="notebook.prev">
                <v-icon small>mdi-chevron-left</v-icon>
            </v-btn>
            <v-btn v-if="notebook.mode == 'pages'" fab text small @click="notebook.next">
                <v-icon small>mdi-chevron-right</v-icon>
            </v-btn>

        </template>

        <template v-slot:toolbar-items>
            <v-btn-toggle class="align-center" mandatory :value="view" @change="view=$event">
                <v-btn text small v-for="(v,i) in notebook.views" :key="i">
                    <v-icon v-if="v.icon.startsWith('mdi-')">{{ v.icon }}</v-icon>
                    <span v-else>{{ v.icon }}</span>
                </v-btn>
            </v-btn-toggle>
        </template>

        <v-row no-gutters class="notebook fill-height ma-n3">
            <v-col v-if="notebook.mode == 'items'" cols="3"></v-col>
            
            <grid-view v-if="notebook.views.length>0" :view="notebook.views[view]"></grid-view>
        </v-row>
    </app-layout>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex"

import AppLayout from "../app/Layout"
import GridView from "./view/Grid"

import {Notebook} from "@/model/notebook"

export default {
    data: () => ({
        notebook: new Notebook(),
        currentName: ''
    }),
    components:{
        AppLayout,
        GridView,
    },
    created(){
        let notebook = this.$store.getters["notebook/findByName"](this.name);
        if(!notebook){
            this.$router.push({name:"note"}).catch(err => {})
        }
        this.notebook = notebook;
    },
    mounted(){
        this.$eventbus.$on("notebook/item-name", (value) => this.currentName = value);
    },
    destroyed(){
        this.$eventbus.$off("notebook/item-name");
    },
    computed: {
        name(){
            return this.$route.params.name;
        },
        view:{
            get(){
                return this.notebook.view;
            },
            set(value){
                this.notebook.view = value;
            }
        }
    },
}
</script>

<style>
</style>