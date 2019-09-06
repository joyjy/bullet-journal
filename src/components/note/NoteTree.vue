<template>
    <ul>
        <note-tree-item v-for="(note,i) in notes" :key="note.id" :note="note" :index="i" :parent="$data">
        </note-tree-item>
    </ul>
</template>

<script>
import NoteTreeItem from './NoteTreeItem.vue'
import Range from '../dom/Range'

export default {
    name: "note-tree",
    data: function(){
        return {
            notes: [
                {
                    id: 1,
                    text: '',
                    notes: [
                    ]
                }
            ],
            focus: Range.focus
        }
    },
    components:{
        NoteTreeItem
    },
    mounted: function(){
        if(this.notes.length == 1 && this.notes[0].text == ""){
            this.$nextTick(() => {
                this.focus();
            })
        }
    }
}
</script>

<style>
</style>