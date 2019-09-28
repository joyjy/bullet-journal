<template>
    <app-layout color="white">
        <template v-slot:toolbar>
            <v-btn outlined class="mr-4" @click="setToday">
                Today
            </v-btn>

            <v-btn fab text small @click="prev">
                <v-icon small>mdi-chevron-left</v-icon>
            </v-btn>
            <v-btn fab text small @click="$refs.calendar.next()">
                <v-icon small>mdi-chevron-right</v-icon>
            </v-btn>

            <v-toolbar-title>{{ title }}</v-toolbar-title>
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
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Week</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <v-calendar ref="calendar" :type="type" :weekdays="weekdays" @change="update"
            v-model="now" :start="start" :end="end" :interval-style="intervalStyle" :interval-height="30"
            class="border-top border-left" :style="{width:'100%'}" >

            <template v-slot:day-label="{date, day}">
                <v-btn text icon>
                    {{day}}
                </v-btn>
                <div class="badge" v-show="noteCountAtDay(date) > 0" :title="'Created ' + noteCountAtDay(date) + ' notes' ">
                    {{ noteCountAtDay(date) }}
                </div>
            </template>
            <template v-slot:day="{date}">
                <div v-for="event in eventsAtDay(date)" :key="event.name" class='event'>
                    {{event.name}}
                </div>
            </template>

            <template v-slot:day-body="{date, present, timeToY, minutesToPixels}">
                <div v-for="event in eventsAtDay(date)" :key="event.name" class='event'
                    :style="{ top: timeToY(event.startMinutes()) + 'px', height: minutesToPixels(event.duration()) + 'px' }">
                    {{event.name}}
                </div>
                <div v-if="present" class="indicator" :style="{ left:indicator.x + 'px', top:indicator.y + 'px' }"></div>
            </template>
            <template v-slot:day-month>
                <div>day-month</div>
            </template>
            <template v-slot:day-header="{date}">
                <div class="badge" v-show="noteCountAtDay(date) > 0" :title="'Created ' + noteCountAtDay(date) + ' notes' ">
                    {{ noteCountAtDay(date) }}
                </div>
            </template>
        </v-calendar>

    </app-layout>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import AppLayout from "../app/Layout"

import moment from "moment"

export default {
    data:() =>({
        typeLabels: {
            month: 'Month',
            week: 'Week'
        },
        current: moment(),
        start: null,
        end: null,
        events: [],
        timer: null,
        indicator: {
            x:0,
            y:0
        }
    }),
    components: {
        AppLayout
    },
    created: function(){
    },
    mounted: function(){
        let calendar = this.$refs.calendar
        let indicator = this.indicator;
        this.timer = setInterval(() => {
            let time = moment();
            indicator.y = calendar.timeToY({hour: time.hour(), minute: time.minute()});
        }, 1000);
    },
    destroyed: function(){
        clearInterval(this.timer)
    },
    computed: {
        ...mapState({
            agendaType: state => state.settings.agenda.type,
            weekStart: state => state.settings.agenda.weekStart,
        }),
        ...mapGetters('agenda', ['eventsAtDay', 'noteCountAtDay']),
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
            if(this.weekStart == 0){
                return [0, 1, 2, 3, 4, 5, 6]
            }else{
                return [1, 2, 3, 4, 5, 6, 0]
            }
        },
        type:{
            get(){
                return this.agendaType || 'month';
            },
            set(value){
                this.$store.commit("agendaType", value)
            }
        },
        title () {
            const { start, end } = this
            if (!start || !end) {
                return ''
            }

            let startMoment = moment(start);
            let endMoment = moment(end);

            const startMonth = startMoment.format("MMM")
            const endMonth = endMoment.format("MMM")
            const suffixMonth = startMonth === endMonth ? '' : endMonth

            const startYear = startMoment.year()
            const endYear = endMoment.year()
            const suffixYear = startYear === endYear ? '' : endYear

            const startDay = startMoment.format("Do")
            const endDay = endMoment.format("Do");

            switch (this.type) {
            case 'month':
                return `${startMonth} ${startYear}`
            case 'week':
                return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`
            }
            return ''
      },
    },
    watch: {
        type: function(to, from){
            console.log(from, to)
            if(from === 'month' && to === 'week'){
                let offset = this.current.day() - this.weekStart;
                this.start = this.current.subtract(offset, 'd').format("YYYY-MM-DD");
            }
        }
    },
    methods: {
        setToday(){
            this.now = moment()
        },
        update({start, end}){
            console.log(start.date, end.date)
            if(this.start == start.date && this.end == end.date){
                return;
            }
            this.start = start.date;
            this.end = end.date;
        },
        intervalStyle({date, day, future, hasDay, hasTime, hour, minute, month, past, present, weekday, year}){
            if(hour < 6 || hour > 21){
                return {
                    backgroundColor: '#EEEEEE'
                }
            }

            return undefined;
        },
        prev(){
            if(this.type == 'month'){
                this.$refs.calendar.prev();
            }else{
                this.start = moment(this.start).subtract(7, 'd').format("YYYY-MM-DD");
            }
        }
    }
}
</script>

<style>
.indicator{
    position: absolute;;
    height: 2px;
    background-color:red;
    width: 100%;
    z-index: 100;
}
.event{
    position:absolute;
    width:100%;
    border:1px solid black;
    background-color: white;
    word-break: break-all;
    border-radius:.25rem;
    padding:.25rem;
    font-size: 13px;
}
.v-calendar-daily_head-day-label>.v-btn{
    width: 48px!important;
    height: 48px!important;
}
.v-calendar-weekly__day,.v-calendar-daily_head-day{
    position: relative;
}
.badge{
    position: absolute;
    top: 0;
    right: 0;
    background-color:lightgrey;
    border-radius: 0 0 0 1.1rem/1rem;
    font-size: .85rem;
    min-width: 22px;
    display: flex;
    justify-content: center;
}
</style>