<template>
  <NoteTree :root="note">
      <template v-slot:toolbar>
        {{ title }}
      </template>
  </NoteTree>
</template>

<script>
import _ from "lodash"

import NoteTree from "../note/NoteTree"

export default {
    data: () => ({
        title: "",
        note: {},
        weekdays: ["Sun", "Mon", "Tus", "Wen", "Thu", "Fri", "Sat"]
    }),
    components:{
        NoteTree
    },
    created: async function(){
        let now = new Date();
        let root = this.$store.getters.findNoteByText('Jibun');
        if(!root){
            await this.$store.dispatch("newNote", { text: 'Jibun'});
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