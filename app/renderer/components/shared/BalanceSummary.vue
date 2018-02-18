<template>
    <el-container class=balance-container>
        <el-main>
            <table>
                <tr>
                    <th>Total Balance</th>
                    <td>3.00000000 ZEN</td>
                </tr>
                <tr>
                    <th>Fiat</th>
                    <td>324 USD</td>
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
                'tBalance',
                'zBalance',
                'totalBalance'
            ])
        },
    }
</script>

<style lang=less>
    .balance-container {
        padding: 20px;
        text-align:left;
        background-color: #1b2f5a;
        color: #fff;
        
        th, td {
            padding:5px;
        }
    }
</style>
