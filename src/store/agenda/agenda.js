import Vue from 'vue'

import _ from 'lodash'
import moment from "moment"

import traversal from "@/lib/tree"

import {toTime} from "@/model/time"

export default {
    namespaced: true,
    state: {
        timestamps: {},
        schedules: {},
    },
    getters:{
        eventsAtDay: (state, getters, rootState, rootGetters) => (day) =>{
            let events = [];

            let nextDay = day.clone().add(1, 'd');

            let createdAt = []

            traversal.each(rootState.notes, -1, (note) => {
                let time = toTime(state.timestamps[note.id], note)
                if(time && time.isBetween(day, nextDay)){
                    events.push({
                        name: note.text,
                        start: time.startFormat(),
                        end: time.endFormat(),
                        source: note
                    })
                }
                
                let schedule = toTime(state.schedules[note.id], note);
                if(schedule && schedule.isBetween(day, nextDay)){
                    events.push({
                        name: note.text,
                        start: schedule.startFormat(),
                        end: schedule.endFormat(),
                        source:note
                    })
                }

                if(moment(note.id).isBetween(day, nextDay)){
                    createdAt.push(note)
                }
            })

            if(createdAt.length > 0){
                events.push({
                    name: "Created " + createdAt.length + (createdAt.length == 1? " note" : " notes"),
                    start: day.format("YYYY-MM-DD"),
                    source: createdAt
                })
            }
            
            return events;
        }
    },
    mutations:{
        add(state, {note, time}){
            let map = time.type == 'stamp' ? state.timestamps : state.schedules;
            Vue.set(map, note.id, time);
        },
        remove(state, {note}){
            Vue.delete(state.timestamps, note.id);
            Vue.delete(state.schedules, note.id);
        }
    }
}