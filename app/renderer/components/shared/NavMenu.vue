<template>
    <el-menu
        :default-active="$route.path"
        mode="horizontal"
        background-color="#1b2f5a"
        text-color="#fff"
        active-text-color="#69ffbd"
        :router="true">

        <el-menu-item index="/wallet">{{ $t('menu.addresses') }}</el-menu-item>
        <el-menu-item index="/transactions">{{ $t('menu.transactions') }}</el-menu-item>
        <el-submenu index="3">
            <template slot="title">Workspace</template>
            <el-menu-item index="3-1">item one</el-menu-item>
            <el-menu-item index="3-2">item two</el-menu-item>
            <el-menu-item index="3-3">item three</el-menu-item>
        </el-submenu>
        <el-menu-item @click="logout" index="99" class=pull-right>{{ $t('menu.logout') }}</el-menu-item>
    </el-menu>
</template>

<script>
    export default {
        name: 'nav-menu',
        methods: {
            logout() {
                this.$store.dispatch('logout');
                this.$router.push('/login');
            }
        }
    }
</script>

<style>
    .el-menu--horizontal>.el-menu-item.pull-right{
        float:right;
    }
</style>
