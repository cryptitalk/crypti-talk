<template>
<!--
    <div class="main2_nav">
        <div class="m2_header">
            <swiper :options="swiperOption" class="swiper-box">
                <swiper-slide class="swiper-item" v-for="(item,index) in navs" >
                    <div class="opt-item" @click="selectPage(index)" :class="chooseItem==index?'isActive':''">
                        {{item}}
                    </div>
                </swiper-slide>
                <div class="swiper-pagination" slot="pagination"></div>
            </swiper>
        </div>
-->
        <div class="m2_content">
            <router-view :key="$route.fullPath"></router-view>
        </div>
    </div>
</template>
<script>
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import 'swiper/dist/css/swiper.min.css'
import { Indicator } from 'mint-ui'
export default {
    data () {
        return {
            navs: ['ALL','GALXE','EIP'],
            chooseItem: '',
            swiperOption: {
                pagination: '.swiper-pagination',
                slidesPerView: 5,
                paginationHide: true,
                spaceBetween: 17,
                freeMode : true
            }
        }
    },
    methods: {
         selectPage (index) {
             Indicator.open()
             this.chooseItem = index
             index = index + 1
             this.$router.push('/main2/page' + index)
             setTimeout(() => Indicator.close(), 1000)
         },
         isDesktopDevice() {
            // Simple check for desktop using window.innerWidth
            // You may enhance this check as needed
            console.log("check device type", window.innerWidth)
            return window.innerWidth >= 1024;
        }
    },
    components: {
        swiper,
        swiperSlide
    },
    created() {
        if (this.isDesktopDevice()) {
            this.$router.push('/main2/page2'); // Navigate to page2 for desktop
        } else {
            this.$router.push('/main2/page1'); // Navigate to page1 for mobile
        }
    }
}
</script>
<style lang="stylus" rel="stylesheet/stylus">
.main2_nav {
    width: 100%;
    .m2_header {
        width: 100%;
        height: 0.98rem; /* Adjusted if needed */
        padding-top: 0.24rem;
        background: #f5f8fa;
        a {
            color: grey;
            text-decoration: none;
        }
        a:visited {
            color: grey;
        }
        .swiper-box {
            padding-left: 0.24rem;
            padding-right: 0.24rem;
            .swiper-wrapper {
                .swiper-slide {
                    .opt-item {
                        /* height: 0.69rem; You might not need to set a height */
                        line-height: 0.5rem; /* Adjust line-height as needed to fit the text */
                        text-align: center;
                        border-radius: 25px;
                        font-size: 0.46rem;
                        color: #999999;
                        background: #fff;
                        /* border: 1px solid grey; */
                    }
                    .isActive {
                        color: #333333;
                        /* border: 1px solid black; */
                    }
                }
            }
            .swiper-pagination {
                display: none;
            }
        }
    }
}
        
</style>

