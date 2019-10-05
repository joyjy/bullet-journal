import Vue from 'vue';
import moment from 'moment';

const today = {
    title: `${name || 'today'}`,
    component: {
        name: 'note-tree-root',
        props(vm){
            let today = moment();
            let path = ['Diary #notebook', today.format("YYYY"), today.format("MM"), today.format("YYYY #MM-DD #ddd")];
            let note = vm.$store.getters.findByPathTextOrCreate(path);
            vm.$data.name = note.text;
            return {
                parent: note,
                root: note,
            };
        }
    }
}

const yesterday = {
    title: 'yesterday',
    component: {
        name: 'note-tree-root',
        props(vm){
            let day = moment().subtract(1, 'd');
            let path = ['Diary #notebook', day.format("YYYY"), day.format("MM"), day.format("YYYY #MM-DD #ddd")];
            let note = vm.$store.getters.findNoteByPathText(path);
            if(!note){
                return false;
            }
            Vue.set(vm.$data, 'name', note.text);
            return {
                parent: note,
                root: note,
            };
        }
    }
}

const lastWeek = {
    title: 'last week',
    component: {
        name: 'note-tree-root',
        props(vm){
            let day = moment().subtract(1, 'w');
            let path = ['Diary #notebook', day.format("YYYY"), day.format("MM"), day.format("YYYY #MM-DD #ddd")];
            let note = vm.$store.getters.findNoteByPathText(path);
            if(!note){
                return false;
            }
            vm.$data.name = note.text;
            return {
                parent: note,
                root: note,
            };
        }
    }
}

const lastMonth = {
    title: 'last month',
    component: {
        name: 'note-tree-root',
        props(vm){
            let day = moment().subtract(1, 'M');
            let path = ['Diary #notebook', day.format("YYYY"), day.format("MM"), day.format("YYYY #MM-DD #ddd")];
            let note = vm.$store.getters.findNoteByPathText(path);
            if(!note){
                return false;
            }
            vm.$data.name = note.text;
            return {
                parent: note,
                root: note,
            };
        }
    }
}

const lastYear = {
    title: "last year",
    component: {
        name: 'note-tree-root',
        props(vm){
            let day = moment().subtract(1, 'y');
            let path = ['Diary #notebook', day.format("YYYY"), day.format("MM"), day.format("YYYY #MM-DD #ddd")];
            let note = vm.$store.getters.findNoteByPathText(path);
            if(!note){
                return false;
            }
            vm.$data.name = note.text;
            return {
                parent: note,
                root: note,
            };
        }
    }
}

export default {
    name: "diary",
    views:[{
        name:'default',
        icon: 'mdi-view-list',
        rows: [{
            cols: [today]
        }]
    },{
        name:'with-last',
        icon: 'mdi-view-column',
        rows: [{
            cols: [{
                colWidth: 4,
                rows:[
                    {cols: [yesterday]},
                    {cols: [lastWeek]},
                    {cols: [lastMonth]},
                    {cols: [lastYear]},
                ]
            }, today, {
                colWidth: 3,
            }]
        }]
    }],
    view: 1,
    mode: 'pages', // pages, items
};