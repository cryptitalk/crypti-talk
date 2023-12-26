<template>
    <div class="comment-modal">
        <textarea v-model="newComment" placeholder="Enter your comment"></textarea>
        <button @click="submitComment">Submit</button>
        <button @click="$emit('close')">Cancel</button>
    </div>
</template>
  
<script>
import axios from 'axios'; // Make sure Axios is imported

export default {
    data() {
        return {
            newComment: '',
        };
    },
    methods: {
        submitComment() {
            this.$emit('submit', this.newComment, -1); // -1 means it's a top-level comment
            this.newComment = ''; // Reset the comment
        }
    }
};
</script>
  
<style scoped>
.comment-modal {
  /* Basic positioning and layout */
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #f8f8f8; /* Light background for a modern look */
  padding: 30px;
  border: 1px solid #ccc; /* Subtle border */
  z-index: 1000;
  border-radius: 10px; /* Slightly rounded corners for a softer look */
  box-shadow: 0 5px 15px rgba(0,0,0,0.1); /* Soft drop shadow for depth */
  width: 90%; /* Responsive width */
  max-width: 400px; /* Maximum width */
}

.comment-modal textarea {
  width: 100%;
  height: 100px; /* Fixed height for the textarea */
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px; /* Softly rounded corners */
  padding: 10px;
  font-size: 0.35rem; /* Comfortable font size */
  color: #333; /* Darker text for better readability */
  background-color: #fff; /* White background for the textarea */
  resize: none; /* Disabling resizing */
}

.comment-modal button {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  font-size: 0.35rem;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.comment-modal button.submit {
  background-color: #4CAF50; /* Green background for submit */
  color: white;
}

.comment-modal button.cancel {
  background-color: transparent;
  color: #333;
  margin-left: 10px;
}

.comment-modal button:hover {
  background-color: #333;
  color: white;
}

/* Responsive design for smaller screens */
@media (max-width: 600px) {
  .comment-modal {
    width: 95%;
    padding: 20px;
  }
}
</style>