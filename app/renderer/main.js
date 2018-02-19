import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import ElementUI from 'element-ui'
import VueI18n from 'vue-i18n'
import log from "js-vue-logger"

import 'element-ui/lib/theme-chalk/index.css'
import './styles/main.less'

log.useDefaults();
log.setLevel(log.INFO);

log.info("Initialized logger");

const messages = {
  en: {
    loginpage: {
      username: 'username',
      password: 'password',
      login: 'login',
      wrongusernameorpassword: "Wrong username or password",
    },
    menu: {
      addresses: 'Addresses',
      transactions: 'Transactions',
      logout: "Logout",
    }
  },
  de: {
    loginpage: {
      username: 'Benutzername',
      password: 'Passwort',
      login: 'Login',
      wrongusernameorpassword: "Falscher Benutzername oder Passwort",
    },
    menu: {
      addresses: 'Addressen',
      transactions: 'Transaktionen',
      logout: "Abmelden",
    },
    addresses: {
      address: 'Addresse',
      balance: 'ZEN',
      operations: "Aktionen",
      noaddresses: "Keine Addressen vorhanden",
      name: "Name",
    },
    summary: {
      total: 'Total',
      fiat: "USD ~",
    }
  }
}

Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: 'de', // set locale
  fallbackLocale: 'en',
  messages, // set locale messages
})

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(ElementUI)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  i18n,
  template: '<App/>',
}).$mount('#app')
