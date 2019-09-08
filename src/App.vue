<template>
  <v-app>
    <app-nav-bar></app-nav-bar>
    
    <router-view></router-view>

    <app-fab></app-fab>
  </v-app>
</template>

<script>
import AppNavBar from "@/components/app/NavBar.vue"
import AppFab from "@/components/app/Fab.vue"

export default {
  name: 'app',
  data: () => ({}),
  components: {
    AppNavBar,
    AppFab,
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #424242; /*grey darken-3*/
}
</style>
