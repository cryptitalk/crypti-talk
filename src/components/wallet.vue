<!-- WalletModal.vue -->
<template></template>
  
<script>
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5';
import { ethers } from 'ethers';

// ... Include the rest of the modal-related code here ...
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
            // ... data properties related to the modal ...
        };
    },
    methods: {
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
        getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
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
        checkIfMobileDevice() {
            return /Mobi|Android/i.test(navigator.userAgent);
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
    },
    // ... Include methods, computed properties, etc., related to the modal ...
};
</script>