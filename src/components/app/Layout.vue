<template>
    <div>
        <v-navigation-drawer v-if="rightDrawer || false" app clipped right class="px-2">
            <slot name="right-drawer">
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
export default {
    props: ['rightDrawer']
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