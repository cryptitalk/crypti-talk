<template>
    <div class="context-pilot">
        <div class="modal-background" @click="closeModal"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Context Pilot</h2>
                <button @click="closeModal">X</button>
            </div>
            <div class="modal-body">
                <!-- Row 1: Display panel -->
                <div class="row display-panel">
                    <!-- Loading indicator -->
                    <div class="display-panel-content">
                        <div v-if="loading" class="loading">
                            <img src="https://storage.googleapis.com/cryptitalk/loading.gif" alt="Loading...">
                        </div>
                        <!-- Display content when not loading -->
                        <div v-else v-html="displayContentAsHTML">
                            <!-- `displayContentAsHTML` will safely render HTML content -->
                        </div>
                    </div>
                    <div class="navigation-controls" v-if="inShowSessionMode">
                        <button @click="goToPreviousPage">&lt; Previous</button>
                        <button @click="mintToken">Mint</button>
                        <button @click="goToNextPage">Next &gt;</button>
                    </div>
                </div>
                <!-- Include WalletModal component -->
                <wallet-modal ref="walletModal"></wallet-modal>
                <!-- Row 2: Text input -->
                <div class="row text-input">
                    <input type="text" v-model="inputContent" />
                </div>

                <!-- Row 3: Buttons -->
                <div class="row buttons-row">
                    <button @click="handleSubmit">Submit</button>
                    <button @click="showContext">Show Context</button>
                    <button @click="clearContext">Clear Context</button>
                    <button @click="showSession">Show Session</button>
                    <button @click="clearSession">Clear Session</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { authMixin } from '../common/authMixin.js'
import axios from 'axios';
import { marked } from 'marked';
import WalletModal from './wallet.vue';
import entropyAbi from '../abi/EntropyToken.json';
import { ethers } from 'ethers';
export default {
    name: 'ContextPilot',
    data() {
        return {
            isModalOpen: true,
            inputContent: '',
            displayContent: '',
            maxSessionLength: 20,
            chatSession: [],
            loading: false,
            lastcall: "NONE",
            currentPage: 1,
            pageSize: 1,
            totalPages: 1,
            inShowSessionMode: false,
            contractAddress: '0xF3B7eaac00221A17c6aCE3D6E1A8434a36aa015b',
        };
    },
    components: {
        'wallet-modal': WalletModal
    },
    mixins: [authMixin],
    computed: {
        displayContentAsHTML() {
            // Convert markdown to HTML and replace newlines with <br>
            return this.convertMarkdownToHtml(this.displayContent);
        },
        startIndex() {
            return (this.currentPage - 1) * this.pageSize;
        },
        endIndex() {
            return this.currentPage * this.pageSize;
        },
        currentSessionPage() {
            // Return only the rounds for the current page
            return this.chatSession.slice(this.startIndex, this.endIndex);
        },
    },
    created() {
        this.loadSession();
    },
    watch: {
        isModalOpen(newVal) {
            if (newVal) {
                this.loadSession();
            }
        },
        currentPage() {
            this.showSession(); // Update display whenever the current page changes
        },
    },
    methods: {
        closeModal() {
            // Close the modal when the user clicks outside the modal or the close button
            this.inShowSessionMode = false;
            this.isModalOpen = false;
            this.$emit("close");
        },
        convertMarkdownToHtml(markdownText) {
            // Use marked to convert markdown to HTML
            return marked(markdownText);
        },
        async mintToken() {
            // Check if the wallet is connected; if not, the wallet modal should manage the connection process
            if (!this.isWalletConnected) {
                // This will trigger the wallet connection process
                await this.$refs.walletModal.checkIfWalletIsConnected();
            }

            // After ensuring the wallet connection, get the signer from the walletProvider
            const walletProvider = this.$refs.walletModal.walletProvider;
            if (walletProvider) {
                const provider = new ethers.providers.Web3Provider(walletProvider);
                const signer = provider.getSigner();
                // TODO: infer the contract address based on chain info, if not defined ask to switch to correct network
                const contract = new ethers.Contract(this.contractAddress, entropyAbi, signer);
                const uri = await this.getTokenUri();
                try {
                    let tx = await contract.saveSession(signer.getAddress(), uri);
                    let receipt = await tx.wait();
                    console.log('Transaction receipt:', receipt);
                } catch (error) {
                    console.error('Error minting token:', error);
                    alert('Failed to mint token. Please try again.');
                }
            }
        },
        extractSessionId(url) {
            const regex = /stream_data\/([0-9a-fA-F-]+)\.json/;
            const match = url.match(regex);
            return match ? match[1] : null; // Returns the session_id or null if not found
        },
        async getTokenUri() {
            let message = this.constructBodyFunc(this.chatSession);
            let respose = await this.postDataToAPI('greenfield', { 'Content-Type': 'application/json' }, message);
            let session_id = this.extractSessionId(respose.data.uri);
            message.session_id = session_id;
            this.postDataToAPI('dalle', { 'Content-Type': 'application/json' }, message);
            return respose.data.uri;
        },
        async sendAck() {
            if (this.isModalOpen) {
                const ackData = {
                    ack: true,
                    message: this.chatSession
                };
                axios.post('/useraction', ackData, this.getAuthConfig()).then(response => {
                    this.loading = false;
                    this.$store.dispatch('clearSelectedItems5'); // clear context
                }).catch(error => {
                    console.error('Error ack', error);
                    alert('Failed to use context pilot. Please try again.');
                    this.loading = false;
                });
            }
        },
        constructBodyFunc(chatSessionGPT) {
            let funcs = this.$store.getters.selectedItemsIdFunc.split(',');
            if (funcs.length > 0 && funcs[0] !== "") {
                return {
                    model: "gpt",
                    function_id: funcs,
                    message: chatSessionGPT
                }
            }
            // chat only
            return {
                model: "gpt",
                message: chatSessionGPT
            }
        },
        async postDataToAPI(apiEndpoint, headers, body) {
            const messageJsonString = JSON.stringify(body);
            return axios.post(apiEndpoint, { message_json: messageJsonString }, {
                headers: headers
            });
        },
        async initEventStream() {
            const message = this.constructBodyFunc(this.chatSession);
            let respose = await this.postDataToAPI('streaminit', { 'Content-Type': 'application/json' }, message);
            let res = ''

            // Initialize the EventSource with the encoded JSON in the URL query parameter
            let eventSource = new EventSource(`${global.streamurl}?session_id=${respose.data.session_id}`);
            // Use an arrow function so `this` is correctly bound to the Vue instance
            eventSource.onmessage = (event) => {
                this.loading = false;
                var messageData = JSON.parse(event.data);
                if (messageData.text === "calling AI to get function parameters...." || (messageData.text && messageData.text.includes("calling function"))) {
                    console.log("calling function", messageData.text)
                    res = messageData.text + '\n';
                    this.lastcall = "FUNCTION"
                } else {
                    if (this.lastcall === "FUNCTION") {
                        res = messageData.text;
                        this.lastcall = "NONE"
                    } else {
                        res += messageData.text;
                    }
                }
                this.displayContent = res;
                if (messageData.finish_reason) {
                    eventSource.close();
                    this.addToChatSession({
                        role: "system",
                        content: this.displayContent
                    });
                    // once done send ack, only if modal is open
                    this.sendAck();
                }
            };

            // The error handler should also be an arrow function
            eventSource.onerror = (event) => {
                console.error('EventSource failed:', event);
                eventSource.close();
                this.loading = false;
            };
        },
        async handleSubmitInput() {
            let tempContext = this.$store.getters.selectedItemsIdDescString

            if (this.chatSession.length == 0) {
                this.addToChatSession({
                    role: "system",
                    content: "I am a crypto analyst."
                });
            }

            const prompt = tempContext + '\\n' + this.inputContent;
            this.addToChatSession({
                role: "user",
                content: prompt
            });
            this.loading = true;

            try {
                await this.initEventStream();
            } catch (error) {
                console.error('Error starting chat session stream', error);
                alert('Failed to use streaming chat. Please try again.');
                this.loading = false;
            }
        },
        handleSubmit() {
            this.inShowSessionMode = false;
            this.handleSubmitInput();
        },
        showContext() {
            this.inShowSessionMode = false;
            this.displayContent = this.$store.getters.selectedItemsIdFuncString;
        },
        clearContext() {
            this.inShowSessionMode = false;
            this.$store.dispatch('clearSelectedItems5');
            this.displayContent = 'context cleared';
        },
        showSession() {
            this.displayContent = this.currentSessionPage.map(item => item.role + ": \\n" + item.content).join('\\\\n');
            this.inShowSessionMode = true;
        },
        saveSession() {
            localStorage.setItem('chatSession', JSON.stringify(this.chatSession));
            this.totalPages = Math.ceil(this.chatSession.length / this.pageSize);
        },
        loadSession() {
            const savedSession = localStorage.getItem('chatSession');
            if (savedSession) {
                this.chatSession = JSON.parse(savedSession);
                this.totalPages = Math.ceil(this.chatSession.length / this.pageSize);
            }
        },
        addToChatSession(message) {
            this.chatSession.push(message);
            while (this.chatSession.length >= this.maxSessionLength) {
                if (this.chatSession.length === this.maxSessionLength && this.chatSession[1].role === "user") {
                    this.chatSession.splice(1, 2);
                } else {
                    this.chatSession.splice(1, 1);
                }
            }

            this.saveSession(); // Persist the updated session
        },
        clearSession() {
            this.chatSession = [];
            this.displayContent = 'session cleared';
            this.saveSession(); // Clear the saved session as well
            this.inShowSessionMode = false;
        },
        goToPreviousPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        goToNextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },
    },
};
</script>
  
<style scoped>
/* Main container styling */
.context-pilot {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    /* Semi-transparent background overlay */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}


.modal-content {
    background-color: #ffffff;
    /* White background for the modal */
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 700px;
}

.modal-header {
    background-color: #1da1f2;
    /* Twitter's blue color for the header background */
    color: #ffffff;
    /* White text color for the header */
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
}

.modal-header h2 {
    margin: 0;
}

.modal-header button {
    background: none;
    border: none;
    font-size: 1.2em;
    cursor: pointer;
    color: #ffffff;
}

.modal-body {
    padding: 20px;
}

.row {
    margin: 10px;
}

.loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    /* or a fixed height if you prefer */
}

.loading img {
    max-width: 50px;
    /* Adjust the value as needed */
    max-height: 50px;
    /* Adjust the value as needed */
    display: block;
    /* This will allow the use of margin auto for centering */
    margin: auto;
    /* Centers the image horizontally if the parent is flex */
}

/* Styling for the display panel where content is shown */
.display-panel {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    /* Add this line */
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 700px;
    height: 50vh;
    overflow-y: auto;
    padding: 10px;
    margin-bottom: 20px;
}

.display-panel-content {
    flex-grow: 1;
    overflow-y: auto;
}

.navigation-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    /* Adjusted padding */
}

.navigation-controls button {
    margin: 0 5px;
    /* Add some space between buttons */
}

/* Styling for the text input field */
.text-input input[type="text"] {
    width: calc(100% - 20px);
    /* Account for padding */
    border: 1px solid #ccc;
    padding: 8px;
    border-radius: 5px;
    font-size: 14px;
    box-sizing: border-box;
    /* Include padding and border in element's width */
}

/* Styling for the buttons row */
.buttons-row {
    text-align: center;
    /* Center buttons when they wrap */
}

/* Styling for each button */
.buttons-row button {
    padding: 8px 20px;
    margin: 0 5px;
    /* Consistent margin for all sides */
    background-color: #1da1f2;
    /* Twitter's blue color for buttons */
    color: #ffffff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;
}

/* Hover effect for buttons */
.buttons-row button:hover {
    background-color: #0d8acf;
    /* Slightly darker blue on hover */
    color: #e8f5fd;
    /* Lighter text color on hover */
}

/* Alternatively, you might want to have different hover effects for different buttons */
.buttons-row button.submit:hover {
    background-color: #0d8acf;
    /* Different color for the Submit button hover */
}

.buttons-row button.clear:hover {
    background-color: #f1f1f1;
    /* Different color for the Clear Context and Clear Session button hover */
    color: #1da1f2;
    /* Change text color to blue for contrast */
}

/* You can add a similar :hover pseudo-class for .show-context if you added that class earlier */
.buttons-row .show-context:hover {
    background-color: #17a2b8;
    /* Different color for the Show Context button hover */
}


/* Media query for smaller screens */
@media screen and (max-width: 768px) {

    /* Ensure display panel and buttons use the full width available */
    .display-panel,
    .text-input input[type="text"],
    .buttons-row button {
        width: 100%;
        max-width: none;
    }

    /* Additional padding for smaller screens for readability */
    .display-panel {
        padding: 10px;
    }

    /* Center the input relative to the screen on smaller devices */
    .text-input {
        display: flex;
        justify-content: center;
        padding: 0;
    }

    .text-input input[type="text"] {
        margin: 0;
        /* Reset margins on smaller screens for input */
    }
}
</style>