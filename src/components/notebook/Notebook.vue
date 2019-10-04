<template>
    <app-layout >
        <template v-slot:toolbar>
            <v-toolbar-title class="d-flex align-baseline">
                <v-icon class="mr-1">mdi-book-open-variant</v-icon>
                <span class="text-uppercase">{{ name }}</span>
            </v-toolbar-title>
        </template>

        <template v-slot:toolbar-items>
            <v-btn-toggle class="align-center" mandatory :value="view" @change="view=$event">
                <v-btn text small v-for="(v,i) in notebook.views" :key="i">
                    <v-icon>{{ v.icon }}</v-icon>
                </v-btn>
            </v-btn-toggle>
        </template>

        <v-row no-gutters class="notebook">
            <v-col v-if="notebook.mode == 'items'" cols="3"></v-col>
            
            <grid-view :view="notebook.views[view]" @name="currentName = $event"></grid-view>
        </v-row>
    </app-layout>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex"

import AppLayout from "../app/Layout"
import GridView from "./view/Grid"

import diary from './view/diary'

export default {
    data: () => ({
        currentName: '',
        notebook: {}
    }),
    components:{
        AppLayout,
        GridView,
    },
    created(){
        this.notebook = diary;
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
.notebook .row{
    border: 1px solid red;
}
.notebook .col{
    border: 1px solid green;
}
</style>