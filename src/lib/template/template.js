import Vue from 'vue';
import moment from 'moment';

class Space {
    constructor(colWidth){
        this.space = true;
        this.colWidth = colWidth;
    }
}

export default {
    name: "templates",
    views:[{
        name:'cornell',
        icon: 'mdi-numeric-3',
        rows: [{
            height: "70%",
            cols: [new Space(4), new Space()]
        },{
            height: "30%",
            cols: [new Space()]
        }]
    },{
        name:'empty-umbrella',
        icon: 'mdi-numeric-3',
        rows: [{
            height: "25%",
            cols: [new Space()]
        },{
            height: "75%",
            cols: [new Space(6), new Space(6)]
        }]
    },{
        name:'tokyo',
        icon: 'mdi-numeric-3',
        rows: [{
            height: "100%",
            cols: [new Space(5), new Space(4), new Space(3)]
        }]
    },{
        name:'4',
        icon: 'mdi-numeric-4',
        rows: [{
            height: "50%",
            cols: [new Space(6), new Space(6)]
        },{
            height: "50%",
            cols: [new Space(6), new Space(6)]
        }]
    },{
        name:'9',
        icon: 'mdi-numeric-9',
        rows: [{
            height: "30%",
            cols: [new Space(4), new Space(4), new Space(4)]
        },{
            height: "36%",
            cols: [new Space(4), new Space(4), new Space(4)]
        },{
            height: "34%",
            cols: [new Space(4), new Space(4), new Space(4)]
        }]
    }],
    view: 0,
    mode: 'items', // pages, items
};