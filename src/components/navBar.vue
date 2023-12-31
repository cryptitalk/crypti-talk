<template>
  <div class="navbar">
    <mt-popup v-model="popupVisible" class="custom-popup">
      <panel></panel>
    </mt-popup>
    <wallet-modal ref="walletModal"></wallet-modal>
    <div class="app">
      <div class="nav">
        <div class="nav_left">
          <img src="../assets/wm.png" @click="popupVisible = true">
        </div>
        <div class="nav_center">
          <ul class="nav_tab">
            <li class="tab-item">
              <a @click="handleFrensTabClick">Frens</a>
            </li>
            <li class="tab-item">
              <a @click="handleBotsTabClick">Bots</a>
            </li>
            <li class="tab-item">
              <a @click="handleNewTabClick">News</a>
            </li>
          </ul>
        </div>
        <div class="nav_right">
          <w3m-button label="Connect" balance="hide" size="sm">Connect</w3m-button>
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
import Panel from './Panel.vue';
import WalletModal from './wallet.vue';
import { EventBus } from '../common/eventBus.js';

export default {
  data() {
    return {
      popupVisible: false,
      isWalletConnected: false,
      connectedAccount: '',
      isMobileDevice: false,
      walletProvider: null,
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
    async web3WalletConnectLogin() {
      try {
        if (this.$refs.walletModal) {
          this.$refs.walletModal.checkIfWalletIsConnected();
        }
      } catch (error) {
        console.error('Error with WalletConnect:', error);
      }
    },
    handleFrensTabClick() {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        this.$router.push({ path: '/main2/page2', query: { timestamp: new Date().getTime(), userScreenModeChanged: "Frens" } });
      } else {
        this.$router.push({ path: '/main2/page1', query: { timestamp: new Date().getTime(), userScreenModeChanged: "Frens" } });
      }
    },
    handleBotsTabClick() {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        this.$router.push({ path: '/main2/page2', query: { timestamp: new Date().getTime(), userScreenModeChanged: "Bots" } });
      } else {
        this.$router.push({ path: '/main2/page1', query: { timestamp: new Date().getTime(), userScreenModeChanged: "Bots" } });
      }
    },
    handleNewTabClick() {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        this.$router.push({ path: '/main2/page2', query: { timestamp: new Date().getTime(), userScreenModeChanged: "New" } });
      } else {
        this.$router.push({ path: '/main2/page1', query: { timestamp: new Date().getTime(), userScreenModeChanged: "New" } });
      }
    },
  },
  components: {
    Panel,
    WalletModal
  },
  created() {
    //this.$router.push('/main2')
  },
  mounted() {
    this.$refs.walletModal.checkIfWalletIsConnected();
    this.checkWalletConnectionInterval = setInterval(() => {
      if (this.$refs.walletModal) {
        this.$refs.walletModal.checkIfWalletIsConnected();
      }
    }, 15000); // 5000 milliseconds = 5 seconds
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          console.log('Account switched:', accounts[0]);
          if (this.$refs.walletModal) {
            this.$refs.walletModal.checkIfWalletIsConnected();
          }
        } else {
          // Handle case when user disconnects all accounts
          console.log('(accountsChanged) All accounts have been disconnected');
          global.connectedAccount = '';
          this.connectedAccount = '';
          this.isWalletConnected = false;
        }
      });
      window.ethereum.on('connect', (accounts) => {
        if (accounts.length > 0) {
          console.log('Account switched:', accounts[0]);
          if (this.$refs.walletModal) {
            this.$refs.walletModal.checkIfWalletIsConnected();
          }
        } else {
          // Handle case when user disconnects all accounts
          console.log('(connect) All accounts have been disconnected');
          global.connectedAccount = '';
          this.connectedAccount = '';
          this.isWalletConnected = false;
        }
      });
    }
  },
  beforeDestroy() {
    // Clear the interval when the component is destroyed
    if (this.checkWalletConnectionInterval) {
      clearInterval(this.checkWalletConnectionInterval);
    }
  },
}
</script>
<style lang="stylus" rel="stylesheet/stylus">
* {
  margin: 0;
  padding: 0;
}

.custom-popup {
  width: 80%;
  display: flex;
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
  padding: 10px 20px; /* Reduced padding */
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px; /* Smaller font size */
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
  border: none;
  color: white;
  padding: 10px 20px; /* Reduced padding */
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px; /* Smaller font size */
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
  transition: background-color 0.3s; /* Add transition for hover effect */
}

.app .nav .nav_center .nav_tab .tab-item:hover {
  background-color: #e0e0e0; /* Change background color on hover */
  cursor: pointer; /* Optional: Change cursor on hover */
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
  .nav_left {
    display: none;
  }
}
</style>