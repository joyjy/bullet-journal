<template>
  <router-view></router-view>
</template>

<script>
import { mapGetters, mapMutations, mapActions, mapState } from "vuex"

export default {
  data: () => ({}),
  components: {
  },
  created: function(){
    if(!this.signed() && this.$route.name != 'signin'){
      this.$router.push({'name': 'signin'}).catch(err => {})
    }
  },
  mounted: function () {
    window.addEventListener('keydown', this.onKey, {capture: true})
  },
  beforeDestroy: function () {
    window.removeEventListener('keydown', this.onKey)
  },
  computed: {
    ...mapGetters(["signed"]),
    ...mapState({
      loading: state => state.loading,
      token: state => state.user.token
    })
  },
  watch:{
    token(){
      if(!this.token){
        this.$router.push({'name': 'signin'}).catch(err => {})
      }
    }
  },
  methods: {
    ...mapMutations(["undo"]),
    ...mapActions(["save"]),
    onKey: function(e){
      if(this.loading){
        return;
      }

      if(e.keyCode == 90){ // 
        if(navigator.platform.indexOf('Mac') > -1 && e.metaKey || e.ctrlKey){ // ctrl+z
          this.undo();
          e.preventDefault();
          e.stopPropagation();
        }
      }else if(e.keyCode == 83) {// s
        if(navigator.platform.indexOf('Mac') > -1 && e.metaKey || e.ctrlKey){ // ctrl+s
          this.save();
          e.preventDefault();
          e.stopPropagation();
        }
      }else if(e.keyCode == 191 && e.shiftKey){ // shift+/ == ?
        if(e.target.hasAttribute("contenteditable")){
          return;
        }
        this.$eventbus.$emit("show-help");
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  /* font-family: "Noto Sans", "Noto Sans CJK SC", sans-serif; */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #212121; /*grey darken-4*/
}
.v-list-item__action{
  margin: 0!important;
}
</style>
