<template>
    <app-layout :right-drawer="true">

        <template v-slot:toolbar>
            <v-breadcrumbs v-show="breadsrumbs.length>0" :items="breadsrumbs" divider=">" :style="{paddingRight:'0px'}">
                <template v-slot:item="props">
                    <v-breadcrumbs-item v-if="props.item.id" :to="{ name:'note', params:{ id: props.item.id }}">
                        {{ props.item.text }}
                    </v-breadcrumbs-item>
                    <v-breadcrumbs-item v-else to="/">
                        {{ props.item }}
                    </v-breadcrumbs-item>
                </template>
            </v-breadcrumbs>

            <v-tooltip right>
                <template v-slot:activator="{ on }">
                    <v-btn  text icon small v-if="id && !query" @click="switchStarredNote({note:notes[0]})" v-on="on">
                        <v-icon v-if="isStarred(id)" color="yellow darken-1">mdi-star</v-icon>
                        <v-icon v-else>mdi-star-outline</v-icon>
                    </v-btn>
                </template>
                <span>Toggle Starred Note</span>
            </v-tooltip>
        </template>

        <template v-slot:toolbar-items>

            <v-toolbar-items>
                <v-text-field class="compact-form" clearable solo rounded flat
                    :prepend-inner-icon="query && isSavedFilter(query.value) ? 'mdi-filter' : 'mdi-filter-outline'"
                    @click:prepend-inner="switchSaveFilter({text:query.value})"
                    :value="$route.query.q" :style="{width: counter+'rem'}"
                    @input="debounceSearch" @click:clear="search('')">
                </v-text-field>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn icon @click="switchCollapse" v-on="on">
                            <v-icon>mdi-arrow-expand-vertical</v-icon>
                        </v-btn>
                    </template>
                    <span>Toggle Outline Level: {{ collapseLevel == -1 ? 'All': collapseLevel+1 }}</span>
                </v-tooltip>

                <v-btn icon>
                    <v-icon>mdi-settings-outline</v-icon>
                </v-btn>
            </v-toolbar-items>
        </template>
        
        <note-tree-root ref="tree" :query="query" :parent="$data" :root="root"
            @refresh="refresh">
        </note-tree-root>
        
        <div id="tail" :style="{'height': treeHeight===0?0:`calc(100% - ${treeHeight}px)`}" @click="focusLast"></div>
    </app-layout>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex"
import _ from "lodash"

import AppLayout from "../app/Layout"
import NoteTreeRoot from "./NoteTreeRoot"
import range from "@/lib/range"

import traversal from "@/lib/tree"
import filter from "@/lib/filter"

export default {
    data: function(){
        return {
            root: null,
            breadsrumbs: [],
            notes: [],
            depth: 0,
            collapseLevel: -1,
            query: undefined,
            treeHeight: 0
        }
    },
    components:{
        AppLayout,
        NoteTreeRoot,
    },
    created: function(){
        this.refresh();
    },
    mounted: function(){
        this.$eventbus.$on("search", e => this.search(e))
        this.$store.subscribe((mutation) => {
            switch(mutation.type){
                case "collapse":
                case "switchOutline":
                case "archive":
                case "display":
                    this.tailHeightChange();
                break;
            }
        })
        this.tailHeightChange()
    },
    destroyed: function(){
        this.$eventbus.$off("search")
    },
    watch: {
        "$route" () {
            this.refresh();
        },
        flattern(){
            this.depth = traversal.depth(this.notes);
        }
    },
    computed: {
        ...mapState(['flattern']),
        ...mapGetters({
            isStarred: "saved/isStarred",
            isSavedFilter: "saved/isSavedFilter"
        }),
        id: function(){
            return this.$route.params.id;
        },
        counter(){
            if(this.$route.query.q){
                return _.max([this.$route.query.q.length, 19]);
            }
            return 19;
        }
    },
    methods:{
        ...mapMutations({
            switchSaveFilter: "saved/filter",
            switchStarredNote: "saved/note"
        }),
        refresh: function(){
            this.root = null;
            this.breadsrumbs = [];
            this.notes = [];

            if(!this.id){
                this.notes = this.$store.state.notes;
            }else {
                let stack = this.$store.getters.findNoteStackById(this.id)
                if(stack){
                    stack.unshift("Root");
                    this.breadsrumbs = stack;
                    this.notes = stack.slice(-1)
                    this.root = this.notes[0];
                }
            }

            this.depth = traversal.depth(this.notes);

            if(this.$route.query.q){
                this.query = filter.parse(this.$route.query.q);
            }else{
                this.query = null;
            }
        },
        switchCollapse(){
            this.collapseLevel++;
            let maxLevel = this.depth-2;
            if(this.collapseLevel > _.min([maxLevel, 2])){
                this.collapseLevel = -1;
            }
            this.$store.commit("switchOutline", { notes: this.notes, level: this.collapseLevel });
        },
        search(payload){
            this.$router.push({ name:"note", params:{ id: this.id }, query: {q: payload}});
        },
        debounceSearch: _.debounce(function(payload){this.search(payload)}, 500),
        focusLast(e){
            let last = this.$store.getters.findLastVisibleNote();
            this.$store.commit("focus", {note:last, position:last.text.length})
        },
        tailHeightChange(){
            this.$nextTick(() => {
                if(this.$refs.tree.$el.offsetHeight < window.innerHeight){
                    this.treeHeight = this.$refs.tree.$el.offsetHeight;
                }else{
                    this.treeHeight = 0;
                }
            })
        }
    }
}
</script>

<style>
#tail{
    width: 100%;
    min-height: 180px;
}
</style>