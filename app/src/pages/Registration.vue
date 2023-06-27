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
            let response;
            try {
                console.log(this.username, this.password);
                response = await axios.post("http://localhost:5000/auth/registration", {
                    username: this.username,
                    password: this.password,
                });

                //console.log(response)
                this.isBadLogin = false;

                this.$router.push("/registration/success");
            } catch (e) {
                console.log(e.response.data);
                this.isBadLogin = true;
                this.error = e.response.data.error.message;
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
