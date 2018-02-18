import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login-page',
      component: require('@/components/LoginPage').default
    },
    {
        path: '/createwallet',
        name: 'createwallet-page',
        component: require('@/components/CreateWalletPage').default
    },
    {
        path: '/wallet',
        name: 'wallet-page',
        component: require('@/components/WalletPage').default
    },
    {
        path: '/transactions',
        name: 'transactions-page',
        component: require('@/components/TransactionsPage').default
    },
    { 
      path: '*',
      redirect: '/'
    }
  ]
})
