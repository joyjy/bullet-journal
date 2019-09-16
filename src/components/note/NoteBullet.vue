<template>
    <div class="note-control">
        <div class="collapsed-ic" @click="onClick" >
            <v-icon :x-small="ic[collapsed] == 'mdi-filter-variant'" small>{{ic[collapsed]}}</v-icon>
        </div>
        <div class="note-bullet" @dblclick="onDoubleClick" @contextmenu.prevent="toggleMenu">
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
        ignoreFiltered: false,
        ic : {
            'expand': 'mdi-menu-down',
            'collapsed': 'mdi-menu-right',
            'filtered': 'mdi-filter-variant',
            'none': ''
        }
    }),
    computed:{
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
    border: .22rem solid #fafafa; /*grey lighten-5*/
    background-color: #616161; /*grey darken-2*/
    border-radius: 50%;
    align-self: center;
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