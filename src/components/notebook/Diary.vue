<template>
  <app-layout :right-drawer="true">
        <template v-slot:toolbar>
            {{ today.text }}
        </template>

        <template v-slot:toolbar-items>
            <v-btn-toggle class="align-center" mandatory
                :value="$store.state.display.view['diary']" 
                @change="$store.commit('switchView', {key:'diary', value:$event})">
                <v-btn text small>
                    <v-icon>mdi-view-list</v-icon>
                </v-btn>
                <v-btn text small>
                    <v-icon>mdi-view-array</v-icon>
                </v-btn>
                <v-btn text small>
                    <v-icon>mdi-view-quilt</v-icon>
                </v-btn>
                <v-btn text small>
                    <v-icon>mdi-view-column</v-icon>
                </v-btn>
            </v-btn-toggle>
        </template>
        
        <v-row no-gutters class="fill-height">
            <v-col v-if="view == 'morning-diary' || view == 'day-column'" cols='3' class="border-right" no-gutters>
                <v-subheader>
                    {{ todo.text }}

                    <div class="flex-grow-1"></div>
                    <v-btn small text icon>
                        <v-icon small color="grey lighten-2">mdi-settings-outline</v-icon>
                    </v-btn>
                </v-subheader>

                <note-tree-root :notes="todo.notes" :parent="todo"></note-tree-root>
            </v-col>
            <v-col no-gutters>
                <v-row no-gutters>
                    <v-col>
                        <note-tree-root :notes="today.notes" :parent="today"></note-tree-root>
                    </v-col>
                </v-row>
                <v-row v-if="view == 'morning-diary'" class="border-top" no-gutters>
                    <v-col class="border-right">
                        <v-subheader>{{ yesterday&&yesterday.text || '"Yesterday"'}}

                            <div class="flex-grow-1"></div>
                            <v-btn small text icon>
                                <v-icon small color="grey lighten-2">mdi-settings-outline</v-icon>
                            </v-btn>
                        </v-subheader>
                        <note-tree-root v-if="yesterday" :notes="yesterday.notes" :parent="yesterday"></note-tree-root>
                    </v-col>
                    <v-col>
                        <v-subheader>{{ lastYear&&lastYear.text || '"Last year"'}}

                            <div class="flex-grow-1"></div>
                            <v-btn small text icon>
                                <v-icon small color="grey lighten-2">mdi-settings-outline</v-icon>
                            </v-btn>
                        </v-subheader>
                        <note-tree-root v-if="lastYear" :notes="lastYear.notes" :parent="lastYear"></note-tree-root>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </app-layout>
</template>

<script>
import _ from "lodash"

import AppLayout from "../app/Layout"
import NoteTreeRoot from "../note/NoteTreeRoot"

export default {
    data: () => ({
        notebook: null,
        today: { notes: []},
        todo: {notes:[]},
        lastYear: null,
        yesterday: null,
        weekdays: ["Sun", "Mon", "Tus", "Wen", "Thu", "Fri", "Sat"],
        views: ['day','day-column','morning-diary', 'jibun-week']
    }),
    components:{
        AppLayout,
        NoteTreeRoot
    },
    created: async function(){
        this.notebook = await this.$store.dispatch("findByTextOrNewNote", { text: "Diary #notebook"});

        let now = new Date();
        let parts = this.depart(now);

        let yearNote = await this.$store.dispatch("findByTextOrNewNote", { text: parts.year, parent: this.notebook});
        let monthNote = await this.$store.dispatch("findByTextOrNewNote", { text: parts.month, parent: yearNote});

        this.today = await this.$store.dispatch("findByTextOrNewNote", { 
                                parent: monthNote, 
                                index: monthNote.notes.length, 
                                text: parts.title
                            });
        if(this.today.notes.length == 0){
            this.$store.dispatch("newNote", { parent: this.today });
        }

        this.todo = await this.$store.dispatch("findByTextOrNewNote", { text: 'Inbox'})
        if(this.todo.notes.length == 0){
            this.$store.dispatch("newNote", { parent: this.todo });
        }

        this.lastYear = this.$store.getters.findNoteBy(note => note.text == this.depart(this.prevDate(now, "year")).title);
        this.yesterday = this.$store.getters.findNoteBy(note => note.text == this.depart(this.prevDate(now, "day")).title);
        
    },
    computed: {
        view(){
            return this.views[this.$store.state.display.view['diary']]
        }
    },
    methods: {
        depart(date){
            let result = {};

            result.year = date.getFullYear().toString()
            result.month = date.getMonth() < 9 ? '0' + (date.getMonth()+1) : (date.getMonth()+1).toString()
            result.day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate().toString()
            result.title = result.year + " #" + result.month + "-" + result.day + " #" + this.weekdays[date.getDay()]

            return result;
        },
        prevDate(date, unit){
            let newDate = new Date(date.getTime());
            switch(unit){
                case 'year': newDate.setFullYear(newDate.getFullYear-1);break;
                case 'day': newDate.setDate(newDate.getDate()-1);break;
            }
            return newDate;
        }
        
    }
}
</script>

<style>
.border-left{
    border-left: 1px solid rgba(0, 0, 0, 0.12);
}
.border-right{
    border-right: 1px solid rgba(0, 0, 0, 0.12);
}
.border-top{
    border-top: 1px solid rgba(0, 0, 0, 0.12);
}
.border-bottom{
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
</style>