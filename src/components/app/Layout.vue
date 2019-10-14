<template>
    <v-app>
        <app-nav-bar></app-nav-bar>

        <v-navigation-drawer v-if="rightDrawer || false" app clipped right :width="rightDrawerWidth || 360">
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
        </v-app-bar>

        <v-divider id="app-bar-divider"></v-divider>
        
        <v-content class="fill-height">
            <v-container fluid :style="{backgroundColor:color, height:'100%'}">
                <slot name="default">
                </slot>
            </v-container>
        </v-content>

        <v-overlay :value="showNotebookWizard" @click.native="closeWizard">
            <notebook-wizard></notebook-wizard>
        </v-overlay>
    </v-app>
</template>

<script>
import AppNavBar from "./NavBar"
import TagPane from "../tag/Pane";
import NotebookWizard from "../notebook/Wizard";

export default {
    props: ["rightDrawer", "rightDrawerWidth", "color"],
    data: () =>({
        showNotebookWizard:false,
    }),
    mounted(){
        this.$eventbus.$on("show-notebook-wizard", (value) => this.showNotebookWizard = value);
    },
    destroyed(){
        this.$eventbus.$off("show-notebook-wizard")
    },
    components:{
        AppNavBar,
        "tags": TagPane,
        NotebookWizard,
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