<template>
    <el-container class=balance-container>
        <el-main>
            <table>
                <tr>
                    <th>{{ $t('summary.total') }}</th>
                    <td>{{ totalBalance }} ZEN</td>
                </tr>
                <tr>
                    <th>{{ $t('summary.fiat') }}</th>
                    <td>{{ fiatBalance }} USD</td>
                </tr>
            </table>
        </el-main>
    </el-container>
</template>

<script>
    import { mapState, mapGetters, mapActions } from 'vuex'
    export default {
        name: 'balance-summary',
        computed: {
            ...mapState([
                'totalBalance',
                'fiatBalance'
            ])
        },
    }
</script>

<style lang=less scoped>
    .balance-container {
        text-align:left;
        background-color: #1b2f5a;
        color: #fff;
        
        th, td {
            padding:5px;
        }
    }
</style>
