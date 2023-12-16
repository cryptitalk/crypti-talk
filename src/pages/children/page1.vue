<template>
    <div class="discovery_page">
        <div v-if="isLoading" class="loading-indicator">
            <div class="spinner"></div>
        </div>
        <div v-else class="discovery" ref="disWrapper">
            <div class="dis-list">
                <div class="left-list">
                    <ul>
                        <li v-for="(item, index) in leftDisList" @click="selectedNote(item)" :key="index">
                            <div class="note_item">
                                <a class="img">
                                    <img v-lazy="item.img" alt="">
                                </a>
                                <div class="desc">
                                    <p>{{ item.short_desc | truncate(20) }}</p>
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
                <div class="right-list">
                    <ul>
                        <li v-for="(item, index) in rightDisList" @click="selectedNote(item)" :key="index">
                            <div class="note_item">
                                <a class="img">
                                    <img v-lazy="item.img" alt="">
                                </a>
                                <div class="desc">
                                    <p>{{ item.short_desc | truncate(20) }}</p>
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
</template>
<script>
import { mapGetters } from 'vuex'
import BScroll from 'better-scroll'
import LikeButton from '../../components/LikeButton.vue';
import { EventBus } from '../../common/eventBus.js';

const response = require('../../common/disgoods.json')
export default {
    data() {
        return {
            selecteddis: {},
            isLoadingMoreData: false, // Flag to indicate if more data is being loaded
            isRefreshData: false, // Flag to indicate if more data is being loaded
            isInitiated: false,
            screenMode: "New",
        }
    },
    components: {
        LikeButton,
        EventBus,
    },
    computed: {
        ...mapGetters([
            'leftDisList',
            'rightDisList'
        ]),
        isLoading() {
            console.log("check isloading")
            return !this.isInitiated && this.isRefreshData;
        }
    },
    methods: {
        selectedNote(item) {
            lastScrollY = this.pageScroll.y;
            this.$store.dispatch('getNote', item)
            this.addItemToQueue(item.id)
            this.$router.push('/note')
        },
        addItemToQueue(item) {
            this.$updateQueue(item);
            console.log(this.$queue);
        },
        getQueueAsString() {
            return this.$queueToString();
        },
        _initScroll() {
            const isMobile = this.isMobileDevice();
            this.pageScroll = new BScroll(this.$refs.disWrapper, {
                click: true,
                mouseWheel: !isMobile,
                probeType: 3 // Enable listening to the scroll event
            });

            this.pageScroll.on('scroll', (position) => {
                if (!this.isRefreshData && position.y === 0) {
                    // Scrolled to the top
                    this.isRefreshData = true
                    this.refreshData();
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
        getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        },
        getAuthConfig() {
            const loginInfo = this.getCookie('logged-in:' + global.connectedAccount);
            const config = {};
            if (loginInfo) {
                config.headers = {
                    Authorization: global.connectedAccount + ":" + loginInfo
                };
            }
            return config
        },
        refreshData() {
            this.resetQueue();
            // Logic to refresh data when scrolled to the top
            console.log("Refreshing data...");
            // Implement your data refreshing logic here
            var history = this.getQueueAsString();
            axios.get(`/explore/${history}`, this.getAuthConfig())
                .then(res => {
                    this.$store.dispatch('getDiscoverys', res.data.discoveryList);
                    this.isRefreshData = false; // Reset flag
                    this.$purgeQueue();
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
                    this.$store.dispatch('appendDiscovery', res.data.discoveryList);
                    this.isLoadingMoreData = false; // Reset flag
                    this.$purgeQueue();
                }).catch(error => {
                    console.error("Error loading more data:", error);
                    this.isLoadingMoreData = false; // Reset flag in case of error
                });
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
    },
    mounted() {
        EventBus.$on('userScreenModeChanged', (newUserScreenMode) => {
            this.screenMode = newUserScreenMode;
            this.isRefreshData = true
            this.refreshData();
        });
        console.log(this.screenMode)
    },
    created() {
        var history = this.getQueueAsString();
        var historyArray = history.split(',');
        if (historyArray.length > 0 && historyArray[0] === 'search') {
            this.$store.dispatch('clearData');
            this.isRefreshData = true
            isInitiated = false;
        }
        axios.get(`/explore/${history}`, this.getAuthConfig())
            .then(res => {
                if (!isInitiated) {
                    this.$store.dispatch('getDiscoverys', res.data.discoveryList)
                    isInitiated = true
                    this.isRefreshData = false
                    this.$purgeQueue();
                }
                this.$nextTick(() => {
                    this._initScroll();
                    this.restoreScrollPosition();
                })
            })
    }
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>

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
.discovery {
    width: 100%;
    height: 100%;
    top: 2.8rem;
    bottom: 5.0rem;
    overflow: hidden;
    position: absolute;
    background: #f5f8fa;
}

.discovery .dis-list {
    width: 100%;
    /* min-height: 150%; Uncomment if needed */
    display: flex;
    flex-direction: row;
    background: #f5f8fa;
}

.discovery .dis-list .left-list {
    margin-left: 5px;
    flex: 1;
}

.discovery .dis-list .right-list {
    margin-right: 5px;
    flex: 1;
}

.discovery .dis-list ul > li {
    width: 96%;
    margin-left: auto;
    margin-right: auto;
    margin-top: 5px;
    font-size: 0.39rem;
    list-style: none;
}

.discovery .dis-list ul > li .note_item {
    /* Styles for .note_item */
}

.discovery .dis-list ul > li .note_item .img {
    width: 100%; /* maintain full width of the container */
    height: auto; /* adjust height automatically */
    overflow: hidden;
}

.discovery .dis-list ul > li .note_item .img img,
.discovery .dis-list ul > li .note_item .img img[lazy=loading] {
    width: 100%; /* image will take full width of its container */
    height: auto; /* adjust height automatically */
    object-fit: contain; /* this will ensure the image is scaled properly */
    overflow: hidden;
}

.discovery .dis-list ul > li .note_item .desc {
    width: 100%;
    height: 0.94rem;
}

.discovery .dis-list ul > li .note_item .desc p {
    margin: 0.26rem;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.discovery .dis-list ul > li .note_item .note {
    height: 0.63rem;
    margin: 0.22rem;
    line-height: 0.63rem;
    display: flex;
    color: #333333;
    flex-direction: row;
    justify-content: space-between;
}

.discovery .dis-list ul > li .note_item .note .user,
.discovery .dis-list ul > li .note_item .note .user img,
.discovery .dis-list ul > li .note_item .note .user img[lazy=loading] {
    display: flex;
    color: #333333;
    font-size: 0.33rem;
    flex-direction: row;
    width: 0.63rem;
    height: 0.63rem;
    margin-right: 0.13rem;
    border-radius: 50%;
}         
</style>

