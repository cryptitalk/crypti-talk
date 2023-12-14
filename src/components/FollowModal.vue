<template>
  <div class="follow-modal">
    <div class="modal-background" @click="closeFollowModal"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2>Followers and Following</h2>
        <button @click="closeFollowModal">X</button>
      </div>
      <div class="modal-tabs">
        <div class="tab" :class="{ active: activeTab === 'followers' }" @click="switchTab('followers')">
          Followers
        </div>
        <div class="tab" :class="{ active: activeTab === 'following' }" @click="switchTab('following')">
          Following
        </div>
        <div class="tab" :class="{ active: activeTab === 'users' }" @click="switchTab('users')">
          Users
        </div>
        <div class="tab" :class="{ active: activeTab === 'bots' }" @click="switchTab('bots')">
          Bots
        </div>
      </div>
      <div class="tab-content">
        <div
          v-if="activeTab === 'followers' || activeTab === 'following' || activeTab === 'users' || activeTab === 'bots'">
          <!-- Display paginated list -->
          <ul>
            <li v-for="(item, index) in paginatedData" :key="index">
              <div class="user-item">
                <img :src="item.pfp || 'https://storage.googleapis.com/cryptitalk/avatar.png'" alt="User Profile Image"
                  class="user-profile-image" />
                <span class="username">{{ item.username }}</span>
                <button @click="followUser(item)" class="follow-button" :class="{ 'unfollow-button': item.followed }">
                  {{ item.followed ? 'Unfollow' : 'Follow' }}
                </button>
              </div>
            </li>
          </ul>
          <!-- Pagination controls -->
          <div>
            <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
            <span>Page {{ currentPage }}</span>
            <button @click="nextPage" :disabled="currentPage * itemsPerPage >= totalDataLength">Next</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import { authMixin } from '../common/authMixin.js'

export default {
  data() {
    return {
      activeTab: 'followers', // Default to 'followers' tab
      recommendedUsers: [],
      recommendedBots: [],
      followingList: [],
      followersList: [],
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    paginatedFollowers() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.followersList.slice(startIndex, endIndex);
    },
    paginatedFollowing() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.followingList.slice(startIndex, endIndex);
    },
    paginatedUsers() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.recommendedUsers.slice(startIndex, endIndex);
    },
    paginatedBots() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.recommendedBots.slice(startIndex, endIndex);
    },
    paginatedData() {
      if (this.activeTab === 'followers') {
        return this.paginatedFollowers;
      } else if (this.activeTab === 'following') {
        return this.paginatedFollowing;
      } else if (this.activeTab === 'users') {
        return this.paginatedUsers;
      } else if (this.activeTab === 'bots') {
        return this.paginatedBots;
      }
      // Return an empty array or handle other tabs as needed
      return [];
    },
    totalDataLength() {
      if (this.activeTab === 'followers') {
        return this.followersList.length;
      } else if (this.activeTab === 'following') {
        return this.followingList.length;
      } else if (this.activeTab === 'users') {
        return this.recommendedUsers.length;
      } else if (this.activeTab === 'bots') {
        return this.recommendedBots.length;
      }
      // Return 0 or handle other tabs as needed
      return 0;
    },
  },
  mixins: [authMixin],
  mounted() {
    // Make an HTTP request to your backend endpoint
    axios.get('/recomm', this.getAuthConfig())
      .then(response => {
        const data = response.data;
        this.recommendedUsers = data.recommended_users;
        this.recommendedBots = data.recommended_bots;
        this.followingList = data.following;
        this.followersList = data.followers;
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  },
  methods: {
    closeFollowModal() {
      this.$emit("close");
    },
    switchTab(tabName) {
      this.activeTab = tabName;
      this.currentPage = 1;
    },
    previousPage() {
      if (this.activeTab === 'followers') {
        if (this.currentPage > 1) {
          this.currentPage--;
        }
      } else if (this.activeTab === 'following') {
        if (this.currentPage > 1) {
          this.currentPage--;
        }
      } else if (this.activeTab === 'users') {
        const maxPage = Math.ceil(this.recommendedUsers.length / this.itemsPerPage);
        if (this.currentPage > 1) {
          this.currentPage--;
        }
      } else if (this.activeTab === 'bots') {
        const maxPage = Math.ceil(this.recommendedBots.length / this.itemsPerPage);
        if (this.currentPage > 1) {
          this.currentPage--;
        }
      }
    },
    nextPage() {
      if (this.activeTab === 'followers') {
        const maxPage = Math.ceil(this.followersList.length / this.itemsPerPage);
        if (this.currentPage < maxPage) {
          this.currentPage++;
        }
      } else if (this.activeTab === 'following') {
        const maxPage = Math.ceil(this.followingList.length / this.itemsPerPage);
        if (this.currentPage < maxPage) {
          this.currentPage++;
        }
      } else if (this.activeTab === 'users') {
        const maxPage = Math.ceil(this.recommendedUsers.length / this.itemsPerPage);
        if (this.currentPage < maxPage) {
          this.currentPage++;
        }
      } else if (this.activeTab === 'bots') {
        const maxPage = Math.ceil(this.recommendedBots.length / this.itemsPerPage);
        if (this.currentPage < maxPage) {
          this.currentPage++;
        }
      }
    },
    async followUser(user) {
      try {
        const apiUrl = '/useraction';
        const requestData = {
          follow: true,
          following: user.id,
        };
        const response = await axios.post(apiUrl, requestData, this.getAuthConfig());
        if (response.status === 200) {
          user.followed = !user.followed;
          console.log(`You have followed ${user.username}`);
        } else {
          console.error('Follow request failed');
        }
      } catch (error) {
        console.error('Error following user:', error);
      }
    },
  },
};
</script>
  
<style scoped>
/* Add your CSS styles here to match your design */
.follow-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: white;
  width: 80%;
  max-width: 600px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  padding: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-tabs {
  display: flex;
  margin-top: 20px;
}

.tab {
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 8px 8px 0 0;
  background-color: #f5f8fa;
  margin-right: 10px;
}

.tab.active {
  background-color: #1da1f2;
  color: white;
}

.tab-content {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  ul {
    list-style: none;
    padding: 0;
  }

  ul li {
    padding: 5px 0;
  }
}

.user-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.user-profile-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  /* Align username and button vertically */
}

.username {
  font-weight: bold;
  font-size: 18px;
  margin-right: 10px;
  /* Add margin between username and button */
}

.follow-button {
  padding: 5px 10px;
  background-color: #1da1f2;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s; /* Add a transition for smooth color change */
}

.unfollow-button {
  background-color: red; /* Change the background color to red for Unfollow */
}
</style>