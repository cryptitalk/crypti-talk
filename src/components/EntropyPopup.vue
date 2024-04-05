<template>
    <div class="entropy-popup" v-if="visible">
        <div class="popup-content">
            <h3>Entropy Details:</h3>
            <p>Your Entropy Token Balance: <strong>{{ tokenBalance }}</strong></p>
            <a :href="uniswapUrl" target="_blank">Trade on Uniswap</a>
        </div>
        <button @click="closePopup">Close</button>
        <wallet-modal ref="walletModal"></wallet-modal>
    </div>
</template>

<script>
import WalletModal from './wallet.vue';

export default {
    props: {
        visible: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            tokenBalance: 0 // Default token balance before fetching
        };
    },
    computed: {
        uniswapUrl() {
            return `https://app.uniswap.org/explore/tokens/polygon/0xa464a1c3486a1af3111e6058cc7b302771c2a9de`;
        }
    },
    methods: {
        closePopup() {
            this.$emit('close');
        },
    },
    components: {
        WalletModal
    },
    watch: {
        async visible(newValue) {
            if (newValue) {
                // Wait for the next tick to ensure the WalletModal component has been mounted
                await this.$nextTick();

                // Verify the WalletModal component is available to call the method
                if (this.$refs.walletModal) {
                    try {
                        // Await the result of the async method fetchTokenBalance
                        const balance = await this.$refs.walletModal.fetchTokenBalance();
                        // Update tokenBalance if fetchTokenBalance was successful
                        this.tokenBalance = balance;
                    } catch (error) {
                        // Handle any errors that occur during the fetchTokenBalance call
                        console.error('Failed to fetch token balance:', error);
                        // Optionally set a default balance or show an error message
                        this.tokenBalance = 'Error fetching balance';
                    }
                }
            }
        }
    },
}
</script>

<style scoped>
.entropy-popup {
    /* Your styles for the popup */
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    z-index: 1000; /* Make sure it's above other content */
}

.popup-content {
    margin-bottom: 20px;
}
</style>
