<template>
  <app-layout>
        <template v-slot:toolbar>
            {{ title }}
        </template>

        <template v-slot:toolbar-items>
            
        </template>
        
        <v-row>
            <note-tree-root :notes="note.notes" :parent="note"></note-tree-root>
        </v-row>
    </app-layout>
</template>

<script>
import _ from "lodash"

import AppLayout from "../app/Layout"
import NoteTreeRoot from "../note/NoteTreeRoot"

export default {
    data: () => ({
        title: "",
        note: { notes: []},
        weekdays: ["Sun", "Mon", "Tus", "Wen", "Thu", "Fri", "Sat"]
    }),
    components:{
        AppLayout,
        NoteTreeRoot
    },
    created: async function(){
        let now = new Date();
        let root = this.$store.getters.findNoteByText('Diary');
        if(!root){
            await this.$store.dispatch("newNote", { text: 'Diary'});
        }

        let year = now.getFullYear().toString();
        let yearNote = _.find(root.notes, (n) => n.text == year.toString())
        if(!yearNote){
            await this.$store.dispatch("newNote", { parent: root, text: year});
        }

        let month = (now.getMonth()+1).toString();
        if(month.length == 1){
            month = "0" +month;
        }
        let monthNote = _.find(yearNote.notes, (n) => n.text == month);
        if(!monthNote){
            await this.$store.dispatch("newNote", { parent: yearNote, text: month});
        }

        let day = now.getDate().toString();
        if(day.length == 1){
            day = "0"+day;
        }
        let weekday = now.getDay();
        this.title = "#" + month + "-" + day + " #" + this.weekdays[weekday]
        let dayNote = _.find(monthNote.notes, (n) => n.text == this.title);
        if(!dayNote){
            await this.$store.dispatch("newNote", { parent: monthNote, index: monthNote.notes.length, text: this.title});
        }

        if(dayNote.notes.length == 0){
            await this.$store.dispatch("newNote", { parent: dayNote });
        }
        
        this.note = dayNote;
    }
}
</script>

<style>

</style>