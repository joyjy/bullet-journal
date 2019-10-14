import moment from 'moment';
import { Notebook, View } from '../../model/notebook';

class DayView {
    constructor({notebook, day, componentName, main} = {}){
        this.root = notebook ? notebook.name + ' #notebook': '';

        this.dayFormat = "YYYY #MM-DD #ddd";
        this.local = false,

        this.day = day || moment();
        this.componentName = componentName || 'note-tree-root'
        this.main = main || false;
    }

    get title(){
        return this.day.calendar(moment(), {
            sameDay: '["Today"]',
            nextDay: 'YYYY-MM-DD',
            nextWeek: 'YYYY-MM-DD',
            lastDay: '["Yesterday"]',
            lastWeek: 'YYYY-MM-DD',
            sameElse: function (now) {
                let diff = now.diff(this, 'years');
                if(diff > 1){
                    return diff + ' ["years before"]'
                }
                if(diff == 1){
                    return '["Last year"]'
                }
                diff = now.diff(this, 'months');
                if(diff > 1){
                    return diff + ' ["months before"]'
                }
                if(diff == 1){
                    return '["Last month"]'
                }
                diff = now.diff(this, 'weeks');
                if(diff > 1){
                    return diff + ' ["weeks before"]'
                }
                if(diff == 1){
                    return '["Last week"]'
                }
            }
        });
    }

    get component(){
        return {
            name: this.componentName,
            props: (vm) => {
                let path = [this.root, this.day.format("YYYY"), this.day.format("MM"), this.day.format(this.dayFormat)];
                let note = vm.$store.getters.findNoteByPathText(path);
                if(note){
                    vm.$data.name = note.text;
                    if(this.main){
                        vm.$eventbus.$emit("notebook/item-name", note.text);
                    }
                    return {
                        parent: note,
                        root: note,
                    };
                }
                return {}
            }
        }
    }
}

const diary = new Notebook({
    mode: 'pages',
    current: moment()
})

diary.days = [
    diary.current.clone().subtract(1, 'd'),
    diary.current.clone().subtract(1, 'w'),
    diary.current.clone().subtract(1, 'M'),
    diary.current.clone().subtract(1, 'y'),
    diary.current.clone().subtract(2, 'y'),
    diary.current.clone().subtract(3, 'y'),
    diary.current.clone().subtract(4, 'y'),
    diary.current.clone().subtract(5, 'y'),
]

diary.views = [{
    name:'journal',
    icon: 'journal',
    rows: [{
        cols: [{
            colWidth: 5,
            rows:[
                {cols: [new DayView({day: diary.days[0]})]},
                {cols: [new DayView({day: diary.days[1]})]},
                {cols: [new DayView({day: diary.days[2]})]},
                {cols: [new DayView({day: diary.days[3]})]},
                {cols: [new DayView({day: diary.days[4]})]},
                {cols: [new DayView({day: diary.days[5]})]},
                {cols: [new DayView({day: diary.days[6]})]},
                {cols: [new DayView({day: diary.days[7]})]},
            ]
        }, 
        new DayView({day: diary.current}), 
        new View({
            colWidth: 3,
            title: '"Index"',
        })]
    }]
},{
    name: 'mandala',
    icon: 'mandala',
    rows: [{
        height: "100%",
        cols: []
    }]
},{
    name: 'routine',
    icon: 'routine',
    rows: [{
        height: "100%",
        cols: []
    }]
},{
    name: 'punch',
    icon: 'punch',
    rows: [{
        height: "100%",
        cols: []
    }]
}]

diary.prev = function(){
    console.log(this);
}
diary.next = function(){
    console.log(this);
}

export default diary;