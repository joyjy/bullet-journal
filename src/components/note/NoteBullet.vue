<template>
    <div class="note-control">
        <div class="collapsed-ic" @click="collapse" >
            <v-icon :x-small="ic[collapsed] == 'mdi-filter-variant'" small>
                {{ic[collapsed]}}
            </v-icon>
        </div>
        
        <v-menu open-on-hover offset-y open-delay="1000">
            <template v-slot:activator="{ on }">
                <div :class="['note-bullet', {time: note.time || note.schedule}]" 
                    @dblclick="click('dbl', $event)" @click.capture="click('sgl', $event)"
                    v-on="on">
                    <v-icon v-if="stamp" small>mdi-av-timer</v-icon>
                    <v-icon v-else-if="schedule" small>mdi-alarm</v-icon>
                </div>
            </template>
            <v-list subheader dense>
                <v-list-item v-if="note.time || note.schedule">
                    <v-list-item-content class="caption font-italic">
                        {{ timestamp }}
                    </v-list-item-content>
                </v-list-item>
                <v-divider v-if="note.time || note.schedule"></v-divider>
                <v-list-item @click="$emit('del-note')">
                    <v-list-item-title>
                        Delete
                    </v-list-item-title>
                    <v-list-item-action-text>
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
        }
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
            let value = start.format(time.startTime ? "YYYY-MM-DD ddd HH:mm" : "YYYY-MM-DD ddd");

            let end = time.end()
            if(end && end.isValid()){
                value += end.format(time.endTime ? " -> YYYY-MM-DD ddd HH:mm, ~" : " -> YYYY-MM-DD ddd, ~")
                         + moment.duration(end.diff(start)).humanize();
            }

            return value;
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
            this.$router.push({ name:"note", params:{ id: this.note.id }})
        }
    }
}
</script>

<style>
.note-control {
    cursor: pointer;
    width: 21px;
    height: 21px;
    align-self: center;
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