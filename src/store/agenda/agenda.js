import Vue from "vue";
import _ from "lodash";
import moment from "moment";

import traversal from "@/lib/tree";
import {toTime} from "@/model/time";

class Event {

    constructor({note, start, end, index, total, order}){
        this.name = note.text;
        this.source = note;
        this.start = start;
        this.end = end;
        this.index = index;
        this.total = total;
        this.order = order;
    }

    startMinutes(date){
        let m = moment(this.start);
        if(date !== m.format("YYYY-MM-DD")){
            return 0;
        }
        return (m.hours()*60)+m.minutes();
    }

    duration(){
        if(this.end){
            return moment.duration(moment(this.end).diff(moment(this.start))).asMinutes();
        }
    }
}

const insert = function(target, date, event, orderByTime){

    let index = _.sortedIndexBy(target[date], event, e => {
        return orderByTime ? e.startMinutes(date): e.start
    });
    if(index > 0 && orderByTime){
        let lastEvent = target[date][index-1];
        if(moment(event.start).isBefore(moment(lastEvent.start).add(30,'m'))){
            event.overlap = true;
        }
    }
    target[date].splice(index, 0, event)
}

export default {
    namespaced: true,
    state: {
        day: {},
        time: {},
        count: {},
    },
    getters:{
        eventsInDay: (state, getters, rootState, rootGetters) => (date) => {
            return state.time[date] || [];
        },
        eventsAtDay: (state, getters, rootState, rootGetters) => (date) => {
            return state.day[date] || [];
        },
        noteCountAtDay: (state, getters, rootState, rootGetters) => (date) => {
            return state.count[date];
        }
    },
    mutations:{
        add(state, {note, time}){
            if(!time){
                return;
            }
            time = toTime(time, note);

            let target = time.startTime ? state.time : state.day;

            let startDate = time.start().clone().hour(0).minute(0)
            let m = startDate.clone();
            
            if(time.endDate || time.endTime){

                let endDate = time.end().clone().hour(0).minute(0)
                let total = moment.duration(endDate.diff(startDate)).asDays();

                for (let i = 0; i <= total; i++) {
                    let date = m.format("YYYY-MM-DD");
                    if(!target[date]){
                        Vue.set(target, date, []);
                    }
                    let event = new Event({
                        note: note,
                        start: time.startFormat(),
                        end: time.endFormat(),
                        index: i,
                        total: total,
                        order: 0,
                    })

                    insert(target, date, event, time.startTime)

                    m.add(1, 'd')
                }
            }else{
                let date = m.format("YYYY-MM-DD");
                if(!target[date]){
                    Vue.set(target, date, []);
                }
                let event = new Event({
                    note: note,
                    start: time.startFormat(),
                    end: time.endFormat(),
                    order: 0,
                })

                insert(target, date, event, time.startTime)
            }
        },
        remove(state, {time}){
            if(!time){
                return;
            }
        }
    }
}