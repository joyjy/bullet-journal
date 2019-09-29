import moment from "moment";

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
        let date = moment(this.startDate || this.context.baseDate || this.context.id);
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

    end(){
        if(!this.endDate && !this.endTime){
            return undefined;
        }
        let date = moment(this.endDate || this.startDate || this.context.baseDate || this.context.id);
        if(!this.endTime){
            return date;
        }
        let time = moment(this.endTime, "h:m");
        time.set("year", date.year());
        time.set("month", date.month());
        time.set("date", date.date());
        return time;
    }

    startFormat(){
        return this.start().format(this.startTime ? "YYYY-MM-DD HH:mm":"YYYY-MM-DD");
    }

    endFormat(){
        let end = this.end();
        if(!end){
            return undefined;
        }
        return end.format(this.endTime ? "YYYY-MM-DD HH:mm": "YYYY-MM-DD");
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

export { Time, toTime }