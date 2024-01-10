<template>
    <div class="like-button" @click.stop="toggleLike">
        <img v-if="isLiked" src="../assets/liked.png" alt="like">
        <img v-else src="../assets/like.png" alt="like">
        <span>{{ likeCount }}</span>
    </div>
</template>
  
<script>
import axios from 'axios'; // Ensure axios is imported if you're using it for HTTP requests
import { authMixin } from '../common/authMixin.js'

export default {
    props: {
        item: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            isLiked: this.item.isLiked,
            likeCount: this.item.like,
        };
    },
    mixins: [authMixin],
    methods: {
        toggleLike() {
            this.isLiked = !this.isLiked;
            this.likeCount = this.isLiked ? this.likeCount + 1 : this.likeCount - 1;
            this.item.isLiked = this.isLiked
            this.item.like = this.likeCount
            console.log(this.item)
            // Update the like status in the backend
            this.sendLikeDataToBackend();
        },
        sendLikeDataToBackend() {
            // Implement the logic to send like data to the backend
            axios.post('/useraction', {
                itemId: this.item.id,
                isLiked: this.isLiked
            }, this.getAuthConfig()).then(response => {
                // Handle successful response
                console.log('Like data updated on backend', response);
            }).catch(error => {
                // Handle error
                console.error('Error updating like data', error);
                // Optionally revert the like status in case of error
                this.isLiked = !this.isLiked;
                this.likeCount = this.isLiked ? this.likeCount + 1 : this.likeCount - 1;
            });
        },
    },
};
</script>
  
<style scoped>
.like-button {
    line-height: 0.63rem;
    display: flex;
    color: #999999;
    flex-direction: row;
}

.like-button img {
    margin-top: 0.13rem;
    margin-right: 0.11rem;
    width: 0.37rem;
    height: 0.37rem;
}
</style>
