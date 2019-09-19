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
            <v-btn text icon small v-if="query" @click="switchSaveFilter">
                <v-icon>mdi-filter-outline</v-icon>
            </v-btn>
            <v-btn  text icon small v-else v-show="id" @click="switchStarredNote({note:notes[0]})">
                <v-icon v-if="isStarred(id)" color="yellow darken-1">mdi-star</v-icon>
                <v-icon v-else>mdi-star-outline</v-icon>
            </v-btn>
        </template>

        <template v-slot:toolbar-items>

            <v-toolbar-items>
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
                <v-btn text @click="$store.dispatch('backup')">
                    Backup
                </v-btn>
                <v-btn text @click="$store.commit('restore')">
                    Restore
                </v-btn>
            </v-toolbar-items>
        </template>
        
        <note-tree-root :notes="notes" :query="query" :parent="$data"></note-tree-root>
    </app-layout>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex'

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
        this.$eventbus.$on('search', e => this.search(e))
    },
    watch: {
        '$route' () {
            this.refresh();
        }
    },
    computed: {
        ...mapGetters({
            isStarred: "saved/isStarred"
        }),
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
        id: function(){
            if(this.root){
                return this.root.id;
            }else{
                return this.$route.params.id
            }
        }
    },
    methods:{
        ...mapMutations({
            switchSaveFilter: "saved/filter",
            switchStarredNote: "saved/note"
        }),
        refresh: function(){
            this.setRoot();
            if(this.$route.query.q){
                this.setFilter();
            }else{
                this.query = undefined;
            }
        },
        setRoot: function(){
            if(!this.id){
                this.breadsrumbs = []
                this.notes = this.$store.state.notes;
            }else {
                let stack = this.$store.getters.findNoteStackById(this.id)
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
            if(this.collapseLevel > _.min([maxLevel, 2])){
                this.collapseLevel = -1;
            }
            this.$store.commit("switchOutline", { notes: this.notes, level: this.collapseLevel });
        },
        setFilter(){
            this.query = filter.parse(this.$route.query.q);
        },
        search(payload){
            this.$router.push({ name:'note', params:{ id: this.$route.params.id }, query: {q: payload}});
        }
    }
}
</script>

<style>
</style>