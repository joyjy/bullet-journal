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

    startMinutes(){
        let m = moment(this.start);
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
        timestamps: {},
        schedules: {},
    },
    getters:{
        eventsAtDay: (state, getters, rootState, rootGetters) => (day) => {
            let events = [];

            if(typeof day === "string"){
                day = moment(day);
            }

            let nextDay = day.clone().add(1, "d");

            traversal.each(rootState.notes, -1, (note) => {
                let time = toTime(state.timestamps[note.id], note);
                if(time && time.isBetween(day, nextDay)){
                    events.push(new Event({
                        name: note.text,
                        start: time.startFormat(),
                        end: time.endFormat(),
                        source: note,
                    }));
                }

                let schedule = toTime(state.schedules[note.id], note);
                if(schedule && schedule.isBetween(day, nextDay)){
                    events.push(new Event({
                        name: note.text,
                        start: schedule.startFormat(),
                        end: schedule.endFormat(),
                        source:note,
                    }));
                }
            });

            return events;
        }
    },
    mutations:{
        add(state, {note, time}){
            let map = time.type === "stamp" ? state.timestamps : state.schedules;
            Vue.set(map, note.id, time);
        },
        remove(state, {note}){
            Vue.delete(state.timestamps, note.id);
            Vue.delete(state.schedules, note.id);
        }
    }
}