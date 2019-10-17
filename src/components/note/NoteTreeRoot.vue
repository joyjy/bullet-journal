<template>
    <draggable v-if="parent" tag="ul" v-model="noteList" :group="{ name: 'note-tree' }"
        class="note-tree body-2 align-self-start">
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
                this.$store.dispatch("dragToSort", { note: this.root, notes: value}).then(() => {
                        this.$emit("refresh")
                });
            }
        },
    },
}
</script>

<style>
.note-tree {
    width: 100%;
    position: relative;
    max-width: 1000px;
    margin: 0 auto;
}
.note-tree ul{
    padding-left: 16px;
    margin-left: 8px;
    border-left: 1px solid #EEEEEE;
    display: flex;
    flex: 0 0;
    flex-wrap: wrap;
}
.sortable-ghost{
    height: 2px;
    overflow: hidden;
    border: 1px solid black;
    border-radius: 1px;
}
</style>