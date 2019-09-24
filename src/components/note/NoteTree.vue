<template>
    <app-layout :right-drawer="true">

        <template v-slot:toolbar>
            <v-breadcrumbs v-show="breadsrumbs.length>0" :items="breadsrumbs" divider=">" :style="{paddingRight:'0px'}">
                <template v-slot:item="props">
                    <v-breadcrumbs-item v-if="props.item.id" :to="{ name:'note', params:{ id: props.item.id }}">
                        {{ props.item.text }}
                    </v-breadcrumbs-item>
                    <v-breadcrumbs-item v-else to="/">
                        {{ props.item }}
                    </v-breadcrumbs-item>
                </template>
            </v-breadcrumbs>

            <v-tooltip right>
                <template v-slot:activator="{ on }">
                    <v-btn  text icon small v-if="id && !query" @click="switchStarredNote({note:notes[0]})" v-on="on">
                        <v-icon v-if="isStarred(id)" color="yellow darken-1">mdi-star</v-icon>
                        <v-icon v-else>mdi-star-outline</v-icon>
                    </v-btn>
                </template>
                <span>Toggle Starred Note</span>
            </v-tooltip>
        </template>

        <template v-slot:toolbar-items>

            <v-toolbar-items>
                <v-text-field class="compact-form" :style="{width: 20+'rem'}" clearable solo rounded flat
                    :prepend-inner-icon="query && isSavedFilter(query.value) ? 'mdi-filter' : 'mdi-filter-outline'"
                    @click:prepend-inner="switchSaveFilter({text:query.value})"
                    :value="$route.query.q"
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
            </v-toolbar-items>
        </template>
        
        <note-tree-root :query="query" :parent="$data" :root="root"></note-tree-root>
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
    data: function(){
        return {
            root: null,
            breadsrumbs: [],
            notes: [],
            depth: 0,
            collapseLevel: -1,
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
    destroyed: function(){
        this.$eventbus.$off('search')
    },
    watch: {
        '$route' () {
            this.refresh();
        }
    },
    computed: {
        ...mapGetters({
            isStarred: "saved/isStarred",
            isSavedFilter: "saved/isSavedFilter"
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
            return this.$route.params.id;
        }
    },
    methods:{
        ...mapMutations({
            switchSaveFilter: "saved/filter",
            switchStarredNote: "saved/note"
        }),
        refresh: function(){
            this.root = null;
            this.breadsrumbs = [];
            this.notes = [];

            if(!this.id){
                this.notes = this.$store.state.notes;
            }else {
                let stack = this.$store.getters.findNoteStackById(this.id)
                if(stack){
                    stack.unshift("Root");
                    this.breadsrumbs = stack;
                    this.notes = stack.slice(-1)
                    this.root = this.notes[0];
                }
            }

            this.depth = traversal.depth(this.notes);

            if(this.$route.query.q){
                this.query = filter.parse(this.$route.query.q);
            }else{
                this.query = null;
            }
        },
        switchCollapse(){
            this.collapseLevel++;
            let maxLevel = this.depth-2;
            if(this.collapseLevel > _.min([maxLevel, 2])){
                this.collapseLevel = -1;
            }
            this.$store.commit("switchOutline", { notes: this.notes, level: this.collapseLevel });
        },
        search(payload){
            this.$router.push({ name:'note', params:{ id: this.id }, query: {q: payload}});
        }
    }
}
</script>

<style>
.compact-form {
    transform: scale(0.75);
    transform-origin: 75% center;
}
</style>