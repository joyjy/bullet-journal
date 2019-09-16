import Vue from 'vue'
import vuetify from './plugins/vuetify';

import App from './App'
import router from './router'
import store from './store'

Vue.config.productionTip = false

const waitForStorageToBeReady = async (next) => {
  await store.restored
  next()
}

Vue.prototype.$eventbus = new Vue()

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App),
}).$mount('#app')

waitForStorageToBeReady(() => { 
    store.dispatch("init");
})
