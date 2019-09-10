<template>
    <div class="note-control">
        <div class="note-bullet" @click="onClick" @dblclick="onDoubleClick" @contextmenu.prevent="toggleMenu"
            :class="{collapsed: collapsed}">
        </div>
        <v-menu v-model="menu" absolute :position-x="x" :position-y="y" offset-y nudge-left="30%" open-delay="800">
            <v-list subheader dense>
                <v-list-item @click="$emit('del-note')">
                    <v-list-item-title>
                        Delete
                    </v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script>
import _ from 'lodash'

export default {
    props:['note', 'collapsed'],
    data: () => ({
        menu: false,
        x: 0,
        y: 0,
        timer: null
    }),
    computed:{
        debug(){
            let clone = _.clone(this.note);
            clone.notes = undefined;
            return JSON.stringify(clone, null, 4);
        }
    },
    methods: {
        onClick: function(){
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.$emit('collapse-note');
            }, 300);   //大概时间300ms
        },
        onDoubleClick: function(){
            clearTimeout(this.timer);
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
    border: .22rem solid #fafafa; /*grey lighten-5*/
    background-color: #616161; /*grey darken-2*/
    border-radius: 50%;
    align-self: center;
}

.note-bullet:hover{
    border-color: #BDBDBD /*grey lighten-1*/
}

.note-bullet.collapsed:before{
    content: "+";
    position: absolute;
    top: 2px;
    left:4px;
    font-size: 13px;
    color: white;
}
</style>