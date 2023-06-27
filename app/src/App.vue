<template>
  <Navbar></Navbar>
  <div class="app">
      <router-view style="min-height: 100%;"></router-view>
  </div>  
  <MyDialog v-model:show="dialogVisible"
    :content_width="60">
  </MyDialog>
</template>

<script>
import Navbar from './components/Navbar.vue';
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex';

export default {
    data() {
      return {
        dialogVisible: false
      }
    },
    methods: {
        ...mapMutations({
            Auth: "auth/Auth",
            session_params_set: "session/session_params_set"
        }),
        onBasketClick() {
          this.dialogVisible = true
        },
        hideDialog() {
          this.dialogVisible = false
        }
    },
    mounted() {
        const auth_params = localStorage.getItem("auth_params");
        this.Auth(JSON.parse(auth_params));
        const session_params = localStorage.getItem("session_params");
        this.session_params_set(JSON.parse(session_params));
    },
    components: { Navbar }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.app{
  padding: 0px;
  min-height: 100%;
}
</style>