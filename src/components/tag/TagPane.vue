<template>
    <v-container class="tag pr-0">
        <h3 class="subtitle-2">Tags</h3>

        <v-row class="pl-3 align-center">
            <v-divider class="mx-1"></v-divider>
            <h4 class="caption">Recently / Frequently</h4>
            <v-divider class="mx-1"></v-divider>
        </v-row>
        <v-chip-group column :style="{height:'104px'}">
            <v-chip v-for="tag in tops" :key="tag" outlined small
                :input-value="!$route.query.q ? false: $route.query.q.includes(tag)"
                @click="$eventbus.$emit('search', tag)">
                <span class="font-weight-bold">{{ tag }}</span>
                <span>({{ tags.all[tag].count }})</span>
            </v-chip>
        </v-chip-group>
        
        <v-row class="pl-3 align-center">
            <v-divider class="mx-1"></v-divider>
            <h4 class="caption pa-1">Groups</h4>
            <v-col cols="4" class="py-0 mt-n1" style="position:relative;z-index:2">
                <v-text-field v-model="newGroup" class="inline-form" flat hide-details
                    @keydown.enter="addGroup" append-icon="mdi-plus">
                </v-text-field>
            </v-col>
            <v-divider class="mx-1"></v-divider>
        </v-row>
        <v-tabs center-active height="24" hide-slider class="mt-n1" @change="curGroup = $event">
            <v-tab v-for="group in tags.groups" :key="group.name" class="px-2" @dragenter="$emit('click')">
                {{group.name}}
            </v-tab>
        </v-tabs>
        <v-card min-height="104" flat :class="{prepare:prepareGroup}" class="mr-n3" style="overflow:auto" 
            @dragleave="prepareGroup = false" @drop.prevent="addToGroup" @dragover.prevent="prepareGroup = true">
            <v-chip-group column>
                <v-chip v-for="(tag,i) in groupedTags[curGroupName]" :key="tag" outlined small
                    :input-value="!$route.query.q ? false: $route.query.q.includes(tag)"
                    @click="$eventbus.$emit('search', tag)">
                    <span class="font-weight-bold">{{ tag }}</span>
                    <span>({{ tags.all[tag].count }})</span>
                    <v-btn text icon x-small @click.stop="removeFromGroup(curGroupName, i)" class="mr-n2">
                        <v-icon size="13">mdi-close</v-icon>
                    </v-btn>
                </v-chip>
            </v-chip-group>
        </v-card>

        <v-row class="pl-3 align-center">
            <v-divider class="mx-1"></v-divider>
            <h4 class="caption pa-1">All</h4>
            <v-btn x-small text icon @click="showAll = !showAll">
                <v-icon>{{showAll?'mdi-menu-down':'mdi-menu-right'}}</v-icon>
            </v-btn>
            <v-divider class="mx-1"></v-divider>
        </v-row>
        <v-chip-group v-show="showAll" column>
            <v-chip v-for="tag in all" :key="tag.text" outlined small
                :input-value="!$route.query.q ? false: $route.query.q.includes(tag)"
                @click="$eventbus.$emit('search', tag.text)"
                v-show="!tag.group">
                <span :draggable="true" @drag="dragTag" @dragstart="draggedTag=tag">
                    <span class="font-weight-bold">{{ tag.text }}</span>
                    <span>({{ tag.count }})</span>
                </span>
            </v-chip>
        </v-chip-group>
    </v-container>
</template>

<script>
import Vue from 'vue'
import { mapState, mapGetters } from 'vuex'
import _ from "lodash"

export default {
    data:() => ({
        showAll: true,
        addingGroup: false,
        newGroup: '', //
        curGroup: 0,
        draggedTag: {},
        prepareGroup: false,
        groupedTags: {},
    }),
    created(){
        for (let i = 0; i < this.tags.groups.length; i++) {
            const group = this.tags.groups[i];
            Vue.set(this.groupedTags, group.name, []);
        }
    },
    computed:{
        ...mapState({
            tags: state => state.tag,
        }),
        tops: function(){
            let sortable = _.union(this.tags.recently, this.tags.frequently) // todo, frequently all > recently
            sortable = _.orderBy(sortable, (tag) => this.tags.all[tag].count, 'desc')
            sortable.splice(12);
            return sortable;
        },
        all: function(){
            let sortable = [];
            for(const text in this.tags.all){
                let tag = {text: text, count: this.tags.all[text].count, group: this.tags.all[text].group}
                if(tag.group){
                    if(this.groupedTags[tag.group]){
                        let index = _.sortedIndex(this.groupedTags[tag.group], text)
                        if(this.groupedTags[tag.group][index] !== text){
                            this.groupedTags[tag.group].splice(index, 0, text);
                        }
                    }else{
                        tag.group = '';
                    }
                }
                sortable.splice(_.sortedIndexBy(sortable, tag, "text"), 0, tag);
            }
            return sortable;
        },
        curGroupName: function(){
            if(!this.tags.groups[this.curGroup]){
                return '';
            }
            return this.tags.groups[this.curGroup].name;
        }
    },
    watch:{
        'tags.groups'(){
            for (let i = 0; i < this.tags.groups.length; i++) {
                const group = this.tags.groups[i];
                if(!this.groupedTags[group.name]){
                    Vue.set(this.groupedTags, group.name, []);
                }
            }
        }
    },
    methods:{
        addGroup(){
            if(this.newGroup.length > 0){
                this.$store.commit('tag/addGroup', {name:this.newGroup});
            }
            this.newGroup = "";
        },
        removeGroup(name){
            this.$store.commit('tag/removeGroup', {name:name});
        },
        dragTag(event){
            //console.log(event);
        },
        switchTabGroup(event){
            console.log(event)
        },
        addToGroup(group){
            this.$store.commit("tag/addToGroup", {
                tag: this.draggedTag, 
                group: this.tags.groups[this.curGroup].name
            });
            this.prepareGroup = false;
        },
        removeFromGroup(group, i){
            let tag = this.groupedTags[group][i];
            this.groupedTags[group].splice(i, 1);
            this.$store.commit("tag/removeFromGroup", {tag});
        }
    }
}
</script>

<style>
.tag .v-slide-group__prev, .tag .v-slide-group__next, .tag .v-tab{
    min-width: 0;
}
.tag .v-slide-group__prev--disabled, .tag .v-slide-group__next--disabled{
    display: none;
}
.tag .v-btn.del-btn{
    display:none;
}
.tag .v-tab--active .v-btn.del-btn{
    display: block;
}
.prepare{
    background-color: #eeeeee!important;
}
</style>