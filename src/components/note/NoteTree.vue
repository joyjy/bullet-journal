<template>
    <div>
        <v-toolbar flat dense color="#fafafa">
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

            <div class="flex-grow-1"></div>

            <v-toolbar-items>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn icon @click="switchCollapse" v-on="on" :class="{op:true}">
                            <v-icon>mdi-arrow-expand-vertical</v-icon>
                        </v-btn>
                    </template>
                    <span>Toggle Outline Level</span>
                </v-tooltip>
                
            </v-toolbar-items>
        </v-toolbar>
        <v-divider></v-divider>
        <v-container fluid>
            <draggable tag="ul" class="note-tree" v-model="noteList" :group="{ name: 'note-tree' }">
                <note-tree-item v-for="(note,i) in notes" :key="note.id" :note="note" :index="i" :parent="$data">
                </note-tree-item>
            </draggable>
        </v-container>
    </div>
</template>

<script>
import NoteTreeItem from './NoteTreeItem.vue'
import range from '../../lib/range'

import draggable from "vuedraggable"

export default {
    name: "note-tree",
    data: function(){
        return {
            notes: [],
            breadsrumbs: [],
            collapseLevel: -1,
        }
    },
    components:{
        draggable,
        NoteTreeItem
    },
    created: function(){
        this.setRoot(this.$route.params.id)
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
                return;
            }

            let stack = this.$store.getters.findNoteStackById(id)
            if(stack){
                stack.unshift("Root");
                this.breadsrumbs = stack;
                this.notes = stack.slice(-1)
            }else{
                this.notes = [] // todo
            }
        },
        switchCollapse(){
            this.collapseLevel++;
            if(this.collapseLevel > 2){
                this.collapseLevel = -1;
            }
            this.$store.commit("switchOutline", { notes: this.notes, level: this.collapseLevel });
        }
    }
}
</script>

<style>
.note-tree{
    font-size: 14px;
}
button.op:focus:before{
    opacity: 0 !important;
}
</style>