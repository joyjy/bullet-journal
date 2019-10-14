import Vue from "vue";
import _ from "lodash";
import { parseEvents } from "@/model/event";
import moment from "moment";

const findInsertIndex = function(array, event, orderBy){
    if(event.order > -1){
        return event.order;
    }
    let orderByVal = orderBy(event);
    for (let i = array.length; i>0; i--) {
        const curVal = orderBy(array[i-1]);
        if(orderByVal >= curVal){
            return i;
        }
    }
    return 0;
}

const reset = function(array, index){
    for (; index < array.length; index++) {
        let event = array[index];
        let prevEvent = array[index-1];
        if(event.startMinutes < prevEvent.startMinutes + _.max([prevEvent.durationMinutes, 30])){
            event.overlap = (prevEvent.overlap || 0)+1;
        }
    }
}

export default {
    namespaced: true,
    state: {
        day: {}, // '<date>':[{event}/undefined]
        time: {}, // '<date>':[{event}/undefined]
        count: {}, // '<date>':{added:<0>, removed:<0>}
    },
    getters:{
        eventsInDay: (state) => (date) => {
            return state.time[date] || [];
        },
        eventsAtDay: (state) => (date) => {
            return state.day[date] || [];
        },
        noteCountAtDay: (state) => (date) => {
            let counts = state.count[date];
            if(counts){
                return counts.added;
            }
            return 0;
        }
    },
    mutations:{
        count(state, {note, date, type}){
            date = date || moment(note.id).format("YYYY-MM-DD");
            type = type || "added";
            if(!state.count[date]){
                Vue.set(state.count, date, {added: 0, removed: 0});
            }
            state.count[date][type]++;
        },
        add(state, {note}){
            parseEvents(note, (event) => {
                let target = event.hasTime ? state.time: state.day;
                let date = event.date;

                if(!target[date]){
                    Vue.set(target, date, []);
                }
            
                let index = findInsertIndex(target[date], event, (e) => {
                    return event.hasTime ? e.startMinutes: e.start;
                });
                if(event.order === -1){
                    event.order = index;
                }
            
                if(index > target[date].length){
                    target[date].splice(index);
                }
            
                if(index > 0){
                    let prevEvent = target[date][index-1];
                    if(prevEvent && event.startMinutes < prevEvent.startMinutes + _.max([prevEvent.durationMinites, 30])){
                        event.overlap = (prevEvent.overlap || 0)+1;
                    }
                }
            
                if(!target[date][index]){
                    target[date][index] = event;
                }else{
                    target[date].splice(index, 0, event); // todo reset after orders
                    if(event.hasTime){
                        reset(target[date], index+1)
                    }
                }

                return index;
            });
        },
        remove(state, {note}){
            parseEvents(note, (event) => {
                let target = event.hasTime ? state.time: state.day;
                let date = event.date;

                let index = _.findIndex(target[date], (e) => e.source.id === note.id);
                target[date].splice(index, 1);
                if(event.hasTime){
                    reset(target[date], index+1)
                }
            })
        }
    }
}