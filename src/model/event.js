import moment from "moment";
import { TimeHelper } from "./time";

class Event {
    constructor({date, title, source, time, index, total, order}){
        this.name = title;
        this.source = source;
        this.date = date;
        this.hasTime = Boolean(time.startTime);
        this.type = time.type;
        this.index = index;
        this.total = total;
        this.order = order;

        let s = TimeHelper.start.call(time, source);
        this.start = TimeHelper.startFormat.call(time, source);
        this.startMinutes = date == s.format("YYYY-MM-DD") ? (s.hours()*60)+s.minutes() : 0;
        let e = TimeHelper.end.call(time, source);
        if(e){
            this.durationMinutes = moment.duration(e.diff(s)).asMinutes();
            this.end = TimeHelper.endFormat.call(time, source, s);
        }
    }
}

const parse = function(note, time, title, parsed){
    let startDate = TimeHelper.start.call(time, note).clone().hour(0).minute(0);
    let endDate = startDate;
    let total = 0;
    if(time.endDate || time.endTime){
        endDate = TimeHelper.end.call(time, note).clone().hour(0).minute(0);
        total = moment.duration(endDate.diff(startDate)).asDays();
    }
    let m = startDate.clone();
    let i = 0;
    let order = -1;
    while(m.isSameOrBefore(endDate)){
        let event = new Event({
            date: m.format("YYYY-MM-DD"),
            title,
            source: note,
            time,
            index: i,
            total,
            order
        });

        order = parsed(event);
        
        m.add(1, 'd');
        i++;
    }
}

const parseEvents = function(note, parsed){
    if(note.time){
        parse(note, note.time, note.text.substring(note.tokens[0].text.length), parsed)
    }
    if(note.schedule){
        parse(note, note.schedule, note.text, parsed)
    }
}

export { Event, parseEvents }