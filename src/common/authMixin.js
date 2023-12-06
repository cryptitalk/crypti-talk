export const authMixin = {
    methods: {
      getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
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
  