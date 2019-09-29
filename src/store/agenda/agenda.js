import Vue from "vue";
import _ from "lodash";
import moment from "moment";

import traversal from "@/lib/tree";
import {toTime} from "@/model/time";

class Event{

    constructor({name, start, end, source}){
        this.name = name;
        this.start = start;
        this.end = end;
        this.source = source;
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
                    name: note.text,
                    start: time.startFormat(),
                    end: time.endFormat(),
                    source: note,
                }));
            })

            return _.sortBy(events, e => e.startMinutes(day.format("YYYY-MM-DD")));
        },
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
                    name: note.text,
                    start: time.startFormat(),
                    end: time.endFormat(),
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
            let startDate = time.start().format("YYYY-MM-DD");
            if(!state[startDate]){
                Vue.set(state, startDate, []);
            }
            state[startDate].push(time);
            let endDate = time.end()
            if(endDate){
                endDate = endDate.format("YYYY-MM-DD");
                if(endDate !== startDate){
                    if(!state[endDate]){
                        Vue.set(state, endDate, []);
                    }
                    state[endDate].push(time);
                }    
            }
        },
        remove(state, {note}){
        }
    }
}