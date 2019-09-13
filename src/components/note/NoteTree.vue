<template>
    <div>
        <v-navigation-drawer app clipped right class="px-2">
            <tag-all></tag-all>
        </v-navigation-drawer>

        <v-app-bar app flat dense clipped-right color="grey lighten-5">
            <slot name="toolbar">
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
            </slot>

            <div class="flex-grow-1"></div>

            <v-toolbar-items>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn icon @click="switchCollapse" v-on="on" :class="{nofocus:true}">
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
            </v-toolbar-items>
        </v-app-bar>

        <v-divider id="app-bar-divider"></v-divider>
        
        <v-content>
            <v-container fluid>
                <draggable tag="ul" id="note-tree" class="body-2" v-model="noteList" :group="{ name: 'note-tree' }">
                    <note-tree-item v-for="(note,i) in notes" :key="note.id"
                        :note="note" :index="i" :parent="$data" :query="query">
                    </note-tree-item>
                </draggable>
            </v-container>
        </v-content>
    </div>
</template>

<script>
import NoteTreeItem from './NoteTreeItem.vue'
import AllTag from '../tag/AllTag'

import range from '@/lib/range'

import _ from "lodash"
import traversal from "@/lib/tree"
import filter from "@/lib/filter"

import draggable from "vuedraggable"

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
        draggable,
        NoteTreeItem,
        "tag-all": AllTag,
    },
    created: function(){
        if(this.$route.name == 'filter'){
            this.breadsrumbs = []
            this.notes = this.$store.state.notes;
            this.query = undefined;
            this.setFilter();
        }else{
            this.setRoot();
        }
    },
    mounted: function(){
    },
    watch: {
        '$route' (to, from) {
            this.created();
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
    }
}
</script>

<style>
button.nofocus:focus:before{
    opacity: 0 !important;
}
#app-bar-divider{
    position: fixed;
    width: 100%;
    top: 48px;
    z-index: 5;
}
</style>