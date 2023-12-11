<template>
    <div class="edit-profile-modal">
        <div class="modal-background" @click="closeModal"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Profile</h2>
                <button @click="closeModal">X</button>
            </div>
            <div class="modal-body">
                <!-- Profile Picture Upload -->
                <div class="profile-picture">
                    <img :src="profilePicture" alt="Profile Picture" />
                    <input type="file" @change="handleProfilePictureChange" accept="image/*" />
                </div>

                <!-- Bio -->
                <div class="bio">
                    <label for="bio">Bio:</label>
                    <textarea id="bio" v-model="newBio"></textarea>
                </div>

                <!-- Save and Cancel buttons -->
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
            profilePicture: global.userImg,
            newBio: global.userBio,
        };
    },
    mixins: [authMixin],
    methods: {
        closeModal() {
            // Close the modal when the user clicks outside the modal or the close button
            this.$emit("close");
        },
        handleProfilePictureChange(event) {
            const file = event.target.files[0];
            console.log("pfp changed")
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    const formData = new FormData();
                    formData.append('file', file);
                    axios.post('/upload', formData, this.getAuthConfig())
                        .then(response => {
                            console.log("response", response)
                            this.profilePicture = response.data.pfp; // url from GCS
                        })
                        .catch(error => {
                            console.error(error);
                        });
                };
                reader.readAsDataURL(file);
            }
        },
        saveChanges() {
            const profileData = { pfp: this.profilePicture, bio: this.newBio, updateUser: true };
            console.log("profile data", profileData)
            axios.post('/useraction', profileData, this.getAuthConfig()).then(response => {
                global.userImg = this.profilePicture
                global.userBio = this.newBio
                EventBus.$emit('userImgChanged', this.profilePicture);
            }).catch(error => {
                console.error('Error updating profile data', error);
                alert('Failed to post profile. Please try again.');
            });
            this.$emit("save-changes", {
                profilePicture: this.profilePicture,
                newBio: this.newBio,
            });
            this.closeModal();
        },
    },
};
</script>
  
<style scoped>
/* Add your CSS styles here to match Twitter's design */
.edit-profile-modal {
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

.profile-picture img {
    max-width: 100px;
    max-height: 100px;
    border-radius: 50%;
    display: block;
    margin: 0 auto;
}

.profile-picture input[type="file"] {
    margin-top: 10px;
}

.bio textarea {
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
        width: 100%; /* Make the modal full width on mobile */
        max-width: none; /* Remove the maximum width */
        border-radius: 0; /* Remove border-radius for full-width effect */
    }
}
</style>