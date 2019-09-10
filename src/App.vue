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
  },
  mounted: function () {
    this.$el.ownerDocument.addEventListener('keydown', this.onKey, {capture: true})
  },
  beforeDestroy: function () {
    this.$el.ownerDocument.removeEventListener('keydown', this.onKey)
  },
  methods: {
    onKey: function(e){
      if(e.keyCode == 90){
        if(navigator.platform.indexOf('Mac') > -1 && event.metaKey || event.ctrlKey){
          this.$store.commit("undo")
          e.stopPropagation();
        }
      }
    }
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
