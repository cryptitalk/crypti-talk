<template>
    <div class="post-modal">
        <div class="modal-background" @click="closeModal"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Post</h2>
                <button @click="closeModal">X</button>
            </div>
            <div class="modal-body">
                <!-- Post Picture Upload -->
                <div class="post-picture">
                    <img :src="postPicture" alt="Post Picture" />
                    <input type="file" @change="handlePostPictureChange" accept="image/*" />
                </div>

                <div class="content">
                    <label for="bio">Content:</label>
                    <textarea id="content" v-model="newContent"></textarea>
                </div>

                <div class="modal-footer">
                    <button @click="saveChanges">Save</button>
                    <button @click="closeModal">Cancel</button>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script>
import { authMixin } from '../common/authMixin.js'
import { EventBus } from '../common/eventBus.js';

export default {
    data() {
        return {
            postPicture: "",
            newContent: "my post",
            sevenLetterString: "",
        };
    },
    mixins: [authMixin],
    methods: {
        closeModal() {
            // Close the modal when the user clicks outside the modal or the close button
            this.$emit("close");
        },
        handlePostPictureChange(event) {
            const file = event.target.files[0];
            console.log("post image changed")
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    const formData = new FormData();
                    formData.append('file', file);
                    axios.post('/upload', formData, this.getAuthConfig())
                        .then(response => {
                            console.log("response", response)
                            this.postPicture = response.data.pfp; // url from GCS
                            const parts = this.postPicture.split('/');
                            const secondToLastPart = parts[parts.length - 1];
                            this.sevenLetterString = secondToLastPart.slice(0, 7);
                        })
                        .catch(error => {
                            console.error(error);
                        });
                };
                reader.readAsDataURL(file);
            }
        },
        saveChanges() {
            if (this.postPicture === "") {
                alert("Please upload a post picture.");
                return;
            }
            const currentDate = new Date();
            const currentFormattedTime = currentDate.toISOString().replace("T", " ").split(".")[0];
            const text = {
                "id": this.sevenLetterString,
                "img": this.postPicture,
                "type": "post",
                "tokenReward": "none",
                "desc": this.newContent,
                "comment": 0,
                "like": 0,
                "collect": 20,
                "uname": global.userName,
                "avator": global.userImg,
                "price": "",
                "adress": "",
                "time": currentFormattedTime,
                "imgs": [this.postPicture],
                "comments": [],
                'alias': global.userName,
                "status": "Active",
                'isVerified': "True",
                'links': "",
                'backers': "",
                'categories': "",
                'token': ""
            }
            const postData = {
                tgid: "",
                message: {
                    text: JSON.stringify(text),
                    address: global.connectedAccount
                }
            };
            console.log("profile data", postData)
            axios.post('/vec', postData, this.getAuthConfig()).then(response => {
                console.log('Post data updated on backend', response.data);
                if (response.data.post_mapping === 'ok') {
                    this.closeModal();
                } else {
                    alert('Failed to post profile. Please try again.');
                }
            }).catch(error => {
                console.error('Error updating profile data', error);
                alert('Failed to post profile. Please try again.');
            });
            
        },
    },
};
</script>
  
<style scoped>
/* Add your CSS styles here to match Twitter's design */
.post-modal {
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
    /* Ensure it's above other content */
}

.modal-content {
    background-color: #ffffff;
    /* White background for the modal */
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    width: 80%;
    max-width: 400px;
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

.post-picture img {
    max-width: 300px;
    max-height: 300px;
    display: block;
    margin: 0 auto;
}

.post-picture input[type="file"] {
    margin-top: 10px;
}

.content textarea {
    width: 100%;
    height: 100px;
    resize: vertical;
    border: 1px solid #ccc;
    padding: 8px;
    border-radius: 5px;
    font-size: 14px;
}

.modal-footer {
    text-align: right;
    margin-top: 20px;
}

.modal-footer button {
    padding: 8px 20px;
    margin-left: 10px;
    background-color: #1da1f2;
    /* Twitter's blue color for buttons */
    color: #ffffff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.modal-footer button:last-child {
    background-color: #e1e8ed;
    /* Twitter's cancel button background color */
    color: #333333;
}

@media screen and (max-width: 768px) {
    .modal-content {
        width: 100%;
        /* Make the modal full width on mobile */
        max-width: none;
        /* Remove the maximum width */
        border-radius: 0;
        /* Remove border-radius for full-width effect */
    }
}
</style>