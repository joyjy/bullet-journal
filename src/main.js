import Vue from 'vue'
import vuetify from './plugins/vuetify';

import App from './App.vue'
import Router from './Router.vue'
import Store from './Store.vue'

Vue.config.productionTip = false

new Vue({
  vuetify,
  router: Router,
  store: Store,
  render: h => h(App),
}).$mount('#app')
