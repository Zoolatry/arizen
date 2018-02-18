<template>
    <el-row>
        <el-col :span=24>
            <el-table :data="addresses" empty-text="None">
                <el-table-column prop="address" label="address"></el-table-column>
                <el-table-column prop="balance" label="Amount"></el-table-column>
                <el-table-column label="Operations">
                    <template slot-scope="scope">
                        <el-button size="mini" @click="deposit(scope.$index, scope.row)" icon="el-icon-circle-plus"></el-button>
                        <el-button size="mini" @click="withdraw(scope.$index, scope.row)" icon="el-icon-remove"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-col>
    </el-row>
</template>

<script>
  import { mapState,mapGetters, mapActions } from 'vuex'
  export default { 
    name: 'addresses',
    components: {  },
    data() {
      return {
        polling :false,
        'hoverAddress': null
      }
    },
    computed:{
      ...mapState([
        'addresses',
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
    }
  }
</script>

<style>

</style>
