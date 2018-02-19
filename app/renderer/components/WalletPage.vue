<template>
    <el-container>
        <el-header>
            <nav-menu></nav-menu>
        </el-header>
        <el-main>
            <addresses></addresses>
        </el-main>
        <el-footer height=auto>
            <balance-summary></balance-summary>
        </el-footer>
    </el-container>
</template>

<script>
  import { mapState, mapGetters, mapActions } from 'vuex'
  import Addresses from './wallet/Addresses'
  import NavMenu from './shared/NavMenu'
  import BalanceSummary from './shared/BalanceSummary'

  export default { 
    components: { Addresses, NavMenu, BalanceSummary },
    data() {
      return {
        'hoverAddress': null
      }
    },
    computed:{
      ...mapState([
        'tBalance',
        'zBalance',
        'totalBalance'
      ]),
      ...mapGetters([
        'zAddresses',
        'tAddresses',
      ])
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      mouseover (address) {
        this.$data.hoverAddress = address;
      },
      ...mapActions([
        'addTAddress',
        'addZAddress', 
      ]),
      copy (value) {
        copy(value)
        alert('Copied ' + value + ' to clipboard.')
      }
    },
    mounted: function() {
      this.$store.dispatch('refreshBalances');
    }
  }
</script>

<style lang=less scoped>
    header,
    main,
    footer {
        padding:0;
    }

    footer {
        position:fixed;
        bottom:0;
        width:100%;
    }
</style>
