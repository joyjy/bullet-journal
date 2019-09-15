<template>
    <draggable tag="ul" class="note-tree body-2" v-model="noteList" :group="{ name: 'note-tree' }">
        <note-tree-item v-for="(note,i) in noteList" :key="note.id"
            :note="note" :index="i" :parent="parent" :query="query">
        </note-tree-item>
    </draggable>
</template>

<script>
import NoteTreeItem from './NoteTreeItem'
import draggable from "vuedraggable"

export default {
    props: ['notes', 'query', 'parent'],
    data: function(){
        return {
        }
    },
    components:{
        draggable,
        NoteTreeItem,
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
    }
}
</script>

<style>
.note-tree {
    width: 100%;
    margin-bottom: 1rem;
}
.note-tree ul{
    padding-left: 16px;
    margin-left: 8px;
    border-left: 1px solid #EEEEEE;
}
</style>