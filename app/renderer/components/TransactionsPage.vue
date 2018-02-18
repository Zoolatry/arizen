<template>
    <el-row>
        <el-col :span=24>
            <nav-menu></nav-menu>
        </el-col>
         <el-col :span=24>
             <el-table :data="transactions" height="280" style="width: 100%" empty-text="None">
                <el-table-column prop="category" label="Category" width="100"></el-table-column>
                <el-table-column prop="amount" label="Amount" width="180"></el-table-column>
                <el-table-column prop="address" label="Address" width="*" class-name="address"></el-table-column>
                <el-table-column prop="confirmations" label="Conf" width="60"></el-table-column>
            </el-table>
        </el-col>
    </el-row>
</template>

<script>
  import { mapState, mapGetters, mapActions } from 'vuex'
  import NavMenu from './shared/NavMenu'

  export default { 
    components: { NavMenu },
    computed:{
      ...mapState([
        'transactions'
      ])
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    },
    mounted: function() {     
    }
  }
</script>

<style>

</style>