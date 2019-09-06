<template>
  <v-app>
    <app-nav-bar></app-nav-bar>

    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
import AppNavBar from "./components/app/NavBar.vue"

export default {
  name: 'app',
  data: () => ({}),
  components: {
    AppNavBar
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
