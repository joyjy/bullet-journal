<template>
    <div class="note-control">
        <div class="collapsed-ic" @click="onClick" >
            <v-icon :x-small="ic[collapsed] == 'mdi-filter-variant'" small>{{ic[collapsed]}}</v-icon>
        </div>
        <div :class="['note-bullet', {time: note.time || note.schedule}]"  @dblclick="onDoubleClick" @contextmenu.prevent="toggleMenu">
            <v-icon v-if="stamp" small>mdi-av-timer</v-icon>
            <v-icon v-else-if="schedule" small>mdi-alarm</v-icon>
        </div>
        <v-menu v-model="menu" absolute :position-x="x" :position-y="y" offset-y nudge-left="30%" open-delay="800">
            <v-list subheader dense>
                <v-list-item v-if="note.time || note.schedule">
                    <v-list-item-content class="caption font-italic">
                        {{ timestamp }}
                    </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item @click="">
                    <v-list-item-title>
                        Add Content
                    </v-list-item-title>
                    <v-list-item-action-text>
                        Shift+Enter
                    </v-list-item-action-text>
                </v-list-item>
                <v-list-item @click="">
                    <v-list-item-title>
                        Duplicate
                    </v-list-item-title>
                    <v-list-item-action-text>
                    </v-list-item-action-text>
                </v-list-item>
                <v-list-item @click="$emit('del-note')">
                    <v-list-item-title>
                        Delete
                    </v-list-item-title>
                    <v-list-item-action-text>
                    </v-list-item-action-text>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item :to="{ name:'debug', params:{ id: this.note.id }}">
                    <v-list-item-title>
                        Debug
                    </v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script>
import _ from 'lodash'
import moment from 'moment';

import { Time } from '@/model/time'

export default {
    props:['note', 'collapsed'],
    data: () => ({
        menu: false,
        x: 0,
        y: 0,
        ignoreFiltered: false,
        ic : {
            'expand': 'mdi-menu-down',
            'collapsed': 'mdi-menu-right',
            'filtered': 'mdi-filter-variant',
            'none': ''
        }
    }),
    computed:{
        stamp: function(){
            return this.note.time && this.note.time.type == 'stamp'
        },
        schedule: function(){
            if(this.note.time){
                return this.note.time.type == 'schedule'
            }
            return this.note.schedule;
        },
        timestamp: function(){
            let time = this.note.time || this.note.schedule;

            if(!time){
                return
            }

            if(typeof time === 'object'){
                let swap = time;
                time = new Time();
                Object.assign(time, swap) 
            }

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
        onClick: function(){
            this.$emit('collapse-note');
        },
        onDoubleClick: function(){
            this.$router.push({ name:'note', params:{ id: this.note.id }})
        },
        toggleMenu: function(){
            if(!this.menu){
                var rect = this.$el.getBoundingClientRect();
                this.x = rect.right;
                this.y = rect.bottom;
                this.menu = true;
            }else{
                this.menu = false;
            }
        }
    }
}
</script>

<style>
.note-control {
    cursor: pointer;
    width: 21px;
    height: 21px;
    align-self: flex-start;
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