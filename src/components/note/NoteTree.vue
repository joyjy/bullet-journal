<template>
    <app-layout :right-drawer="true">

        <template v-slot:toolbar>
            <v-breadcrumbs :items="breadsrumbs" divider=">">
                <template v-slot:item="props">
                    <v-breadcrumbs-item v-if="props.item.id" :to="{ name:'note', params:{ id: props.item.id }}">
                        {{ props.item.text }}
                    </v-breadcrumbs-item>
                    <v-breadcrumbs-item v-else to="/">
                        {{ props.item }}
                    </v-breadcrumbs-item>
                </template>
            </v-breadcrumbs>
        </template>

        <template v-slot:toolbar-items>
            <v-text-field prepend-inner-icon="mdi-magnify" class="compact-form"
                clearable solo rounded flat :value="$route.query.q"
                @change="search" @click:clear="search('')">
            </v-text-field>

            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn icon @click="switchCollapse" v-on="on">
                        <v-icon>mdi-arrow-expand-vertical</v-icon>
                    </v-btn>
                </template>
                <span>Toggle Outline Level</span>
            </v-tooltip>
            <v-btn text @click="$store.commit('backup')">
                Backup
            </v-btn>
            <v-btn text @click="$store.commit('restore')">
                Restore
            </v-btn>
        </template>
        
        <note-tree-root :notes="notes" :query="query" :parent="$data"></note-tree-root>
    </app-layout>
</template>

<script>
import AppLayout from '../app/Layout'
import NoteTreeRoot from './NoteTreeRoot'

import range from '@/lib/range'

import _ from "lodash"
import traversal from "@/lib/tree"
import filter from "@/lib/filter"

export default {
    props: ['root'],
    data: function(){
        return {
            notes: [],
            breadsrumbs: [],
            collapseLevel: -1,
            depth: 0,
            query: undefined,
        }
    },
    components:{
        AppLayout,
        NoteTreeRoot,
    },
    created: function(){
        this.refresh();
    },
    mounted: function(){
    },
    watch: {
        '$route' (to, from) {
            this.refresh();
        }
    },
    computed: {
        noteList: {
            get(){
                return this.notes;
            },
            set(value){
                // this.$store.dispatch("dragToSort", { notes: value})
                //     .then(() => {
                //         this.setRoot(this.$route.params.id)
                //     })
            }
        },
    },
    methods:{
        refresh: function(){
            this.setRoot();
            if(this.$route.query.q){
                this.setFilter();
            }else{
                this.query = undefined;
            }
        },
        setRoot: function(){
            let id;
            if(this.root){
                id = this.root.id;
            }else{
                id = this.$route.params.id
            }
            if(!id){
                this.breadsrumbs = []
                this.notes = this.$store.state.notes;
            }else {
                let stack = this.$store.getters.findNoteStackById(id)
                if(stack){
                    stack.unshift("Root");
                    this.breadsrumbs = stack;
                    this.notes = stack.slice(-1)
                }else{
                    this.notes = [] // todo
                }
            }

            this.depth = traversal.depth(this.notes);
        },
        switchCollapse(){
            this.collapseLevel++;
            let maxLevel = this.depth-2;
            if(this.collapseLevel > maxLevel){
                this.collapseLevel = -1;
            }
            this.$store.commit("switchOutline", { notes: this.notes, level: this.collapseLevel });
        },
        setFilter(){
            this.query = filter.parse(this.$route.query.q);
        },
        search(payload){
            console.log(payload)
            this.$router.push({ name:'note', params:{ id: this.$route.params.id }, query: {q: payload}});
        }
    }
}
</script>

<style>
</style>