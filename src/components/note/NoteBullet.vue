<template>
    <div class="note-control">
        <div class="collapsed-ic" @click="collapse" >
            <v-icon :x-small="ic[collapsed] == 'mdi-filter-variant'" small>
                {{ic[collapsed]}}
            </v-icon>
        </div>
        
        <v-menu v-model="menu" :open-on-hover="!dragging" :open-on-click="false"
            offset-y nudge-left="10" nudge-bottom="2" open-delay="1000" close-delay="100" min-width="140">
            <template v-slot:activator="{ on }">
                <div :class="['note-bullet', {time: note.time || note.schedule}]" 
                    @dblclick.prevent.stop="click('dbl', $event)" @click.prevent.stop="click('sgl', $event)"
                    v-on="on">
                    <v-icon v-if="stamp" small>mdi-av-timer</v-icon>
                    <v-icon v-else-if="schedule" small>mdi-alarm</v-icon>
                </div>
            </template>
            <v-list subheader dense>
                <v-list-item v-if="note.time || note.schedule">
                    <v-list-item-content class="caption font-italic"
                        v-html="timestamp">
                    </v-list-item-content>
                </v-list-item>
                <v-divider v-if="note.time || note.schedule"></v-divider>

                <v-list-item @click="$emit('archive-note')">
                    <v-list-item-title>
                        {{ note.archived ? 'Unarchive' : 'Archive' }}
                    </v-list-item-title>
                    <v-list-item-action-text>
                    </v-list-item-action-text>
                </v-list-item>
                <v-list-item @click="$emit('del-note')">
                    <v-list-item-title>
                        Delete
                    </v-list-item-title>
                    <v-list-item-action-text>
                        ⇧⌘⌫
                    </v-list-item-action-text>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script>
import _ from 'lodash'
import moment from 'moment';

import { toTime } from '@/model/time'

export default {
    props:["note", "collapsed"],
    data: () => ({
        ignoreFiltered: false,
        ic : {
            "expand": "mdi-menu-down",
            "collapsed": "mdi-menu-right",
            "filtered": "mdi-filter-variant",
            "none": ""
        },
        menu: false,
    }),
    computed:{
        stamp: function(){
            return this.note.time && this.note.time.type == "stamp"
        },
        schedule: function(){
            if(this.note.time){
                return this.note.time.type == "schedule"
            }
            return this.note.schedule;
        },
        timestamp: function(){
            let time = this.note.time || this.note.schedule;

            if(!time){
                return
            }

            time = toTime(time, this.note);

            let start = time.start();
            let value = start.format(time.startTime ? "YYYY-MM-DD(ddd) HH:mm" : "YYYY-MM-DD(ddd)");

            let end = time.end()
            if(end && end.isValid()){
                let endFormat = "YYYY-MM-DD(ddd) HH:mm"
                if(time.endTime){
                    if(end.isSame(start, 'd')){
                        endFormat = "HH:mm"
                    }
                }else{
                    endFormat = "YYYY-MM-DD(ddd)"
                }

                value += " -> " + end.format(endFormat) + ", ~" + moment.duration(end.diff(start)).humanize();
            }

            return value;
        },
        dragging(){
            return this.$store.state.settings.dragging;
        }
    },
    watch:{
        dragging(){
            if(this.dragging){
                setTimeout(() => this.menu = false, 100)
            }
        }
    },
    methods: {
        collapse: function(){
            this.$emit("collapse-note");
        },
        click: function(type, e){
            if(type != this.$store.state.settings.note.clickType){
                return;
            }
            this.$router.push({ name:"note", params:{ id: this.note.id }}).catch(err => {})
        }
    }
}
</script>

<style>
.note-control {
    cursor: pointer;
    width: 21px;
    height: 21px;
    margin-top: 2px;
    flex-shrink: 0;
    display: flex;
    position: relative;
}

.note-bullet{
    width: 1rem;
    height: 1rem;
    align-self: center;
    margin-top:-1px;
    display: flex;
    align-items: center;
}
.note-bullet.time{
    padding-left: 1px;
}
.note-bullet:not(.time){
    border: .22rem solid #fafafa; /*grey lighten-5*/
    background-color: #616161; /*grey darken-2*/
    border-radius: 50%;
}

.note-bullet:hover{
    border-color: #BDBDBD /*grey lighten-1*/
}

.collapsed-ic {
    position: absolute;
    top: -1px;
    left: -0.8rem;
}
</style>