import Vue from 'vue'
import vuetify from './plugins/vuetify';

import App from './App.vue'
import router from './Router.vue'
import store from './Store.vue'

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App),
}).$mount('#app')
