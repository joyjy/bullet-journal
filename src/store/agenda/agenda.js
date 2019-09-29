import Vue from "vue";
import _ from "lodash";
import moment from "moment";

import traversal from "@/lib/tree";
import {toTime} from "@/model/time";

class Event{

    constructor({time, name, source}){
        this.name = name;
        this.source = source;
        this.start = time.startFormat();
        this.end = time.endFormat();
        this.index = time.index;
        this.total = time.total;
    }

    startMinutes(date){
        let m = moment(this.start);
        if(date !== m.format("YYYY-MM-DD")){
            return -1;
        }
        return (m.hours()*60)+m.minutes();
    }

    duration(){
        if(this.end){
            return moment.duration(moment(this.end).diff(moment(this.start))).asMinutes();
        }
    }
}

export default {
    namespaced: true,
    state: {
    },
    getters:{
        //[has time]
        eventsInDay: (state, getters, rootState, rootGetters) => (day) => {
            let events = [];

            if(typeof day === "string"){
                day = moment(day);
            }

            let times = state[day.format("YYYY-MM-DD")];

            _.each(times, (t) => {
                if(!t.startTime){
                    return;
                }
                let time = toTime(t);
                let note = rootGetters.findNoteById(time.context.id);
                events.push(new Event({
                    time: time,
                    name: note.text,
                    source: note,
                }));
            })

            return _.sortBy(events, e => e.startMinutes(day.format("YYYY-MM-DD")));
        },
        //[only date]
        eventsAtDay: (state, getters, rootState, rootGetters) => (day) => {
            let events = [];

            if(typeof day === "string"){
                day = moment(day);
            }

            let times = state[day.format("YYYY-MM-DD")];

            _.each(times, (t) => {
                if(t.startTime){
                    return;
                }
                let time = toTime(t);
                let note = rootGetters.findNoteById(time.context.id);
                events.push(new Event({
                    time: time,
                    name: note.text,
                    source: note,
                }));
            })

            return events;
        },
        noteCountAtDay: (state, getters, rootState, rootGetters) => (day) => {
            if(typeof day === "string"){
                day = moment(day);
            }

            let nextDay = day.clone().add(1, "d");

            let count = 0;

            traversal.each(rootState.notes, (note) => {
                let time = moment(note.id)
                if(time.isValid() && time.isBetween(day, nextDay)){
                    count++;
                }
            });

            return count;
        }
    },
    mutations:{
        add(state, {note, time}){
            if(!time){
                return;
            }
            time = toTime(time, note);
            let startMoment = time.start();
            let startDate = startMoment.format("YYYY-MM-DD");
            if(!state[startDate]){
                Vue.set(state, startDate, []);
            }
            state[startDate].push(time);
            let endMoment = time.end()
            if(endMoment){
                let days = moment.duration(endMoment.diff(startDate)).asDays()
                if(days > 0){
                    time.index = 0;
                    time.total = days;
                }
                for (let i = 0; i < days; i++) {
                    let date = startMoment.format("YYYY-MM-DD");
                    if(date !== startDate){
                        if(!state[date]){
                            Vue.set(state, date, []);
                        }
                        let cloned = _.clone(time);
                        cloned.index = i;
                        cloned.total = days;
                        state[date].push(cloned);
                    }
                    startMoment.add(1, 'd')
                }
            }
        },
        remove(state, {time}){
            if(!time){
                return;
            }

            let startDate = time.start().format("YYYY-MM-DD");
            _.remove(state[startDate], t => {
                return t.type === time.type && t.context.id === time.context.id;
            })
            let endDate = time.end()
            if(endDate){
                endDate = endDate.format("YYYY-MM-DD");
                if(endDate !== startDate){
                    _.remove(state[endDate], t => {
                        return t.type === time.type && t.context.id === time.context.id;
                    })
                }
            }
        }
    }
}