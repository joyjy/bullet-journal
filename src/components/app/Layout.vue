<template>
    <div>
        <v-navigation-drawer v-if="rightDrawer || false" app clipped right class="px-2">
            <slot name="right-drawer">
                <tag-all-list></tag-all-list>
            </slot>
        </v-navigation-drawer>

        <v-app-bar app flat dense :clipped-right="rightDrawer || false" color="grey lighten-5">
            <slot name="toolbar">
                
            </slot>

            <div class="flex-grow-1"></div>

            <v-toolbar-items>
                <slot name="toolbar-items">
                </slot>
            </v-toolbar-items>
        </v-app-bar>

        <v-divider id="app-bar-divider"></v-divider>
        
        <v-content>
            <v-container fluid>
                <slot name="default">
                </slot>
            </v-container>
        </v-content>
    </div>
</template>

<script>
import AllTag from '../tag/AllTag'

export default {
    props: ['rightDrawer'],
    components:{
        "tag-all-list": AllTag,
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
</style>