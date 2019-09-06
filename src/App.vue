<template>
  <v-app>
    <app-nav-bar></app-nav-bar>

    <v-content>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
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
*{
  margin: 0;
  padding: 0;
}

li {
    list-style: none;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.main{
  margin-left: 4rem;
  padding: 1rem 2rem;
}
</style>
