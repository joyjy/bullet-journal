import moment from "moment";

const startMoment = function(note){
    let context = note || this.context;

    let date = moment(this.startDate || context.id);
    if(this.startDate && this.startDate.length <= 5){
        date.set("year", moment(this.context.baseDate || this.context.id).year());
    }
    if(!this.startTime){
        return date;
    }
    let time = moment(this.startTime, "h:m");
    time.set("year", date.year());
    time.set("month", date.month());
    time.set("date", date.date());
    if(this.startTime > this.endTime){
        time.subtract(1, "d");
    }
    return time;
}

const endMoment = function(note){
    if(!this.endDate && !this.endTime){
        return undefined;
    }

    let context = note || this.context;

    let date = moment(this.endDate || this.startDate || context.id);
    if(this.endDate && this.endDate.length <= 5){
        date.set("year", moment(context.id).year());
    }
    if(!this.endTime){
        return date;
    }
    let time = moment(this.endTime, "h:m");
    time.set("year", date.year());
    time.set("month", date.month());
    time.set("date", date.date());
    return time;
}

const TimeHelper = {
    start: startMoment,
    end: endMoment,
    startFormat(note){
        return startMoment.call(this, note).format(this.startTime ? "YYYY-MM-DD HH:mm":"YYYY-MM-DD");
    },

    endFormat(note, start){
        let end = endMoment.call(this, note);
        if(!end){
            return undefined;
        }
        if(this.endTime){
            if(start && start.isSame(end, 'day')){
                return end.format("HH:mm")
            }else{
                return end.format("YYYY-MM-DD HH:mm")
            }
        }
        return end.format("YYYY-MM-DD");
    }
}

class Time{

    constructor(note){
        if(note){
            this.context = { id:note.id, baseDate: note.baseDate };
        }else{
            this.context = null;
        }
        this.type = null;
        this.startDate = null;
        this.startTime = null;
        this.endDate = null;
        this.endTime = null;
        this.repeat = null;
    }

    start(){
        return TimeHelper.start.call(this);
    }

    end(){
        return TimeHelper.end.call(this);
    }

    startFormat(){
        return TimeHelper.startFormat.call(this);
    }

    endFormat(){
        return TimeHelper.endFormat.call(this)
    }
}

const toTime = function(time, note){
    if(!time){
        return;
    }
    if(time instanceof Time){
        return time;
    }
    let swap = time;
    time = new Time(note);
    Object.assign(time, swap);
    return time;
}

export {Time, toTime, TimeHelper};