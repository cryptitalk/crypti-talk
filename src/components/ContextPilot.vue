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
                    <div v-if="loading" class="loading">
                        <img src="https://storage.googleapis.com/cryptitalk/loading.gif" alt="Loading...">
                    </div>
                    <!-- Display content when not loading -->
                    <div v-else v-html="displayContentAsHTML">
                        <!-- `displayContentAsHTML` will safely render HTML content -->
                    </div>
                </div>

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
export default {
    name: 'ContextPilot',
    data() {
        return {
            inputContent: '',
            displayContent: '',
            maxSessionLength: 10,
            chatSession: [],
            loading: false,
        };
    },
    mixins: [authMixin],
    computed: {
        displayContentAsHTML() {
            // Return the display content as HTML
            return this.displayContent.replace(/\n/g, '<br />');
        },
    },
    methods: {
        closeModal() {
            // Close the modal when the user clicks outside the modal or the close button
            this.$emit("close");
        },
        async handleSubmitInput() {
            let tempContext = this.$store.getters.selectedItemsIdDescString

            if (this.chatSession.length == 0) {
                this.chatSession.push({
                    role: "system",
                    content: "I am a crypto analyst."
                });
            }
            while (this.chatSession.length >= this.maxSessionLength) {
                if (this.chatSession.length === this.maxSessionLength && this.chatSession[1].role === "user") {
                    this.chatSession.splice(1, 2);
                } else {
                    this.chatSession.splice(1, 1);
                }
            }
            const prompt = tempContext + '\\n' + this.inputContent;
            this.chatSession.push({
                role: "user",
                content: prompt
            });
            this.loading = true;
            const requestData = {
                context: true,
                message: this.chatSession
            };
            axios.post('/useraction', requestData, this.getAuthConfig()).then(response => {
                const resp = response.data;
                this.chatSession.push({
                    role: "system",
                    content: resp
                });
                // once done send ack
                const ackData = {
                    ack: true,
                    message: this.chatSession
                };
                axios.post('/useraction', ackData, this.getAuthConfig()).then(response => {
                    this.displayContent = resp;
                    this.loading = false;
                    this.$store.dispatch('clearSelectedItems5'); // clear context
                }).catch(error => {
                    console.error('Error ack', error);
                    alert('Failed to use context pilot. Please try again.');
                    this.loading = false;
                });
            }).catch(error => {
                console.error('Error chatting', error);
                alert('Failed to use context pilot. Please try again.');
                this.loading = false;
            });
        },
        handleSubmit() {
            this.handleSubmitInput();
        },
        showContext() {
            this.displayContent = this.$store.getters.selectedItemsIdDescString;
        },
        clearContext() {
            this.$store.dispatch('clearSelectedItems5');
            this.displayContent = 'context cleared';
        },
        showSession() {
            this.displayContent = this.chatSession.map(item => item.content).join('\n');
        },
        clearSession() {
            this.chatSession = [];
            this.displayContent = 'session cleared';
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
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 700px;
    height: 50vh;
    /* Set the height to 50% of the viewport height */
    overflow-y: auto;
    /* Ensure that content can scroll if it's taller than the panel */
    padding: 10px;
    margin-bottom: 20px;
    /* Distance between display panel and input field */
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