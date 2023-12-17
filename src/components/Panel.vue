<template>
    <div class="panel">
        <div class="header">
            <div class="user-image">
                <img :src="userImage" alt="user image">
            </div>
        </div>
        <div class="user-name">{{ userName }}</div>

        <div class="content">
            <div class="con_item" @click="handleEntropyClick">
                <div class="img">
                    <img src="../assets/icon1.png" alt="look">
                </div>
                <div class="text">
                    <span>ENTROPY</span>
                </div>
            </div>

            <div class="con_item" @click="showPostModal">
                <div class="img">
                    <img src="../assets/icon3.png" alt="post">
                </div>
                <div class="text">
                    <span>Add Post</span>
                </div>
            </div>

            <div class="con_item" @click="showFollowModal">
                <div class="img">
                    <img src="../assets/transmit.png" alt="Follow">
                </div>
                <div class="text">
                    <span>Follow</span>
                </div>
            </div>

            <div class="con_item" @click="showEditProfileModal">
                <div class="img">
                    <img src="../assets/icon9.png" alt="edit profile">
                </div>
                <div class="text">
                    <span>Edit Profile</span>
                </div>
            </div>

            <!-- About Link -->
            <div class="con_item">
                <a href="https://linktr.ee/cryptitalk" target="_blank" class="about-link">
                    <div class="text">LinkTree</div>
                </a>
            </div>

            <!-- Edit Profile Modal -->
            <EditProfileModal v-if="isEditProfileModalVisible" @close="hideEditProfileModal"
                @save-changes="handleSaveProfileChanges"></EditProfileModal>
            <FollowModal v-if="isFollowModalVisible" @close="hideFollowModal"
                @save-changes="handleSaveProfileChanges"></FollowModal>
            <PostModal v-if="isPostModalVisible" @close="hidePostModal"
                @save-changes="handleSaveProfileChanges"></PostModal>
        </div>
    </div>
</template>
<script>
import { EventBus } from '../common/eventBus.js';
import EditProfileModal from "./EditProfileModal.vue";
import FollowModal from "./FollowModal.vue";
import PostModal from "./PostModal.vue";

export default {
    data() {
        return {
            user: [],
            userImage: global.userImg,
            userName: global.userName,
            isEditProfileModalVisible: false,
            isFollowModalVisible: false,
            isPostModalVisible: false,
        }
    },
    components: {
        EditProfileModal,
        FollowModal,
        PostModal,
    },
    mounted() {
        this.fetchUserData();
        EventBus.$on('userImgChanged', (newImageURL) => {
            this.userImage = newImageURL;
        });
        EventBus.$on('userNameChanged', (newUserName) => {
            this.userName = newUserName;
        });
    },
    methods: {
        async handleEntropyClick() {
            await this.fetchUserData();
            let message = "user: " + global.connectedAccount + "\n"
            message += "browsing point: " + this.user.browsing + "\n"
            message += "search point: " + this.user.search + "\n"
            message += "like point: " + this.user.like + "\n"
            message += "comment point: " + this.user.comment + "\n"
            message += "followers point: " + this.user.followers + "\n"
            message += "following point: " + this.user.following + "\n"
            this.showToast(message);
        },
        showToast(message) {
            alert(message);
        },
        async fetchUserData() {
            try {
                console.log("come here to load user info")
                if (global.connectedAccount != '') {
                    const response = await axios.get(`/validuser/${global.connectedAccount}`);
                    this.user = response.data;
                } else {
                    this.user = []
                }
            } catch (error) {
                console.error('There was an error fetching the user data:', error);
            }
        },
        showEditProfileModal() {
            this.isEditProfileModalVisible = true;
        },
        showFollowModal() {
            this.isFollowModalVisible = true;
        },
        showPostModal() {
            this.isPostModalVisible = true;
        },
        hideEditProfileModal() {
            this.isEditProfileModalVisible = false;
        },
        hideFollowModal() {
            this.isFollowModalVisible = false;
        },
        hidePostModal() {
            this.isPostModalVisible = false;
        },
        handleSaveProfileChanges(profileData) {
            // Handle saving changes to the user's profile here
            // This method will be called when the "Save" button is clicked in the modal
            // You can update the user's data in your application state or make an API request
            console.log("Profile Data:", profileData);
        },
    }
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
.panel {
    width: 100%;
    height: 100%;
    background: white;
    border-radius: 15px
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2)
    //padding: 20px
    display: flex
    flex-direction: column
    align-items: center
}

.header {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    margin-top: 50px;
    text-align: center;
}

.user-image {
    /* Add styling for the user image container */
    //margin-bottom: 10px;
}

.user-image img {
    /* Apply styling to the user image */
    width: 100px;
    height: 100px;
    border-radius: 50%;
}

.user-name {
    /* Apply styling to the user name */
    font-size: 18px;
    font-weight: bold;
}

.content {
    width: 80%;
    padding: 30px;
    cursor: pointer; /* Cursor changes to pointer when mouse hovers over content */
}

.content .con_item {
    height: 25px;
    line-height: 25px;
    font-size: 16px;
    margin-bottom: 30px;
    display: flex;
    justify-content: center; 
    align-items: center
    border-radius: 10px /* Rounded corners for items */
    padding: 5px 15px
    background-color: rgba(0, 0, 0, 0.05) // Darker semi-transparent background
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1) // Subtle shadow for depth
    transition: all 0.3s ease // Transition for hover effects
}

.content .con_item:hover {
    background-color: rgba(255, 255, 255, 0.5) /* Change background on hover */
    transform: scale(1.05) /* Slightly enlarge on hover */
}

.content .con_item .img {
    margin-right: 15px;
}
    
.content .con_item .img img {
    width: 25px;
    height: 25px;
}

.content .con_item .text {
    height: 25px;
    line-height: 25px;
}

.about-link {
    text-decoration: none; // Removes the underline from the link
    color: inherit; // Inherits the color from the parent element
    display: flex; // To align the text properly
    justify-content: center; /* Centers content horizontally in a flex container */
    align-items: center; /* Centers content vertically in a flex container */
    width: 100%; 
}

.about-link .text {
    height: 25px;
    line-height: 25px;
    text-align: center; /* Centers text horizontally */
}
</style>

