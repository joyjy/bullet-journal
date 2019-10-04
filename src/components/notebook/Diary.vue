<template>
  <app-layout :right-drawer="true" :right-drawer-width="272">
        <template v-slot:toolbar>
            {{ today.text }}
        </template>

        <template v-slot:toolbar-items>
            <v-btn-toggle class="align-center" mandatory
                :value="$store.state.settings.view['diary']" 
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
import {mapActions, mapGetters} from "vuex"

import _ from "lodash"
import moment from "moment"

import AppLayout from "../app/Layout"
import NoteTreeRoot from "../note/NoteTreeRoot"

export default {
    data: () => ({
        notebook: null,
        now: moment(),
        today: { notes: [] },
        todo: { notes: [] },
        lastYear: null,
        yesterday: null,
        weekdays: ["Sun", "Mon", "Tus", "Wen", "Thu", "Fri", "Sat"],
        views: ['day', 'day-column', 'morning-diary', 'jibun-week']
    }),
    components:{
        AppLayout,
        NoteTreeRoot
    },
    created: function(){
        this.notebook = this.findByTextOrCreate({ text: "Diary #notebook"});

        let yearNote = this.findByTextOrCreate({ text: this.parts.year, parent: this.notebook});
        let monthNote = this.findByTextOrCreate({ text: this.parts.month, parent: yearNote});

        this.today = this.findByTextOrCreate({ 
                                parent: monthNote, 
                                index: monthNote.notes.length, 
                                text: this.parts.title
                            });
        if(this.today.notes.length == 0){
            this.newNote({ parent: this.today });
        }

        this.todo = this.findByTextOrCreate({ text: 'Inbox'})
        if(this.todo.notes.length == 0){
            this.newNote({ parent: this.todo });
        }

        this.lastYear = this.findNoteByText(this.lastYearTitle);
        this.yesterday = this.findNoteByText(this.yesterdayTitle);
    },
    computed: {
        ...mapGetters(['findNoteByText']),
        view(){
            return this.views[this.$store.state.settings.view['diary']]
        },
        parts(){
            return {
                year: this.now.format("YYYY"),
                month: this.now.format("MM"),
                day: this.now.format("DD"),
                title: this.now.format("YYYY #MM-DD #ddd")
            }
        },
        lastYearTitle(){
            return this.now.clone().subtract(1, 'y').format("YYYY #MM-DD #ddd")
        },
        yesterdayTitle(){
            return this.now.clone().subtract(1, 'd').format("YYYY #MM-DD #ddd")
        }
    },
    methods: {
        ...mapActions({
            findByTextOrCreate: 'findByTextOrNewNote',
            newNote: 'newNote',
        })
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