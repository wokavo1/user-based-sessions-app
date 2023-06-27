<template>
    <div class="auth_form">
        <h2 style="margin-top: 20px">Login</h2>
        <MyInput v-model:value="username" />
        <h2 style="margin-top: 20px">Password</h2>
        <MyInput type="password" v-model:value="password" />
        <MyButton class="button" @click="Login"> Войти </MyButton>
        <a style="align-self: center; margin-top: 15px" href="/registration"> Нет аккаунта? Создать аккаунт </a>

        <div v-if="isBadLogin" class="error">
            <text>{{ error }}</text>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from "vuex";

export default {
    data() {
        return {
            username: "",
            password: "",
            isBadLogin: false,
            error: "",
        };
    },
    methods: {
        ...mapMutations({
            Auth: "auth/Auth",
        }),
        async Login() {
            try {
                //console.log(this.username, this.password);

                const res = await fetch("http://localhost:5000/auth/login", {
                    method: "POST",
                    cors: "no-cors",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: this.username,
                        password: this.password,
                    }),
                });

                const response = await res.json();

                if (response.error) {
                    this.error = response.error.message;
                    this.isBadLogin = true;
                    return;
                }

                //console.log(response)
                this.Auth({
                    isAuth: true,
                    token: response.token,
                    username: this.username,
                });

                this.isBadLogin = false;

                this.$router.push("/");
            } catch (e) {
                console.error(e);
            }
        },
    },
    computed: {
        ...mapState({
            isAuth: (state) => state.auth.isAuth,
        }),
    },
};
</script>

<style scoped>
.auth_form {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    margin-left: 30%;
    margin-right: 30%;
}

.button {
    align-self: center;
    margin-top: 15px;
}

.error {
    margin-top: 25px;
    align-self: center;
    color: lightcoral;
}
</style>
