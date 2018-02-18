<template>
    <el-row>
        <el-col :span=24>
            <img class="logo" src="~@/assets/icons/zen_icon.png" />
        </el-col>
         <el-col :span=24>
            <el-container v-if="loginFailed">
                <el-main class=validation-message>{{ $t('loginpage.wrongusernameorpassword') }}</el-main>
            </el-container>
        </el-col>
        <el-col :span=12 :offset=6 class=form-wrapper>
            <el-form ref="form" :model="loginForm">
                <el-form-item>
                <el-input v-bind:placeholder="$t('loginpage.username')" v-model="loginForm.username"></el-input>
                </el-form-item>
                <el-form-item>
                <el-input v-bind:placeholder="$t('loginpage.password')" v-model="loginForm.password" type=password></el-input>
                </el-form-item>
                <el-button class=login-button type=primary @click="login">{{ $t('loginpage.login') }}</el-button>
            </el-form>
        </el-col>
    </el-row>
</template>

<script>
    export default {
        name: 'login',
        components: { },
        data() {
            return {
                loginForm: {
                    username: null,
                    password: null
                },
                loginFailed: false
            }
        },
        methods: {
            login() {
                this.$store.dispatch('login', this.loginForm);
                if (this.$store.state.loggedIn) {
                    this.$router.push('/wallet');
                }
                else {
                    this.loginFailed = true;
                }
            }
        }
    }
</script>

<style>
    .logo {
        padding-top:50px;
        height: 100px;
        margin:auto;
        display:block;
    }
    .form-wrapper {
        margin-top:50px;
    }
    .login-button {
        margin: auto;
        display: block;
    }
    .validation-message {
        margin-top:50px;
        background-color: #ff0000;
        color: #fff;
        text-align: center;
        font-size: 24px;
    }
</style>
