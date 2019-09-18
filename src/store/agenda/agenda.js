import _ from 'lodash'
import moment from "moment"

import traversal from "@/lib/tree"

export default {
    namespaced: true,
    state: {
        timestamps: new Map(),
        schedules: new Map(),
    },
    getters:{
        eventsAtDay: (state, getters, rootState, rootGetters) => (day) =>{
            let events = [];

            let nextDay = day.clone().add(1, 'd');

            let createdAt = []
            traversal.each(rootState.notes, -1, (note) => {
                let time = state.timestamps.get(note)
                let schedule = state.schedules.get(note);
                if(time && time.isBetween(day, nextDay)){
                    events.push({
                        name: note.text,
                        start: time.startFormat(),
                        end: time.endFormat(),
                        source: note
                    })
                }
                if(schedule && schedule.isBetween(day, nextDay)){
                    events.push({
                        name: note.text,
                        start: time.startFormat(),
                        end: time.endFormat(),
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
            map.set(note, time)
        },
        remove(state, {note}){
            state.timestamps.delete(note);
            state.schedules.delete(note);
        }
    }
}