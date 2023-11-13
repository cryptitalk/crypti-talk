<template>
    <div class="discovery_page">
        <div class="discovery" ref="disWrapper">
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
                                        <img v-lazy="item.avator" alt="">
                                        <span>{{ item.uname }}</span>
                                    </a>
                                    <a class="like">
                                        <img src="../../assets/like.png" alt="like">
                                        <span>{{ item.like }}</span>
                                    </a>
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
                                    <p>{{ item.short_desc }}</p>
                                </div>
                                <div class="note">
                                    <a class="user">
                                        <img v-lazy="item.avator" alt="">
                                        <span>{{ item.uname }}</span>
                                    </a>
                                    <a class="like">
                                        <img src="../../assets/like.png" alt="like">
                                        <span>{{ item.like }}</span>
                                    </a>
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
const response = require('../../common/disgoods.json')
export default {
    data() {
        return {
            selecteddis: {},
            isLoadingMoreData: false, // Flag to indicate if more data is being loaded
            isRefreshData: false, // Flag to indicate if more data is being loaded
            isInitiated: false,
        }
    },
    computed: {
        ...mapGetters([
            'leftDisList',
            'rightDisList'
        ])
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

        refreshData() {
            // Logic to refresh data when scrolled to the top
            console.log("Refreshing data...");
            // Implement your data refreshing logic here
            var history = this.getQueueAsString();
            axios.get(`/explore/${history}`).then(res => {
                this.$store.dispatch('getDiscoverys', res.data.discoveryList);
                this.isRefreshData = false; // Reset flag
            }).catch(error => {
                console.error("Error loading more data:", error);
                this.isRefreshData = false; // Reset flag in case of error
            });
        },

        loadMoreData() {
            var history = this.getQueueAsString();
            console.log("Loading more data...", history);
            axios.get(`/explore/${history}`).then(res => {
                this.$store.dispatch('appendDiscovery', res.data.discoveryList);
                this.isLoadingMoreData = false; // Reset flag
            }).catch(error => {
                console.error("Error loading more data:", error);
                this.isLoadingMoreData = false; // Reset flag in case of error
            });
        },
    },
    created() {
        var history = this.getQueueAsString();
        axios.get(`/explore/${history}`)
            .then(res => {
                if (!isInitiated) {
                    this.$store.dispatch('getDiscoverys', res.data.discoveryList)
                    isInitiated = true
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
.discovery
    width 100%
    height 100%
    top 0rem
    bottom 5.0rem
    overflow hidden
    position absolute
    background #f5f8fa
    .dis-list
        width 100%
        // min-height 150%
        display flex
        flex-direction row
        background #f5f8fa
        .left-list
            margin-left 5px
            flex 1
        .right-list
            margin-right 5px
            flex 1
        ul > li
            width 96%
            margin-left auto
            margin-right auto
            margin-top 5px
            font-size 0.39rem
            list-style none
            .note_item
                .img
                    width 100%
                    overflow hidden
                    img
                        width 100%
                    img[lazy=loading]
                        width 100%
                .desc
                    width 100%
                    height 0.94rem
                    p
                        margin 0.26rem
                        overflow hidden;
                        text-overflow ellipsis
                        display -webkit-box
                        -webkit-line-clamp 2
                        -webkit-box-orient vertical
                .note
                    height 0.63rem
                    margin 0.22rem
                    line-height 0.63rem
                    display flex
                    color #333333
                    flex-direction row
                    justify-content space-between
                    .user
                        display flex
                        color #333333
                        font-size 0.33rem
                        flex-direction row
                        img
                            width 0.63rem
                            height 0.63rem
                            margin-right 0.13rem
                            border-radius 50%
                        img[lazy=loading]
                            width 0.63rem
                            height 0.63rem
                            margin-right 0.13rem
                            border-radius 50%
                    .like
                        line-height 0.63rem
                        display flex
                        color #999999
                        flex-direction row
                        img
                            margin-top 0.13rem
                            margin-right 0.11rem
                            width 0.37rem
                            height 0.37rem                  
</style>

