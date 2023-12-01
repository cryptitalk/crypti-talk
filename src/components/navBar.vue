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
          <w3m-button label="Connect">Connect</w3m-button>
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
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5';
import { ethers } from 'ethers'

const projectId = '2306be42fa635e4c7f57e5002e25f088';

const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com'
};

const polygon = {
  chainId: 137,
  name: 'Polygon',
  currency: 'MATIC',
  explorerUrl: 'https://polygonscan.com/',
  rpcUrl: 'https://polygon-rpc.com/'
}

const bsc = {
  chainId: 56,
  name: 'BSC',
  currency: 'BNB',
  explorerUrl: 'https://polygonscan.com/',
  rpcUrl: 'https://bscscan.com/'
}

const metadata = {
  name: 'Crypti Talk',
  description: 'Decentralized AI and Advertisible NFT',
  url: 'https://app.cryptitalk.com',
  icons: ['https://storage.googleapis.com/cryptitalk/cryptitalk.png']
};

const modal = createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [mainnet, polygon, bsc],
  projectId
});
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
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    },
    async sign_login() {
      if (this.walletProvider && this.connectedAccount) {
        try {
          if (this.checkIfMobileDevice()) {
            modal.open({ view: 'Connect' })
          }
          // Create a new Web3Provider instance using ethers
          const provider = new ethers.providers.Web3Provider(this.walletProvider);

          // Get the signer object from the provider
          const signer = provider.getSigner();

          // Prepare the message to be signed
          const message = "logged-in";
          // Request user to sign the message
          const signature = await signer.signMessage(message);

          // Set the cookie after successful signing
          document.cookie = "logged-in:" + this.connectedAccount + "=" + signature + "; path=/; max-age=36000"; // Expires in 1 hour

          console.log('Message signed:', signature);
        } catch (error) {
          console.error('Error signing message:', error);
        }
      } else {
        console.log('Wallet provider or connected account not found.');
      }
    },
    async web3WalletConnectLogin() {
      try {
        await this.checkIfWalletIsConnected()
      } catch (error) {
        console.error('Error with WalletConnect:', error);
      }
    },
    checkIfMobileDevice() {
      return /Mobi|Android/i.test(navigator.userAgent);
    },
    async getWalletProviderWithRetry(maxRetries = 3) {
      let attempts = 0;
      let walletProvider = null;

      while (attempts < maxRetries) {
        try {
          walletProvider = await modal.getWalletProvider();
          if (walletProvider) {
            console.log('Wallet provider found:', walletProvider);
            break; // Exit the loop if the provider is found
          } else {
            console.log(`Provider not found, retrying (${attempts + 1}/${maxRetries})...`);
          }
        } catch (error) {
          console.error('Error getting wallet provider:', error);
          // Optionally, you can decide to break the loop here if the error is critical
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
      }

      return walletProvider;
    },
    async checkIfWalletIsConnected() {
      // Attempt to get the wallet provider with retries
      this.walletProvider = await this.getWalletProviderWithRetry();

      if (this.walletProvider) {
        // Create a new Web3Provider instance using ethers
        const provider = new ethers.providers.Web3Provider(this.walletProvider);

        try {
          // List all accounts connected to the provider
          const accounts = await provider.listAccounts();
          const lowercaseAccounts = accounts.map(account => account.toLowerCase());

          if (lowercaseAccounts.length > 0) {
            console.log('Wallet is connected:', lowercaseAccounts);
            this.isWalletConnected = true;
            this.connectedAccount = lowercaseAccounts[0];
            global.connectedAccount = lowercaseAccounts[0];

            // Check if the 'logged-in' cookie is present
            const loggedInCookie = this.getCookie('logged-in:' + lowercaseAccounts[0]);
            console.log("cookie is", loggedInCookie)
            if (!loggedInCookie) {
              console.log("let's sign cookie")
              await this.sign_login(); // Call the sign_login method if cookie is not found
            }
          } else {
            console.log('Wallet is not connected');
            this.isWalletConnected = false;
            this.connectedAccount = '';
            global.connectedAccount = '';
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
          this.isWalletConnected = false;
          this.connectedAccount = '';
          global.connectedAccount = '';
        }
      } else {
        console.log('Unable to find wallet provider after 3 retries.');
        this.isWalletConnected = false;
        this.connectedAccount = '';
        global.connectedAccount = '';
        // Additional handling if needed
      }
    },
  },
  components: {
    Panel
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
      window.ethereum.on('connect', (accounts) => {
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