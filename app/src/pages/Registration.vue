<template>
    <div class="auth_form">
        <h2 style="margin-top: 20px">Login</h2>
        <MyInput v-model:value="username" />
        <h2 style="margin-top: 20px">Password</h2>
        <MyInput type="password" v-model:value="password" />
        <MyButton class="button" @click="Registration"> Зарегистрироваться </MyButton>

        <div v-if="isBadLogin" class="error">
            <text>{{ error }}</text>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapState, mapActions, mapMutations } from "vuex";
import axios from "axios";

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
        async Registration() {
            try {
                const res = await fetch("http://localhost:5000/auth/registration", {
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
                    this.isBadLogin = true;
                    this.error = response.error.message;
                    return;
                }

                //console.log(response)
                this.isBadLogin = false;

                this.$router.push("/registration/success");
            } catch (e) {
                console.log(e);
            }
        },
    },
    computed: {},
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
