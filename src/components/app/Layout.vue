<template>
    <v-app>
        <app-nav-bar></app-nav-bar>

        <v-navigation-drawer v-if="rightDrawer || false" v-model="showTag" app clipped right :width="rightDrawerWidth || 360">
            <slot name="right-drawer">
                <tags></tags>
            </slot>
        </v-navigation-drawer>

        <v-app-bar app flat dense :clipped-right="rightDrawer || false" color="grey lighten-5">
            <slot name="toolbar">
                
            </slot>

            <div class="flex-grow-1"></div>

            <slot name="toolbar-items">
            
            </slot>

            <v-menu offset-y>
                <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on">
                        <v-icon>mdi-settings-outline</v-icon>
                    </v-btn>
                </template>
                <v-list width="200">
                    <v-list-item @click="showTag = !showTag">
                        <v-list-item-title>
                            Toggle Tags
                        </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="$eventbus.$emit('show-help')">
                        <v-list-item-title>
                            Help
                        </v-list-item-title>
                        <v-list-item-action-text>
                            ?
                        </v-list-item-action-text>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-app-bar>

        <v-divider id="app-bar-divider"></v-divider>
        
        <v-content class="fill-height">
            <v-container fluid :style="{backgroundColor:color, height:'100%'}">
                <slot name="default">
                </slot>
            </v-container>
        </v-content>

        <v-overlay :value="showNotebookWizard" @click.native="closeWizard" z-index="10">
            <notebook-wizard></notebook-wizard>
        </v-overlay>

        <v-overlay :value="showHelp" @click.native="showHelp = !showHelp" z-index="10">
            <help></help>
        </v-overlay>

        <v-overlay :value="loading" z-index="10">
            <v-progress-linear indeterminate></v-progress-linear>
        </v-overlay>
    </v-app>
</template>

<script>
import { mapState } from "vuex"

import AppNavBar from "./NavBar"
import TagPane from "../tag/Pane";
import NotebookWizard from "../notebook/Wizard";
import Help from "../app/Help"

export default {
    props: ["rightDrawer", "rightDrawerWidth", "color"],
    data: () =>({
        showTag: true,
        showNotebookWizard: false,
        showHelp: false,
    }),
    mounted(){
        this.$eventbus.$on("show-notebook-wizard", (value) => this.showNotebookWizard = value);
        this.$eventbus.$on("show-help", (value) => this.showHelp = !this.showHelp);
    },
    destroyed(){
        this.$eventbus.$off("show-notebook-wizard")
        this.$eventbus.$off("show-help");
    },
    components:{
        AppNavBar,
        "tags": TagPane,
        NotebookWizard,
        Help,
    },
    computed:{
        ...mapState({ loading: state => state.loading })
    },
    methods:{
        closeWizard(event){
            if(event.target.classList.contains("v-overlay__scrim")){
                this.showNotebookWizard = false;
            }
        }
    }
}
</script>

<style>
#app-bar-divider{
    position: fixed;
    width: 100%;
    top: 48px;
    z-index: 5;
}
main{
    overflow: hidden;
}
.compact-form {
    transform: scale(0.75);
    transform-origin: 85% center;
}
.inline-form {
    transform: scale(0.75);
    transform-origin: center;
    padding:0;
    margin: 0 -20%;
}
</style>