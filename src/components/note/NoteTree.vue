<template>
    <div>
        <v-navigation-drawer app clipped right class="px-2">
            <v-chip-group column>
                <v-chip v-for="(count, text) in $store.state.tag.flattern" :key="text"
                    label small>
                    <span class="font-weight-bold">{{ text }}</span>
                    <span>({{ count }})</span>
                </v-chip>
            </v-chip-group>
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
            </v-toolbar-items>
        </v-app-bar>

        <v-divider id="app-bar-divider"></v-divider>
        
        <v-content>
            <v-container fluid>
                <draggable tag="ul" id="note-tree" class="body-2" v-model="noteList" :group="{ name: 'note-tree' }">
                    <note-tree-item v-for="(note,i) in notes" :key="note.id" :note="note" :index="i" :parent="$data">
                    </note-tree-item>
                </draggable>
            </v-container>
        </v-content>
    </div>
</template>

<script>
import NoteTreeItem from './NoteTreeItem.vue'
import range from '@/lib/range'

import _ from "lodash"
import traversal from "@/lib/tree"

import draggable from "vuedraggable"

export default {
    name: "note-tree",
    props: ['root'],
    data: function(){
        return {
            notes: [],
            breadsrumbs: [],
            collapseLevel: -1,
            depth: 0,
        }
    },
    components:{
        draggable,
        NoteTreeItem
    },
    created: function(){
        if(!this.root){
            this.setRoot(this.$route.params.id)
        }else{
            this.notes = this.root.notes;
        }
    },
    mounted: function(){
    },
    watch: {
        '$route' (to, from) {
            this.setRoot(to.params.id)
        }
    },
    computed: {
        noteList: {
            get(){
                return this.notes;
            },
            set(value){
                this.$store.dispatch("dragToSort", { notes: value})
                    .then(() => {
                        this.setRoot(this.$route.params.id)
                    })
            }
        },
    },
    methods:{
        setRoot: function(id){
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
            if(maxLevel > 3){
                maxLevel = 3;
            }
            if(this.collapseLevel > maxLevel){
                this.collapseLevel = -1;
            }
            this.$store.commit("switchOutline", { notes: this.notes, level: this.collapseLevel });
        }
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