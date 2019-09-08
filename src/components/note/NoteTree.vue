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
        </v-toolbar>
        <v-divider></v-divider>
        <v-container fluid>
            <ul class="note-tree">
                <note-tree-item v-for="(note,i) in notes" :key="note.id" :note="note" :index="i" :parent="$data">
                </note-tree-item>
            </ul>
        </v-container>
    </div>
</template>

<script>
import NoteTreeItem from './NoteTreeItem.vue'
import range from '../../lib/range'

export default {
    name: "note-tree",
    data: function(){
        return {
            notes: [],
            breadsrumbs: [],
        }
    },
    components:{
        NoteTreeItem
    },
    created: function(){
        this.setRoot(this.$route.params.id)
    },
    mounted: function(){
        if(this.notes.length == 1 && this.notes[0].text == ""){
            this.$nextTick(() => {
                this.focus();
            })
        }
    },
    watch: {
        '$route' (to, from) {
            this.setRoot(to.params.id)
        }
    },
    methods:{
        setRoot: function(id){
            if(!id){
                this.breadsrumbs = []
                this.notes = this.$store.state.notes;
                return;
            }

            let root = this.$store.getters.findNoteById(id)
            if(root){
                this.setBreadsrumbs(root)
                this.notes = [root]
            }else{
                this.notes = [] // todo
            }
        },
        setBreadsrumbs: function(note){
            this.breadsrumbs = [];
            while(note.parent){
                this.breadsrumbs.unshift(note)
                note = note.parent;
            }
            this.breadsrumbs.unshift(note)
            this.breadsrumbs.unshift("Root")
        }
    }
}
</script>

<style>
.note-tree{
}
</style>