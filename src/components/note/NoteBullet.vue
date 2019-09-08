<template>
    <div class="note-control">
        <v-menu offset-y nudge-left="25%" nudge-top="1%" open-delay="100">
            <template v-slot:activator="{ on }">
                <div class="note-bullet" v-on="on" :class="{collapsed: collapsed}"></div>
            </template>
            <v-list subheader dense>
                <v-list-item :to="{ name:'note', params:{ id: note.id }}">
                    <v-list-item-title>
                        Focus
                    </v-list-item-title>
                </v-list-item>
                <v-list-item @click="$emit('collapse-note')">
                    <v-list-item-title>
                        Collapse
                    </v-list-item-title>
                </v-list-item>
                <v-list-item @click="$emit('del-note')">
                    <v-list-item-title>
                        Delete
                    </v-list-item-title>
                </v-list-item>
                <v-subheader>debug</v-subheader>
                <v-list-item>
                    <v-list-item-content>
                        <pre class="caption">{{ debug }}</pre>
                    </v-list-item-content>
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
    }),
    computed:{
        debug(){
            let clone = _.clone(this.note);
            clone.notes = undefined;
            return JSON.stringify(clone, null, 4);
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
    border: .22rem solid #fafafa;
    background-color: #666;
    border-radius: 50%;
    align-self: center;
}

.note-bullet:hover{
    border-color: #bbb
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