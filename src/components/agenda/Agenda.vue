<template>
    <app-layout color="white">
        <template v-slot:toolbar>
            <v-btn outlined class="mr-4" @click="setToday">
                Today
            </v-btn>

            <v-btn fab text small @click="prev">
                <v-icon small>mdi-chevron-left</v-icon>
            </v-btn>
            <v-btn fab text small @click="next">
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

        <v-sheet height="702"><!--todo-->
        <v-calendar ref="calendar" :type="type" :weekdays="weekdays" @change="update"
            v-model="now" :start="start" :end="end" :interval-style="intervalStyle" :interval-height="36"
            :class="['border-top', 'border-left', type=='week'?'border-bottom':'']" :style="{height:'100%'}">

            <!--month-->
            <template v-slot:day-label="{date, day}">
                <v-btn text icon>
                    {{day}}
                </v-btn>
                <div class="badge" v-show="noteCountAtDay(date) > 0" :title="'Created ' + noteCountAtDay(date) + ' notes' ">
                    {{ noteCountAtDay(date) }}
                </div>
            </template>
            <template v-slot:day="{date}" >
                <div v-for="(event, index) in dayEvents(date)" :key="index"
                    :class="['event', eventLongDayClass(event)]"
                    v-show=" dayEvents(date).length<=4 || index<3">
                    <span v-if="event && (!event.index || event.index == 0 || date == displayedStart)"
                        :style="longDayTextWidth(event, date)">
                        {{event.name}}
                    </span>
                </div>
                <div v-if="dayEvents(date).length>4" class="event">
                    more...
                </div>
            </template>

            <!--week-->
            <template v-slot:day-header="{date}">
                <div class="badge" v-show="noteCountAtDay(date) > 0" :title="'Created ' + noteCountAtDay(date) + ' notes' ">
                    {{ noteCountAtDay(date) }}
                </div>
                <div v-for="(event,index) in eventsAtDay(date)" :key="index"
                    :class="['event', eventLongDayClass(event)]">
                    <span v-if="event && (!event.index || event.index == 0 || date == displayedStart)"
                        :style="longDayTextWidth(event, date)">
                        {{event.name}}
                    </span>
                </div>
            </template>
            <template v-slot:day-body="{date, present, timeToY, minutesToPixels}">
                <div v-for="event in eventsInDay(date)" :key="event.name" class='event'
                    :style="eventStyle(event, date, timeToY, minutesToPixels)">
                    {{event.name}}
                </div>
                <div v-if="present" class="indicator" :style="{ left:indicator.x + 'px', top:indicator.y + 'px' }"></div>
            </template>

            <template v-slot:day-month>
                <div>day-month</div>
            </template>
        </v-calendar>
        </v-sheet>
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
        timer: null,
        indicator: {
            x:0,
            y:-1
        },
    }),
    components: {
        AppLayout
    },
    created: function(){
    },
    mounted: function(){
        let time = moment();
        this.indicator.y = this.$refs.calendar.timeToY({hour: time.hour(), minute: time.minute()});
        this.$refs.calendar.scrollToTime({hour: time.hour(), minute: time.minute()})
        this.timer = setInterval(() => {
            let time = moment();
            this.indicator.y = this.$refs.calendar.timeToY({hour: time.hour(), minute: time.minute()});
        }, 1000)
    },
    destroyed: function(){
        clearInterval(this.timer)
    },
    computed: {
        ...mapState({
            agendaType: state => state.settings.agenda.type,
            weekStart: state => state.settings.agenda.weekStart,
        }),
        ...mapGetters('agenda', ['eventsAtDay', 'eventsInDay', 'noteCountAtDay']),
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
        displayedStart(){
            if(this.type == "month"){ // month view start always 1 but
                let _1st = moment(this.start);
                let offset = _1st.day() - this.weekStart;
                return _1st.subtract(offset, 'd').format("YYYY-MM-DD");
            }
            return this.start;
        }
    },
    watch: {
        type: function(to, from){
            if(from === 'month' && to === 'week'){
                let offset = this.current.day() - this.weekStart;
                this.start = this.current.subtract(offset, 'd').format("YYYY-MM-DD");
            }
        }
    },
    methods: {
        setToday(){
            let now = moment();
            this.now = now
            this.$refs.calendar.scrollToTime({hour: now.hour(), minute: now.minute()})
        },
        update({start, end}){
            if(this.start == start.date && this.end == end.date){
                return;
            }
            this.start = start.date;
            this.end = end.date;
        },
        dayEvents(date){
            return this.eventsAtDay(date).concat(this.eventsInDay(date));
        },
        intervalStyle({date, day, future, hasDay, hasTime, hour, minute, month, past, present, weekday, year}){
            if(hour < 6 || hour > 21){
                return {
                    backgroundColor: '#EEEEEE'
                }
            }

            return undefined;
        },
        eventStyle(event, date, timeToY, minutesToPixels){

            let top = timeToY(event.startMinutes(date));

            let duration = event.duration();
            let height = 18;
            let realHeight = minutesToPixels(event.duration());
            if(realHeight > height){
                height = realHeight;
            }

            let style = { top: top + 'px', height: height + 'px', width: '96%'}

            if(event.overlap){
                style.left = '4px';
                style.width = 'calc(98% - 4px)';
            }

            if(event.index > 0){
                style["border-top-left-radius"] = 0;
                style["border-top-right-radius"] = 0;
                style["border-top"] = 0;
            }
            
            return style;
        },
        eventLongDayClass(event){
            if(!event){
                return 'invisible'
            }
            
            if(!event.total){
                return '';
            }

            if(event.index == 0){
                return 'event-start';
            }

            if(event.index == event.total){
                return 'event-end';
            }

            return 'event-mid'
        },
        longDayTextWidth(event, date){
            if(event.total){
                return { width: "calc("+100*(event.total-event.index+1)+"%)"}
            }
        },
        prev(){
            if(this.type == 'month'){
                this.$refs.calendar.prev();
            }else{
                this.start = moment(this.start).subtract(7, 'd').format("YYYY-MM-DD");
            }
            
        },
        next(){
            this.$refs.calendar.next();
        }
    }
}
</script>

<style>
.invisible{
    visibility: hidden;
}
.indicator{
    position: absolute;;
    height: 2px;
    background-color:red;
    width: 100%;
    z-index: 5;
}
.event{
    padding:0 .25rem;
    margin-bottom: 1px;
    width:98%;
    border:1px solid black;
    background-color: white;
    border-radius:.25rem;
    font-size: 12px;
    overflow: hidden;
    word-break: break-all;
}
.v-calendar{
    overflow: hidden;
}
/* all day events fixed height 1 line*/
.v-calendar-weekly__day .event, .v-calendar-daily_head-day .event{
    height: 18px;
    white-space: nowrap;
}
/* week view event with time using absolute top & height */
.v-calendar-daily__day .event{
    position: absolute;
}
.event>span{
    display: inline-block;
    overflow: hidden; /* width already cross cell*/
    position: relative;
    z-index: 4;
}
.event-start, .event-mid, .v-calendar-weekly__day{
    overflow: visible;
}
.event-start{
    width: 100%;
    border-right: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    position: relative;
    z-index: 5;
}
.event-mid{
    width: 100%;
    border-radius: 0;
    border-left: 0;
    border-right: 0;
}
.event-end{
    border-left: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}
.v-calendar-weekly__day-label>.v-btn{
    margin-top:-2px; /* exactly 4 in month */
}
.v-calendar-daily_head-day-label>.v-btn{
    width: 36px!important;
    height: 36px!important;
}
/* week view badge position based */
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