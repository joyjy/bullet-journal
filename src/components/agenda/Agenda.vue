<template>
    <app-layout color="white">
        <template v-slot:toolbar>
            <v-btn outlined class="mr-4">
                Today
            </v-btn>

            <v-btn fab text small @click="$refs.calendar.prev()">
                <v-icon small>mdi-chevron-left</v-icon>
            </v-btn>
            <v-btn fab text small @click="$refs.calendar.next()">
                <v-icon small>mdi-chevron-right</v-icon>
            </v-btn>

            <v-toolbar-title>{{ }}</v-toolbar-title>
        </template>

        <template v-slot:toolbar-items>
          <v-menu bottom right>
            <template v-slot:activator="{ on }">
              <v-btn outlined v-on="on" >
                <span>{{ typeLabels[type] }}</span>
                <v-icon right>mdi-menu-down</v-icon>
              </v-btn>
            </template>

            <v-list>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Month</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <v-calendar ref="calendar" :type="type" :weekdays="weekdays" @change="update"
            v-model="now" :start="start" :end="end" :events = "events"
            class="border-top border-left" >
            <!-- <template v-slot:day="{date}">
                <div :style="{'max-height': '1rem'}">
                    <div class="body-2" v-for="note in notesIn(date)" :key="note.id">
                        - {{note.text}}
                    </div>
                </div>
            </template> -->
        </v-calendar>
    </app-layout>
</template>

<script>
import AppLayout from "../app/Layout"

import moment from "moment"

export default {
    data:() =>({
        type: 'month',
        typeLabels: {
            month: 'Month'
        },
        current: moment(),
        start: null,
        end: null,
        events: []
    }),
    components: {
        AppLayout
    },
    created: function(){
    },
    computed:{
        now: {
            get(){
                this.current.format("YYYY-MM-DD")
            },
            set(value){
                let newCurrent =  moment(value);
                if(newCurrent.isBefore(moment(this.start))){
                    this.start = newCurrent.subtract(newCurrent.date()-1, 'd').format("YYYY-MM-DD")
                }else if(newCurrent.isAfter(moment(this.end))){
                    this.start = newCurrent.format("YYYY-MM-DD");
                }
            }
        },
        weekdays(){
            if(this.$store.state.display.agenda.weekStart == 0){
                return [0, 1, 2, 3, 4, 5, 6]
            }else{
                return [1, 2, 3, 4, 5, 6, 0]
            }
        }
    },
    methods: {
        update({start, end}){
            if(this.start == start.date && this.end == end.date){
                return;
            }
            this.start = start.date;
            this.end = end.date;
            let day = moment(this.start);
            let endDay = moment(this.end).add(1, 'd');
            while(day.isBefore(endDay)){
                let nextDay = day.clone().add(1, 'd');
                let notes = this.$store.getters.filterNoteBy(note => moment(note.id).isBetween(day, nextDay));
                if(notes.length > 0){
                    this.events.push({
                        name: notes.length +" notes",
                        start:day.format("YYYY-MM-DD"),
                        notes: notes
                    })
                }
                day.add(1, 'd')
            }
        }
    }
}
</script>

<style>

</style>