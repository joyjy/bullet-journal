import Vue from "vue";
import _ from "lodash";
import moment from "moment";

import traversal from "@/lib/tree";
import {toTime} from "@/model/time";

class Event {

    constructor({note, hasTime, start, end, index, total, order}){
        this.name = note.text;
        this.source = note;
        this.hasTime = hasTime
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

    let index = findInsertIndex(target[date], event, e => {
        return orderByTime ? e.startMinutes(date): e.start
    })

    if(event.index === 0){
        event.order = index;
    }

    if(event.order > target[date].length){
        target[date].splice(event.order);
    }

    if(target[date][index] === undefined){
        target[date][index] = event;
    }else{
        target[date].splice(index, 0, event); // todo 
    }

    console.log(date, JSON.stringify(_.map(target[date], function(e){
        if(!e){
            return "slot";
        }
        let cloned = _.clone(e);
        delete cloned.name;
        delete cloned.source;
        delete cloned.hasTime;
        return cloned;
    })))

    return event.order;
}

const findInsertIndex = function(array, event, orderBy){
    if(event.order){
        return event.order;
    }
    let orderByVal = orderBy(event);
    for (let i = array.length; i>0; i--) {
        const curVal = orderBy(array[i-1]);
        console.log(orderByVal, curVal)
        if(orderByVal > curVal){
            return i;
        }
    }

    return array.length;
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
        count(state, {note}){
            let date = moment(note.id).format("YYYY-MM-DD");
            if(!state.count[date]){
                Vue.set(state.count, date, 0);
            }
            state.count[date]++;
        },
        add(state, {note, time}){
            if(!time){
                return;
            }
            time = toTime(time, note);
            let hasTime = Boolean(time.startTime)

            let target = hasTime ? state.time : state.day;

            let startDate = time.start().clone().hour(0).minute(0)
            let m = startDate.clone();
            
            if(time.endDate || time.endTime){

                let endDate = time.end().clone().hour(0).minute(0)
                let total = moment.duration(endDate.diff(startDate)).asDays();

                let order = -1;
                for (let i = 0; i <= total; i++) {
                    let date = m.format("YYYY-MM-DD");
                    if(!target[date]){
                        Vue.set(target, date, []);
                    }
                    let event = new Event({
                        note: note,
                        hasTime: hasTime,
                        start: time.startFormat(),
                        end: time.endFormat(),
                        index: i,
                        total: total,
                    })

                    if(order > -1){
                        event.order = order;
                    }
                    order = insert(target, date, event, hasTime)

                    m.add(1, 'd')
                }
            }else{
                let date = m.format("YYYY-MM-DD");
                if(!target[date]){
                    Vue.set(target, date, []);
                }
                let event = new Event({
                    note: note,
                    hasTime: hasTime,
                    start: time.startFormat(),
                    end: time.endFormat(),
                })

                insert(target, date, event, hasTime)
            }
        },
        remove(state, {time}){
            if(!time){
                return;
            }
        }
    }
}