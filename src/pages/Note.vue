<template>
  <transition name="move">
    <div class="note_page" ref="noteWrapper">
      <div class="noteContainer">
        <div class="note_con">
          <div class="note_pic">
            <swiper :options="swiperOption" class="swiper-box">
              <swiper-slide class="swiper-item" v-for="(img, index) in note.imgs" :key="index">
                <img v-lazy="img" alt="">
              </swiper-slide>
              <div class="swiper-pagination" slot="pagination"></div>
            </swiper>
          </div>
          <div class="note_icon">
            <div class="n_left" @click="hideNote">
              <img src="../assets/left-arrow.png" alt="">
            </div>
            <div class="n_right">
              <img src="../assets/option.png" alt="">
            </div>
          </div>
        </div>
        <div class="note_header">
          <div class="n_user">
            <img :src="note.avator" class="user_avatar" alt="" @click="navigateTo(note.userid)">
            <div>{{ note.uname }}</div>
          </div>
          <div class="btn">
            <button class="follow-btn" @click="followUser">{{ followButtonText }}</button>
            <button @click="showCommentBox = true">＋comment</button>
          </div>
          <comment-modal v-if="showCommentBox" @submit="handleCommentSubmit" @close="showCommentBox = false" />
        </div>
        <!-- <div class="n_desc"> -->
        <div class="n_desc" v-html="linkedDescription"></div>
        <a :href="note.alias ? `https://galxe.com/${note.alias}` : 'https://galxe.com/'" target="_blank"
          rel="noopener noreferrer" class="common-style">
          Galxe
        </a>
        <div v-if="parsedLinks">
          <a v-for="(url, name) in parsedLinks" :key="name" :href="formatUrl(url)" target="_blank"
            rel="noopener noreferrer" class="common-style">
            {{ name }}
          </a>
        </div>
        <div class="note_footer">
          <div class="adr">
            categories {{ note.adress }}
          </div>
          <div class="det">
            <span class="d_time">{{ note.time }}</span>
            <span class="d_cl">{{ note.collect }} collects {{ note.like }}likes</span>
          </div>
        </div>
        <div class="comments_container">
          <comments-container v-if="note.comments" :comments="note.comments" @submitReply="handleReplySubmit" />
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import 'swiper/dist/css/swiper.min.css'
import BScroll from 'better-scroll'
import { mapGetters } from 'vuex'
import CommentModal from '../components/CommentModal.vue'
import { authMixin } from '../common/authMixin.js'
import axios from 'axios'
import CommentsContainer from '../components/CommentsContainer.vue';
export default {
  data() {
    return {
      swiperOption: {
        pagination: '.swiper-pagination',
        paginationType: 'fraction',
      },
      showCommentBox: false,
      id: 0,
      isFollowing: false,
      authorId: -1,
      checkFollowingInterval: null,
      checkFollowingCnt: 60,
    }
  },
  mixins: [authMixin],
  computed: {
    ...mapGetters([
      'note'
    ]),
    linkedDescription() {
      if (!this.note.desc) return '';
      // A basic regex pattern to match URLs
      const urlPattern = /(\bhttps?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

      // Escape HTML to prevent XSS attacks or unwanted HTML rendering
      const escapeHtml = (text) => {
        return text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      };

      // First escape HTML, then replace URLs with anchor tags and newlines with <br>
      return escapeHtml(this.note.desc)
        .replace(urlPattern, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`)
        .replace(/\n/g, '<br>'); // Replace newlines with <br>
    },
    parsedLinks() {
      try {
        if (!this.note.links) return null;
        const allLinks = JSON.parse(this.note.links);
        const usefulLinks = {};

        for (const key in allLinks) {
          if (allLinks[key] && this.isValidUrl(allLinks[key])) {
            usefulLinks[key] = allLinks[key];
          }
        }

        return usefulLinks;
      } catch (e) {
        console.error('Failed to parse links:', e);
        return null;
      }
    },
    followButtonText() {
      return this.isFollowing ? '-Unfollow' : '+Follow';
    },
  },
  methods: {
    hideNote() {
      this.$router.push('/')
    },
    isValidUrl(string) {
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    },
    isMobileDevice() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    handleCommentSubmit(commentText, commentID) {
      const commentData = { itemId: this.note.id, content: commentText, commentID: commentID };
      axios.post('/useraction', commentData, this.getAuthConfig()).then(response => {
        console.log('Comment data updated on backend', response.data);
        if (!this.note.comments) {
          this.$set(this.note, 'comments', []);
        }
        this.note.comments.push(response.data);
        this.showCommentBox = false;
      }).catch(error => {
        console.error('Error updating like data', error);
        alert('Failed to post comment. Please try again.');
        this.showCommentBox = false;
      });
    },
    navigateTo(userid) {
      // Use Vue Router's push method to change the route
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        global.userScreenModeChanged = "Profile;"+userid;
        this.$router.push({ path: '/main2/page2', query: { userid: userid, userScreenModeChanged: "Profile" } });
      } else {
        this.$router.push({ path: '/main2/page1', query: { userid: userid, userScreenModeChanged: "Profile" } });
      }
    },
    handleReplySubmit(comment, commentID) {
      const commentData = { itemId: this.note.id, content: comment.newReplyContent, commentID: commentID };
      axios.post('/useraction', commentData, this.getAuthConfig()).then(response => {
        console.log('Comment data updated on backend', response.data);
        if (!comment.Replies) {
          this.$set(comment, 'Replies', []);
        }
        comment.Replies.push(response.data);
        comment.showForm = false;
      }).catch(error => {
        console.error('Error updating like data', error);
        alert('Failed to post comment. Please try again.');
        comment.showForm = false;
      });
    },
    fetchNoteData(id) {
      axios.get(`/note/${id}`, this.getAuthConfig())
        .then(response => {
          this.$store.dispatch('getNote', response.data)
          this.authorId = response.data.userid;
          if (global.connectedAccount !== null) {
            this.checkFollowing();
          }
        })
        .catch(error => {
          console.error('Failed to fetch note data:', error)
        })
    },
    _initScroll() {
      const isMobile = this.isMobileDevice();
      this.noteScroll = new BScroll(this.$refs.noteWrapper, {
        click: true,
        mouseWheel: !isMobile,
        probeType: true,
        preventDefault: isMobile, // TODO just enable on desktop
      })
    },
    formatUrl(url) {
      // A simple method to ensure that URLs have a protocol part
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `http://${url}`;
      }
      return url;
    },
    async followUser() {
      try {
        const apiUrl = '/useraction';
        const requestData = {
          follow: !this.isFollowing,
          following: this.authorId,
        };
        const response = await axios.post(apiUrl, requestData, this.getAuthConfig());
        if (response.status === 200) {
        } else {
          console.error('Follow request failed');
        }
      } catch (error) {
        console.error('Error following user:', error);
      }
      this.isFollowing = !this.isFollowing;
    },
    async checkFollowing() {
      if (this.checkFollowingCnt < 0) {
        return;
      }
      this.checkFollowingCnt--;
      axios.get(`/isfollowing/${this.authorId}`, this.getAuthConfig())
        .then(res => {
          this.isFollowing = res.data.isFollowing;
        }).catch(error => {
          console.error('Error following user:', error);
        });
    }
  },
  components: {
    swiper,
    swiperSlide,
    CommentModal,
    CommentsContainer,
  },
  created() {
    this.id = this.$route.params.id
    this.fetchNoteData(this.id)
    //if (this.$store.state.isNav) {
    //  this.$store.dispatch('isNav')
    //}
    this.$nextTick(() => {
      this._initScroll()
    })
    this.checkFollowingInterval = setInterval(this.checkFollowing, 1000);
  },
  beforeDestroy() {
    // Clear the interval when the component is destroyed to prevent memory leaks
    clearInterval(this.checkFollowingInterval);
  },
  watch: {
    '$route'() {
      if (this.$store.state.isNav) {
        this.$store.dispatch('isNav')
      }
    }
  }
}
</script>
<style scoped>
.note_page {
  width: 100%;
  top: 1.5rem;
  bottom: 0;
  background: #fff;
  overflow: hidden;
  position: absolute;
  user-select: text;
}

.move-enter-active,
.move-leave-active {
  transition: all 0.2s linear;
}

.move-enter,
.move-leave-active {
  transform: translate3d(100%, 0, 0);
}

.note_con {
  width: 100%;
  position: relative;
}

.note_pic {
  width: 100%;
}

.swiper-item {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 9rem;
  /* You can adjust this height as needed */
}

.swiper-item img {
  max-width: 100%;
  /* Image can take up to full width of the container */
  max-height: 100%;
  /* Image can take up to full height of the container */
  object-fit: contain;
}

.swiper-item img[lazy=loading] {
  max-width: 100%;
  /* Image can take up to full width of the container */
  max-height: 100%;
  /* Image can take up to full height of the container */
  object-fit: contain;
}

.swiper-pagination-fraction {
  width: 20%;
  left: 80%;
}

.note_icon {
  top: 0.37rem;
  left: 0;
  right: 0;
  width: 10rem;
  height: 0.74rem;
  /* padding: 0.48rem; */
  position: absolute;
  z-index: 50;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.n_left img,
.n_right img {
  width: 0.61rem;
  height: 0.61rem;
  margin: 0.48rem;
}

.note_header {
  width: 100%;
  height: 1.44rem;
  line-height: 1.44rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 1px solid #e6e6e6;
}

.n_user {
  display: flex;
  font-size: 0.44rem;
  color: #333333;
  flex-direction: row;
  margin-left: 0.46rem;
}

.n_user img {
  width: 0.91rem;
  height: 0.91rem;
  border-radius: 50%;
  margin-top: 0.26rem;
  margin-right: 10px;
}

.btn {
  margin-right: 0.46rem;
}

.btn button {
  width: 2.0rem;
  height: 0.78rem;
  color: #ff2741;
  border-radius: 6px;
  font-size: 0.30rem;
  border: 1px solid #ff2741;
  background-color: #fff;
}

.btn button:hover {
  background-color: #ff2741;
  /* Change background color on hover */
  color: #fff;
  /* Change text color on hover for better contrast */
  border: 1px solid #ff2741;
  /* Optional: Adjust the border color if needed */
  cursor: pointer;
  /* Change cursor to indicate it's clickable */
}

.follow-btn {
  margin-right: 0.2rem;
  /* Adjust the margin as needed */
  padding: 5px 10px;
  background-color: #2894FF;
  /* Blue background for the follow button */
  color: white;
  /* White text */
  border: none;
  /* No border */
  border-radius: 4px;
  /* Rounded corners */
  cursor: pointer;
  /* Clickable cursor icon */
  font-size: 0.30rem;
  /* Match font size with your design */
}

.follow-btn:hover {
  background-color: #1F7AFF;
  /* Slightly darker blue on hover */
}

.common-style {
  font-size: 0.35rem;
  line-height: 0.45rem;
  padding: 0.1rem;
  color: #0000EE;
  text-decoration: none;
  /* This removes the underline from links */
  display: inline-block;
  /* To properly apply padding and allow for :hover styles */
  cursor: pointer;
  /* To explicitly show that the element is clickable */
}

/* Optional: Add hover effect to indicate the link is clickable */
.common-style:hover {
  text-decoration: underline;
  /* Or any other effect you want on hover */
  color: #000000;
  /* Optional: Change color on hover */
}

.n_desc {
  font-size: 0.35rem;
  line-height: 0.45rem;
  padding: 0.1rem;
  color: #333333;
}

.note_footer {
  width: 100%;
  color: #a3a3a3;
  font-size: 0.30rem;
}

.adr {
  margin-left: 0.46rem;
}

.det {
  margin: 0.46rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

/* Styles for comments section */
.comments_container {
  padding: 10px;
}

.user_avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
  transition: transform 0.2s;
  cursor: pointer;
}

.user_avatar:hover {
  transform: scale(1.1); /* Add this line to scale the image up to 110% on hover */
}


@media (min-width: 1024px) {

  /* Adjust this breakpoint as needed */
  .note_page {
    width: 100%;
    /* Set width to 50% for desktop screens */
    max-width: 1024px;
    left: 50%;
    /* Position 50% from the left of the screen */
    transform: translateX(-50%);
    /* Shift the element to the left by half its own width */
    position: absolute;
    /* Ensure the element is positioned absolutely */
  }
}
</style>
