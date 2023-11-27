<template>
  <div class="navbar">
    <mt-popup v-model="popupVisible" position="left">
      <panel></panel>
    </mt-popup>
    <div class="app">
      <div class="nav">
        <div class="nav_left">
          <img src="../assets/wm.png" @click="popupVisible = true">
        </div>
        <div class="nav_center">
          <ul class="nav_tab">
            <!--
            <li class="tab-item">
              <router-link to="/main1">search</router-link>
            </li>
-->
            <li class="tab-item">
              <router-link :to="dynamicRoute">discovery</router-link>
            </li>
            <!--
            <li class="tab-item">
              <router-link to="/main3">购买</router-link>
            </li>
-->
          </ul>
        </div>
        <div class="nav_right">
          <vue-metamask ref="metamask" :initConnect="false" @onComplete="handleMetaMaskData"></vue-metamask>
          <button v-if="!isWalletConnected" @click="web3Login" class="web3-login-button">
            Login
          </button>
          <div v-else class="wallet-info">
            <button @click="disconnectWallet" class="web3-disconnect-button">
              Discon {{ formattedAddress }}
            </button>
          </div>
        </div>
      </div>
      <div class="search">
        <div class="search-input">
          <img src="../assets/search.png" />
          <input type="text" placeholder="Search the web3 world" @focus="focus()">
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Panel from './Panel.vue'
import VueMetamask from 'vue-metamask';
export default {
  data() {
    return {
      popupVisible: false,
      isWalletConnected: false,
      connectedAccount: ''
    }
  },
  computed: {
    dynamicRoute() {
      const isDesktop = window.innerWidth >= 1024;
      return isDesktop ? '/main2/page2' : '/main2/page1';
    },
    formattedAddress() {
      if (this.connectedAccount) {
        const lastFour = this.connectedAccount.slice(-4); // Get the last 4 characters
        console.log("last four: ", lastFour)
        return `0X${lastFour.toUpperCase()}`; // Format and return
      }
      return '';
    },
  },
  methods: {
    focus() {
      this.$router.push('/search')
    },
    async web3Login() {
      await this.$refs.metamask.init();
      await this.checkIfWalletIsConnected()
    },
    async disconnectWallet() {
      this.isWalletConnected = false;
      global.connectedAccount = '';
      this.connectedAccount = '';
    },
    handleMetaMaskData(data) {
      console.log('data:', data.web3.eth);
    },
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    },
    async sign_login() {
    if (window.ethereum && this.connectedAccount) {
      try {
        // Prepare the message to be signed
        const message = "logged-in";
        // Request user to sign the message using MetaMask
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, this.connectedAccount],
        });

        // Set the cookie after successful signing
        document.cookie = "logged-in:"+this.connectedAccount+"=" + signature + "; path=/; max-age=3600"; // Expires in 1 hour

        console.log('Message signed:', signature);
      } catch (error) {
        console.error('Error signing message:', error);
      }
    } else {
      console.log('Ethereum object or connected account not found.');
    }
  },
    async checkIfWalletIsConnected() {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            console.log('Wallet is connected:', accounts);
            this.isWalletConnected = true;
            this.connectedAccount = accounts[0];
            global.connectedAccount = accounts[0];
            // Check if the 'logged-in' cookie is present
            const loggedInCookie = this.getCookie('logged-in:'+accounts[0]);
            if (!loggedInCookie) {
              await this.sign_login(); // Call the sign_login method if cookie is not found
            }
          } else {
            console.log('Wallet is not connected');
            this.isWalletConnected = false;
            global.connectedAccount = '';
            this.connectedAccount = '';
          }
        } catch (error) {
          console.error(error);
          // Handle any errors
        }
      } else {
        console.log('Ethereum object not found, install MetaMask.');
        alert('MetaMask is not detected. Please install MetaMask to use complete feature.');
      }
    }
  },
  components: {
    Panel,
    VueMetamask
  },
  created() {
    this.$router.push('/main2')
    this.checkIfWalletIsConnected();
  },
  mounted() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          console.log('Account switched:', accounts[0]);
          this.checkIfWalletIsConnected()
        } else {
          // Handle case when user disconnects all accounts
          console.log('All accounts have been disconnected');
          global.connectedAccount = '';
          this.connectedAccount = '';
          this.isWalletConnected = false;
        }
      });
    }
  },
}
</script>
<style lang="stylus" rel="stylesheet/stylus">
* {
  margin: 0;
  padding: 0;
}

/* Centering .navbar */
.navbar {
  display: flex;
  justify-content: center; /* Horizontally center the content */
  align-items: center; /* Vertically center the content */
  //min-height: 100vh; /* Make .navbar take at least the full height of the viewport */
}

.web3-login-button {
  background-color: blue;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 8px;
}

.web3-login-button .icon {
  width: 15px; /* Adjust size as needed */
  height: auto;
  margin-right: 8px;
}

.web3-disconnect-button {
  background-color: orange; /* Orange background for disconnect button */
  /* Other styles can be similar to .web3-login-button */
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 8px;
}

/* Styles for .app and other elements */
.app {
  width: 100%;
  max-width: 1024px;
  font-size: 16px;
  font-family: sans-serif;
}

.app a {
  color: grey;
  text-decoration: none;
}

.app a:visited {
  color: grey;
}

.app .nav {
  display: flex;
  flex-direction: row;
}

.app .nav .nav_left {
  flex: 1;
  padding-top: 0.37rem;
  text-align: center;
}

.app .nav .nav_left img {
  width: 0.76rem;
  height: 0.76rem;
  margin-top: 3px;
  margin-left: 3px;
}

.app .nav .nav_center {
  flex: 3;
  height: 1.02rem;
  color: #a6a6a6;
  line-height: 1.02rem;
  padding-top: 0.28rem;
  font-size: 0.46rem;
}

.app .nav .nav_center ul li {
  list-style: none;
}

.app .nav .nav_center .nav_tab {
  width: 100%;
  display: flex;
  flex-direction: row;
}

.app .nav .nav_center .nav_tab .tab-item a {
  text-decoration: none;
}

.app .nav .nav_center .nav_tab .tab-item {
  width: 27%;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}

.app .nav .nav_right {
  flex: 1;
  padding-top: 0.48rem;
  text-align: center;
}

.app .nav .nav_right img {
  width: 0.67rem;
  height: 0.67rem;
}

.app .search {
  width: 100%;
  height: 1.20rem;
  line-height: 1.20rem;
  margin-top: 0.19rem;
  text-align: center;
}

.app .search .search-input {
  width: 90%;
  height: 0.83rem;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: row;
  border-radius: 30px;
  background: #e6e6e6;
}

.app .search .search-input img {
  width: 0.50rem;
  height: 0.50rem;
  margin: 0.16rem;
  margin-left: 0.28rem;
}

.app .search .search-input input {
  width: 90%;
  height: 0.83rem;
  border: none;
  color: #666666;
  font-size: 0.46rem;
  border-radius: 30px;
  background: #e6e6e6;
}

@media screen and (min-width: 1024px) {
  .app {
    min-width: 1024px; /* Ensure .app does not go below 1024px width on larger screens */
  }
}
</style>