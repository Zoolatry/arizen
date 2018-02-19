<template>
    <el-row>
        <el-col :span=24>
            <el-table :data="addresses" v-bind:empty-text="$t('addresses.noaddresses')" height="calc(100vw - 188px)">
                <el-table-column prop="address" v-bind:label="$t('addresses.address')" class-name=courier width=350></el-table-column>
                <el-table-column prop="name" v-bind:label="$t('addresses.name')"></el-table-column>
                <el-table-column prop="balance" v-bind:label="$t('addresses.balance')"></el-table-column>
                <el-table-column v-bind:label="$t('addresses.operations')">
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
    components: { },
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

<style lang=less>
  .el-table__body-wrapper {
    .courier {
      font-family: 'Courier', sans-serif;
    }
  }
</style>
