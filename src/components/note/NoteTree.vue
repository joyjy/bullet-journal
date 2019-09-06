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
import Range from '../dom/Range'

export default {
    name: "note-tree",
    data: function(){
        return {
            data: [
                {
                    id: 1,
                    text: 'hello',
                    notes: [
                        {
                            id:2,
                            parent: { id: 1, text: "hello"},
                            text:'world',
                            notes: []
                        }
                    ]
                }
            ],
            notes: [],
            breadsrumbs: [],
            focus: Range.focus
        }
    },
    components:{
        NoteTreeItem
    },
    created: function(){
        if(this.$route.params.id){
            let note = this.find(this.data, this.$route.params.id);
            if(note){
                this.setBreadsrumbs(note)
                this.notes = [note]
            }else{
                this.notes = [];
            }
        }else{
            this.notes = this.data;
        }
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
            if(!to.params.id){
                this.breadsrumbs = []
                this.notes = this.data;
                return;
            }

            let note = this.find(this.data, to.params.id)
            if(note){
                this.setBreadsrumbs(note)
                this.notes = [note]
            }else{
                this.notes = []
            }
        }
    },
    methods:{
        find: function(array, id){
            if(array.length == 0){
                return;
            }
            let found;
            array.forEach((note) => {
                if(note.id == parseInt(id)){
                    found = note;
                }else{
                    found = this.find(note.notes, id);
                }
            })
            return found;
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