import moment from "moment"

export class Time{

    constructor(){
        this.context = null;
        this.type = null;
        this.startDate = null;
        this.startTime = null;
        this.endDate = null;
        this.endTime = null;
        this.repeat = null;
    }

    isBetween(from, to) {
        let start = this.start();
        let end = this.end();
        return start.isValid() && start.isBetween(from, to) || end.isValid() && end.isBetween(from, to)
    }

    start(){
        let date = moment(this.startDate || this.context.baseDate || this.context.id);
        if(!this.startTime){
            return date;
        }
        let time = moment(this.startTime, 'h:m');
        time.set('year', date.year());
        time.set('month', date.month());
        time.set('date', date.date());
        if(this.startTime > this.endTime){
            time.subtract(1, 'd')
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
        let time = moment(this.endTime, 'h:m');
        time.set('year', date.year());
        time.set('month', date.month());
        time.set('date', date.date());
        return time;
    }

    startFormat(){
        return this.start().format(this.startTime ? "YYYY-MM-DD HH:mm":"YYYY-MM-DD");
    }

    endFormat(){
        return this.end().format(this.endTime ? "YYYY-MM-DD HH:mm": "YYYY-MM-DD");
    }
}