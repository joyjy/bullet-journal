<template>
    <div class="fill-height">
        <v-navigation-drawer v-if="rightDrawer || false" app clipped right width="360">
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
    </div>
</template>

<script>
import TagPane from "../tag/Pane";

export default {
    props: ["rightDrawer", "color"],
    components:{
        "tags": TagPane,
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