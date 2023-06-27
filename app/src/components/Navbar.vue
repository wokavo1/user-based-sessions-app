<template>
    <div class="navbar">
        <div class="navbar__btns">
            <MyButton class="btns" @click="$router.push('/')">Главная</MyButton>

            <div v-if="isAuth" class="login__btns"> 
                <h3>{{ username }}</h3>
                <MyButton class="btns" @click="Logout">Выйти</MyButton>
            </div>
            <div v-else class="login__btns">
                <MyButton class="btns" @click="$router.push('/login')">Войти</MyButton>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex';

export default {
    name: 'Navbar',
    computed: {
        ...mapState({
            isAuth: state => state.auth.isAuth,
            username: state => state.auth.username
        }),
    },
    methods: {
        ...mapMutations({
            Auth: 'auth/Auth'
        }),
        Logout() {
            this.Auth({
                isAuth: false,
                token: "",
                roles: [],
                username: ''
            })
            this.$router.push('/')
        },
    }
}
</script>

<style scoped>
.navbar {
    height: 50px;
    background-color: gray;
    box-shadow: 2px 2px 4px lightgray;
    display: flex;
    align-items: center;
    padding: 0 15px;
}
.navbar__btns { 
    width: 100%;
    margin-left: 15px;
    display: flex;
    align-items: center;
}

.login__btns {
    display: flex; 
    margin-left: auto;
    align-items: center;
}

.btns {
    background-color: white;
    margin-left: 15px;
    background-color: wheat;
}
</style>