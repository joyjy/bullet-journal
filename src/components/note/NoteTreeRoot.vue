<template>
    <draggable tag="ul" class="note-tree body-2 align-self-start" v-model="noteList" :group="{ name: 'note-tree' }">
        <note-tree-item v-for="(note,i) in noteList" :key="note.id"
            :note="note" :index="i" :parent="parent" :query="query" :root="root">
        </note-tree-item>
    </draggable>
</template>

<script>
import NoteTreeItem from './NoteTreeItem'
import draggable from "vuedraggable"

export default {
    props: ['query',
            'parent', // not note, but contain's notes
            "root"], // is note 
    components:{
        draggable,
        NoteTreeItem,
    },
    computed: {
        noteList: {
            get(){
                return this.parent.notes;
            },
            set(value){
                // this.$store.dispatch("dragToSort", { notes: value})
                //     .then(() => {
                //         this.setRoot(this.$route.params.id)
                //     })
            }
        },
    },
}
</script>

<style>
.note-tree {
    width: 100%;
    position: relative;
}
.note-tree ul{
    padding-left: 16px;
    margin-left: 8px;
    border-left: 1px solid #EEEEEE;
}
</style>