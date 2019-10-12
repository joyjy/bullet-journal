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

        <v-sheet height="calc(100vh - 48px - 24px)" v-resize="onResize">
            <v-calendar ref="calendar" :type="type" :weekdays="weekdays" @change="update"
                :start="start" :end="end" :interval-style="intervalStyle" :interval-height="36">

                <!-- month view header-->
                <template v-slot:day-label="{date, day, present}">
                    <v-btn fab depressed x-small :text="!present">
                        {{day}}
                    </v-btn>
                    <div class="badge" v-show="noteCountAtDay(date) > 0" :title="'Created ' + noteCountAtDay(date) + ' notes' ">
                        {{ noteCountAtDay(date) }}
                    </div>
                </template>
                <!-- month view day-->
                <template v-slot:day="{date}" >
                    <div v-for="(event, index) in dayEvents(date)" :key="index"
                        :class="['event', eventLongDayClass(event)]"
                        v-show="dayEvents(date).length<=mouthDayHeight || index<mouthDayHeight-1"
                        @click="showEvent(event, $event)">
                        <span v-if="event && (!event.index || event.index == 0 || date == displayedStart)"
                            :style="longDayTextWidth(event, date)">
                            <v-icon v-show="event.type === 'schedule'" small>mdi-alarm</v-icon>{{event.name}}
                        </span>
                    </div>
                    <div v-if="dayEvents(date).length>mouthDayHeight" class="event"
                        @click="$router.push({name:'agenda', params:{type:'week', start:date}})">
                        more...
                    </div>
                </template>

                <!--week-->
                <template v-slot:day-header="{date}">
                    <div class="badge" v-show="noteCountAtDay(date) > 0" :title="'Created ' + noteCountAtDay(date) + ' notes' ">
                        {{ noteCountAtDay(date) }}
                    </div>
                    <div v-for="(event,index) in eventsAtDay(date)" :key="index"
                        :class="['event', eventLongDayClass(event)]"
                        @click="showEvent(event, $event)">
                        <span v-if="event && (!event.index || event.index == 0 || date == displayedStart)"
                            :style="longDayTextWidth(event, date)">
                            <v-icon v-show="event.type === 'schedule'" small>mdi-alarm</v-icon>{{event.name}}
                        </span>
                    </div>
                </template>
                <template v-slot:day-body="{date, present, timeToY, minutesToPixels}">
                    <div v-for="(event,index) in eventsInDay(date)" :key="index" class='event'
                        :style="eventStyle(event, date, timeToY, minutesToPixels)"
                        @click="showEvent(event, $event)">
                        <v-icon v-show="event && event.type === 'schedule'" small>mdi-alarm</v-icon>{{ event ? event.name: ''}}
                    </div>
                    <div v-if="present" class="indicator" :style="{ left:indicator.x + 'px', top:indicator.y + 'px' }"></div>
                </template>

                <template v-slot:day-month>
                    <div>day-month</div>
                </template>
            </v-calendar>
        </v-sheet>
        <v-menu v-model="eventOpen" :activator="selectedElement" max-width="270" nudge-right="100" nudge-bottom="12" :close-on-content-click="false">
            <v-card>
                <v-card-text class="pb-0 pt-2">
                    <span class="caption font-italic font-weight-bold">
                        {{ selectedEvent.start }}{{ selectedEvent.end ? ' -> '+ selectedEvent.end : '' }}</span>
                    <v-divider></v-divider>
                    <p class="mt-1 mb-0 pa-1">{{ selectedEvent.source ?  selectedEvent.source.text : ''}}</p>
                </v-card-text>
                <v-card-actions>
                    <v-btn small text :to="{name:'note', params:{id:selectedEvent.source ?  selectedEvent.source.id : ''}}">
                        Focus
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-menu>
    </app-layout>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import AppLayout from "../app/Layout";
import moment from "moment";

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
        eventOpen: false,
        selectedEvent: {},
        selectedElement: null,
        mouthDayHeight: 5, // todo month cross weeks
    }),
    components: {
        AppLayout
    },
    created: function(){
        this.start = this.$route.params.start;
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
                this.$router.push({name:'agenda', params:{type:value, start:this.start}})
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
        "$route" (to, from) {
            if(from.params.type != to.params.type){
                this.$store.commit("agendaType", to.params.type)
            }
            if(to.params.start){
                this.start = to.params.start;
            }else{
                let now = moment();
                this.start = now.format("YYYY-MM-DD");
                this.$refs.calendar.scrollToTime({hour: now.hour(), minute: now.minute()})
            }
        },
        type: function(to, from){
            if(from === 'month' && to === 'week'){
            }
        },
        start: function(){
            this.onResize();
        }
    },
    methods: {
        onResize(){
            let startOf = moment(this.start).startOf('month');
            let endOf = moment(this.start).endOf('month');
            let first = this.weekStart ? startOf.isoWeek(): startOf.week();
            let last = this.weekStart ? endOf.isoWeek(): startOf.week();
            if( first > last) {
                last = first + last;
            }
            let weeks = last-first+1;
            let weekHeight = (this.$refs.calendar.$el.clientHeight-18)/weeks
            this.mouthDayHeight = Math.round((weekHeight-34)/20);
        },
        setToday(){
            this.$router.push({name:'agenda', params:{type:this.type}})
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
        intervalStyle({hour}){
            if(hour < 6 || hour > 21){
                return {
                    backgroundColor: '#EEEEEE'
                }
            }

            return undefined;
        },
        eventStyle(event, date, timeToY, minutesToPixels){

            if(!event){
                return;
            }

            let top = timeToY(event.startMinutes);
            let height = 18;
            let realHeight = minutesToPixels(event.durationMinutes);
            if(realHeight > height){
                height = realHeight;
                let offset = realHeight%18;
                if(offset != 0){
                    height += 18 - offset;
                }
            }

            let style = { top: top + 'px', height: height + 'px', width: '96%'}

            if(event.overlap){
                style.left = event.overlap+'rem';
                style.width = 'calc(98% - '+ event.overlap + 'rem)';
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
        longDayTextWidth(event){
            if(event.total){
                return { width: "calc("+100*(event.total-event.index+1)+"%)"}
            }
        },
        prev(){
            let currentStart = moment(this.start);
            if(this.type == 'month'){
                currentStart.month(currentStart.month()-1);
            }else{
                currentStart.subtract(7, 'd');
            }
            this.$router.push({name:'agenda', params:{type: this.type, start: currentStart.format("YYYY-MM-DD")}})
        },
        next(){
            let currentStart = moment(this.start);
            if(this.type == 'month'){
                currentStart.month(currentStart.month()+1);
            }else{
                currentStart.add(7, 'd');
            }
            this.$router.push({name:'agenda', params:{type: this.type, start: currentStart.format("YYYY-MM-DD")}})
        },
        showEvent(event, mouseEvent){
            const open = () => {
                this.selectedEvent = event
                this.selectedElement = mouseEvent.target
                setTimeout(() => this.eventOpen = true, 10)
            }

            if (this.eventOpen) {
                this.eventOpen = false
                setTimeout(open, 10)
            } else {
                open()
            }

            mouseEvent.stopPropagation();
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
    cursor: pointer;
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
.event .v-icon{
    margin-top: -4px;
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