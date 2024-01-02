<template>
  <q-page class="bg-external" style="position: relative; height: 100vh">
    <div class="absolute-full row flex-center">
      <q-card
        :class="{ 'shake-animation': shakeError }"
        class="login-card q-pa-lg"
        style="width: 350px"
      >
        <q-card-section class="q-pb-none">
          <img
            :src="'/taurus.png'"
            :style="{
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: '35px'
            }"
          />
          <div class="text-h6 text-center q-mb-md taurus-login-title">
            Taurus Manager <span class="taurus-login-version">v2.0.0</span>
          </div>
        </q-card-section>
        <form @submit.prevent="handleLogin">
          <q-card-section class="q-pt-none">
            <q-input
              filled
              v-model="login"
              placeholder="Login"
              class="q-mb-md"
              ref="loginInput"
              autofocus
              autocomplete="current-username"
              @keyup.enter="focusOnPass"
            />
            <q-input
              filled
              v-model="password"
              placeholder="Password"
              type="password"
              ref="passInput"
              autocomplete="current-password"
              @keyup.enter="handleLogin"
            />
          </q-card-section>
        </form>
        <q-card-section class="q-pt-none">
          <q-btn
            label="LOGIN"
            color="primary"
            class="full-width"
            @click="handleLogin"
          />
        </q-card-section>
      </q-card>
    </div>
    <div class="footer">
      <div>© 2023 - made with ♥ by Not Empty Free Software Foundation.</div>
      <div class="q-mt-xs">
        <a
          href="https://github.com/not-empty"
          target="_blank"
          class="text-white q-mr-md"
          >Not Empty</a
        >
        <a
          href="https://github.com/not-empty/taurus-manager-vue"
          target="_blank"
          class="text-white"
          >Github Repository</a
        >
      </div>
    </div>
  </q-page>
</template>

<script>
import axios from 'axios';
import Cookies from 'js-cookie';

export default {
  data() {
    return {
      login: '',
      password: '',
      shakeError: false
    };
  },
  methods: {
    async handleLogin() {
      this.shakeError = false;

      if (!this.login || !this.password) {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: '<span class="nofification">All fields are required.</span>',
          html: true,
          timeout: 2000
        });
        this.$nextTick(() => {
          this.shakeError = true;
        });
        this.$refs.loginInput.focus();
        return;
      }

      try {
        await axios.post('session', {
          login: this.login,
          password: this.password
        });

        const expires = new Date(new Date().getTime() + 8 * 60 * 59 * 1000);
        Cookies.set('isLogged', 'true', { expires });

        this.$router.push('/view/dashboard');
      } catch (error) {
        this.$nextTick(() => {
          this.shakeError = true;
        });

        this.$q.notify({
          color: 'negative',
          position: 'top',
          message:
            error.response && error.response.data.message
              ? '<span class="nofification">' +
                error.response.data.message +
                '</span>'
              : 'There was an error processing your request.',
          html: true,
          timeout: 2500
        });

        this.login = '';
        this.password = '';
        this.$refs.loginInput.focus();

        setTimeout(() => {
          this.shakeError = false;
        }, 500);
      }
    },
    focusOnPass() {
      this.$refs.passInput.focus();
    }
  }
};
</script>

<style scoped></style>
