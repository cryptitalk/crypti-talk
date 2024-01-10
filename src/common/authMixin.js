import { EventBus } from '../common/eventBus.js';

export const authMixin = {
  methods: {
    getCookie(name) {
      // if connected account is not null try to sign the cookie
      if (global.connectedAccount != null) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          return parts.pop().split(';').shift();
        }
        else {
          EventBus.$emit('needLoginCookie', 'login-cookie');
          alert("Please sign login-cookie first!")
        }
      }
      return null;
    },
    getAuthConfig() {
      const loginInfo = this.getCookie('logged-in:' + global.connectedAccount);
      const config = {};
      if (loginInfo) {
        config.headers = {
          Authorization: global.connectedAccount + ":" + loginInfo
        };
      }
      return config;
    }
  }
};
