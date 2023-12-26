<template>
    <div>
        <div class="comment" v-for="(comment, index) in comments" :key="comment.id" :style="{ paddingLeft: (depth * 20) + 'px' }">
            <div class="comment_user">
                <img :src="comment.Avatar" alt="User avatar" class="user_avatar">
                <span class="user_name">{{ comment.UserName }}</span>
            </div>
            <div class="comment_text">{{ comment.Content }}</div>
            <button @click="showReplyForm(comment, index)">Reply</button>
            <div v-if="comment.showForm">
                <textarea v-model="comment.newReplyContent"></textarea>
                <button @click="submitReply(comment, comment.CommentID)">Submit Reply</button>
            </div>
            <!-- Recursively call CommentsContainer for nested replies -->
            <comments-container v-if="comment.Replies && comment.Replies.length" :comments="comment.Replies" :depth="depth + 1" @submitReply="submitReply" />
        </div>
    </div>
</template>

<script>
export default {
    name: 'CommentsContainer',
    props: {
        comments: {
            type: Array,
            required: true
        },
        depth: {
            type: Number,
            default: 0 // Top level comments have a depth of 0 by default
        }
    },
    methods: {
        showReplyForm(comment, index) {
            this.$set(comment, 'showForm', true);
        },
        submitReply(comment, commentID) {
            this.$emit('submitReply', comment, commentID);
        }
    },
    // Register the component itself recursively
    components: {
        'comments-container': () => import('./CommentsContainer.vue')
    }
};
</script>
  
<style>
.comment {
  border-bottom: 1px solid #e6e6e6;
  padding: 10px 0;
}

.comment_user {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.user_avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.user_name {
  font-weight: bold;
}

.comment_text {
  font-size: 0.35rem;
}
</style>