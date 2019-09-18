<template>
    <div class="note-control">
        <div class="collapsed-ic" @click="onClick" >
            <v-icon :x-small="ic[collapsed] == 'mdi-filter-variant'" small>{{ic[collapsed]}}</v-icon>
        </div>
        <div :class="['note-bullet', {time: note.time}]"  @dblclick="onDoubleClick" @contextmenu.prevent="toggleMenu">
            <v-icon v-if="note.time && note.time.type=='stamp'" small>mdi-av-timer</v-icon>
            <v-icon v-else-if="note.time && note.time.type=='schedule'" small>mdi-alarm</v-icon>
        </div>
        <v-menu v-model="menu" absolute :position-x="x" :position-y="y" offset-y nudge-left="30%" open-delay="800">
            <v-list subheader dense>
                <v-list-item v-if="note.time">
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
            </v-list>
        </v-menu>
    </div>
</template>

<script>
import _ from 'lodash'
import moment from 'moment';

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
        timestamp: function(){
            let date = moment(this.note.time.startDate || this.note.id);
            let time = moment(this.note.time.startTime, 'h:m');
            time.set('year', date.year());
            time.set('month', date.month());
            time.set('date', date.date());

            let endDate, endTime;
            if(this.note.time.endDate){
                endDate = moment(this.note.time.endDate);
            }
            if(this.note.time.endTime){
                endTime = moment(this.note.time.endTime, 'h:m');
            }
            if(endTime){
                if(endDate){
                    endTime.set('year', endDate.year());
                    endTime.set('month', endDate.month());
                    endTime.set('date', endDate.date());
                }else {
                    endTime.set('year', date.year());
                    endTime.set('month', date.month());
                    endTime.set('date', date.date());

                    if(this.note.time.endTime < this.note.time.startTime){
                        time.date(time.date()-1);
                    }
                }
            }else if(endDate){
                endTime = endDate;
            }

            let value = time.format('YYYY-MM-DD ddd HH:mm');
            if(endTime){
                value += " ~ " + endTime.format("YYYY-MM-DD ddd HH:mm") + ", " + moment.duration(endTime.diff(time)).humanize();
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
    top: 0px;
    left: -0.8rem;
}
</style>