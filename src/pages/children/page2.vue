<template>
  <div class="discovery">
    <div v-if="isLoading" class="loading-indicator">
      <div class="spinner"></div>
    </div>
    <div v-else class="content-area">
      <!-- Panel on the Left -->
      <div class="left-panel">
        <Panel />
      </div>

      <!-- Five Lists on the Right -->
      <div class="right-lists" ref="disWrapper">
        <div class="dis-list-five-columns">
          <div v-for="column in 5" :key="column" class="column">
            <ul>
              <li v-for="(item, index) in getItemsForColumn(column)" @click="clickHandler(item, $event)" :key="item.id">
                <div class="note_item">
                  <a class="img">
                    <img v-lazy="item.img" alt="">
                  </a>
                  <div class="desc">
                    <input type="checkbox" :id="'checkbox-' + item.id" :checked="isSelected(item)"
                      @change.prevent="handleSelectionChange(item, $event)">
                    <label :for="'checkbox-' + item.id">{{ item.short_desc | truncate(20) }}</label>
                  </div>
                  <div class="note">
                    <a class="user">
                      <span>{{ item.uname }}</span>
                    </a>
                    <like-button :item="item"></like-button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import BScroll from 'better-scroll'
import LikeButton from '../../components/LikeButton.vue';
import Panel from '../../components/Panel.vue';
import { EventBus } from '../../common/eventBus.js';
import { authMixin } from '../../common/authMixin.js'

export default {
  data() {
    return {
      selecteddis: {},
      isLoadingMoreData: false, // Flag to indicate if more data is being loaded
      isRefreshData: false, // Flag to indicate if more data is being loaded
      isInitiated: false,
      screenMode: 'None',
      numPerPage: 30,
      pageNum: 1,
    }
  },
  mixins: [authMixin],
  components: {
    LikeButton,
    Panel,
    EventBus,
  },
  computed: {
    ...mapGetters([
      'list1',
      'list2',
      'list3',
      'list4',
      'list5'
    ]),
    isLoading() {
      console.log("check isloading")
      return !this.isInitiated && this.isRefreshData;
    }
  },
  methods: {
    selectedNote(item) {
      lastScrollY = this.pageScroll.y;
      //this.$store.dispatch('getNote', item)
      //this.addItemToQueue(item.id)
      this.$router.push('/note/' + item.id)
    },
    handleSelectionChange(item, $event) {
      $event.stopPropagation(); // Prevent the click event from bubbling up to <li>
      this.$store.dispatch('toggleItemSelection5', { item, id: item.id });
    },
    isSelected(item) {
      return this.$store.getters.isSelected(item.id); // Assuming item has a property 'id' which is unique
    },
    clickHandler(item, $event) {
      if ($event.target.type !== 'checkbox') {
        this.selectedNote(item);
      }
    },
    getItemsForColumn(columnNumber) {
      switch (columnNumber) {
        case 1: return this.list1;
        case 2: return this.list2;
        case 3: return this.list3;
        case 4: return this.list4;
        case 5: return this.list5;
        default: return [];
      }
    },
    resetQueue() {
      if (this.screenMode === 'Frens') {
        this.$purgeQueue();
        this.addItemToQueue(-1);
        this.addItemToQueue(global.connectedAccount);
      } else if (this.screenMode === 'Bots') {
        this.$purgeQueue();
        this.addItemToQueue(-2);
        this.addItemToQueue(global.connectedAccount);
      } else if (this.screenMode === 'New') {
        var str = this.$queueToString()
        if (str.startsWith("search") || str.startsWith("-1") || str.startsWith("-2")) {
          this.$purgeQueue();
        }
      }
    },
    addItemToQueue(item) {
      this.$updateQueue(item);
      console.log(this.$queue);
    },
    getQueueAsString() {
      let ret = "0," + this.numPerPage + "," + this.pageNum;

      if (this.screenMode === 'New' || this.screenMode === 'None') {
        ret = "0," + this.numPerPage + "," + this.pageNum;
      } else if (this.screenMode === undefined || this.screenMode === 'Search') {
        ret = this.$queueToString();
      } else if (this.screenMode === 'Frens') {
        ret = "2," + this.numPerPage + "," + this.pageNum;
      } else if (this.screenMode === 'Bots') {
        ret = "3," + this.numPerPage + "," + this.pageNum;
      } else if (this.screenMode.startsWith('Profile')) {
        ret = "4," + this.numPerPage + "," + this.pageNum + "," + this.screenMode.split(";")[1];
      }
      let components = ret.split(",");
      let firstElement = components[0];

      if (firstElement === '1') {
        ret = firstElement + "," + this.numPerPage + "," + this.pageNum + components.slice(1).join(",");
        this.screenMode = 'Search';
      } else if (firstElement === '0') {
        ret = firstElement + "," + this.numPerPage + "," + this.pageNum
      }
      return ret;
    },
    _initScroll() {
      const isMobile = this.isMobileDevice();
      this.pageScroll = new BScroll(this.$refs.disWrapper, {
        click: true,
        mouseWheel: !isMobile,
        probeType: 3, // Enable listening to the scroll event
        preventDefault: false, // TODO just enable on desktop
      });

      this.pageScroll.on('scroll', (position) => {
        if (!this.isRefreshData && position.y === 0) {
          // Scrolled to the top
          //this.isRefreshData = true
          //this.refreshData();
        }
        else if (!this.isLoadingMoreData && position.y <= this.pageScroll.maxScrollY) {
          this.isLoadingMoreData = true; // Set flag to true to indicate loading has started
          this.loadMoreData();
        }
      });
    },
    isMobileDevice() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    restoreScrollPosition() {
      if (this.pageScroll) {
        this.$nextTick(() => {
          this.pageScroll.scrollTo(0, lastScrollY);
          this.pageScroll.refresh();
          this.$Lazyload.lazyLoadHandler();
        });
      }
    },
    refreshData() {
      // Implement your data refreshing logic here
      var history = this.getQueueAsString();
      axios.get(`/explore/${history}`, this.getAuthConfig()).then(res => {
        this.$store.dispatch('getDiscoverys5', res.data.discoveryList);
        this.isRefreshData = false; // Reset flag
        this.pageNum += 1;
      }).catch(error => {
        console.error("Error loading more data:", error);
        this.isRefreshData = false; // Reset flag in case of error
      });
    },

    loadMoreData() {
      var history = this.getQueueAsString();
      console.log("Loading more data...", history);
      axios.get(`/explore/${history}`, this.getAuthConfig())
        .then(res => {
          this.$store.dispatch('appendDiscovery5', res.data.discoveryList);
          this.isLoadingMoreData = false; // Reset flag
          this.pageNum += 1;
        }).catch(error => {
          console.error("Error loading more data:", error);
          this.isLoadingMoreData = false; // Reset flag in case of error
        });
    },
  },
  mounted() {
  },
  created() {
    this.screenMode = this.$route.query.userScreenModeChanged;
    if (this.screenMode === undefined) {
      this.screenMode = global.userScreenModeChanged;
    }
    this.searchKey = this.$route.query.searchKey;
    var history = this.getQueueAsString();
    console.log("history is: ", history, "screenMode is: ", this.screenMode)
    if (this.screenMode == 'Search' ||
      this.screenMode === 'Frens' ||
      this.screenMode === 'Bots' ||
      this.screenMode === 'New' ||
      this.screenMode.startsWith('Profile')) {
      this.$store.dispatch('clearData5');
      isInitiated = false;
      this.isRefreshData = true
    }
    axios.get(`/explore/${history}`, this.getAuthConfig())
      .then(res => {
        if (!isInitiated) {
          this.$store.dispatch('getDiscoverys5', res.data.discoveryList)
          isInitiated = true
          this.isRefreshData = false
          this.pageNum += 1;
        }
        this.$nextTick(() => {
          this._initScroll();
          //this.restoreScrollPosition();
        })
      })
  }
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>

.discovery {
  width: 100%;
  max-width: 1224px;
  height: 100%;
  top: 2.5rem;
  bottom: 5.0rem;
  overflow: hidden;
  position: absolute;
  background: #f5f8fa;
  left: 50%; /* Positioned 50% from the left of the screen */
  transform: translateX(-50%); /* Shifts the element to the left by half its own width */
  display: flex;
  user-select: text;
}

.content-area {
  display: flex; /* Use flexbox to align the panel and lists side by side */
  width: 100%; /* Set the width to take up the full width of the parent container */
}

.left-panel {
  flex: 1; 
}

.right-lists {
  flex: 7; /* Adjust this value to change the width of the lists area */
  display: flex;
  flex-wrap: wrap;
  /* additional styling */
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px; /* Adjust as needed */
  font-size: 1.2rem;
}

.spinner {
  border: 5px solid rgba(255, 255, 255, 0.3); /* Light grey border */
  border-top: 5px solid #3498db; /* Blue color for the spinner */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.discovery .dis-list-five-columns {
  width: 100%;
  display: flex;
  flex-direction: row;
  background: #f5f8fa;
}

.discovery .dis-list-five-columns .column {
  flex: 1;
  margin: 5px; /* Adjust margins as needed */
}

.discovery .dis-list-five-columns ul > li {
  width: 96%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 5px;
  font-size: 0.30rem;
  list-style: none;
}

.discovery .dis-list-five-columns ul > li .note_item {
  /* Styles for .note_item */
}

.discovery .dis-list-five-columns ul > li .note_item .img {
  width: 100%; /* maintain full width of the container */
  height: auto; /* adjust height automatically */
  overflow: hidden;
}

.discovery .dis-list-five-columns ul > li .note_item .img img,
.discovery .dis-list ul > li .note_item .img img[lazy=loading] {
  width: 100%; /* image will take full width of its container */
  height: auto; /* adjust height automatically */
  object-fit: contain; /* this will ensure the image is scaled properly */
  overflow: hidden;
}

.discovery .dis-list-five-columns ul > li .note_item .desc {
  width: 100%;
  height: 0.94rem;
}

.discovery .dis-list-five-columns ul > li .note_item .desc p {
  margin: 0.26rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.discovery .dis-list-five-columns ul > li .note_item .note {
  height: 0.63rem;
  margin: 0.22rem;
  line-height: 0.63rem;
  display: flex;
  color: #333333;
  flex-direction: row;
  justify-content: space-between;
}

.discovery .dis-list-five-columns ul > li .note_item .note .user,
.discovery .dis-list-five-columns ul > li .note_item .note .user img,
.discovery .dis-list-five-columns ul > li .note_item .note .user img[lazy=loading] {
  display: flex;
  color: #333333;
  font-size: 0.33rem;
  flex-direction: row;
  width: 0.63rem;
  height: 0.63rem;
  margin-right: 0.13rem;
  border-radius: 50%;
}

@media (min-width: 1024px) { /* Adjust the min-width as per your requirement */
  .discovery .dis-list-five-columns ul > li {
    font-size: 0.30rem; /* Double the existing size */
  }

  .discovery .dis-list-five-columns ul > li .note_item .note .user,
  .discovery .dis-list-five-columns ul > li .note_item .note .user img,
  .discovery .dis-list-five-columns ul > li .note_item .note .user img[lazy=loading] {
    font-size: 0.20rem; /* Increase font size */
  }
}
</style>
