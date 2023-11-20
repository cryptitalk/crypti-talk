<template>
    <div id="search">
        <div class="search">
            <template>
                <!-- ... other parts of your template ... -->
                <div class="search-input">
                    <img src="../assets/search.png" />
                    <form @submit.prevent="search(key)">
                        <input type="text" v-model="key">
                    </form>
                </div>
                <div class="search-cancel" @touchend="search(key)" @click="search(key)">
                    search
                </div>
                <!-- ... other parts of your template ... -->
            </template>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            key: '',
            hotList: ["指甲", "阿玛尼501", "小棕瓶", "阿玛尼200", "秋冬美甲", "睡袋", "瘦腿袜", "雅诗兰黛130", "阿玛尼503", "sw", "大闸蟹", "厚木", "月子餐", "过漆靴", "sensai"],
            searchHistory: []
        }
    },
    methods: {
        search(key) {
            this.key = key
            const isMobile = () => {
                return /Mobi|Android|iPhone/i.test(navigator.userAgent);
            }
            this.$purgeQueue();
            this.$updateQueue("search");
            this.$updateQueue(key);
            // Navigate to page1 if on mobile, else navigate to page2
            if (isMobile()) {
                this.$router.push({ name: 'page1', query: { searchKey: this.key } });
            } else {
                this.$router.push({ name: 'page2', query: { searchKey: this.key } });
            }
        }
    },
    created: function () {
        if (this.$store.state.isNav) {
            this.$store.dispatch('isNav')
        }
        if (localStorage.searchHistory) {
            this.searchHistory = JSON.parse(localStorage.searchHistory)
        }
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
/* Styles for the main container */
#search {
    display: flex;
    justify-content: center;
    /* Center horizontally */
    align-items: center;
    /* Center vertically */
    height: 100vh;
    /* Full height of the viewport */
}

/* Styles for the search bar container */
.search {
    width: 100%;
    max-width: 600px;
    height: 120px;
    /* Double the original height */
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background: #fff;
}

/* Updated styles for the search input */
.search-input {
    width: 90%;
    background: #f5f8fa;
    border-radius: 5px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.search-input img {
    height: 60px;
    /* Adjusted to match the new height of the search bar */
    width: 60px;
    display: inline-block;
    margin: 0 5px;
}

/* Updated styles for the form and input within the search input */
.search-input form,
.search-input input {
    width: 100%;
    height: 100%;
    border: none;
    background: #f5f8fa;
    font-size: 32px;
    /* Double the original font size */
    flex-grow: 1;
    border-radius: 5px;
    outline: none;
}

/* Adjust the cancel button as well to match the new height */
.search-cancel {
    height: 120px;
    /* Assuming you've doubled the height of the search bar */
    width: 110px;
    line-height: 120px;
    overflow: hidden;
    transition: width 0.3s;
    cursor: pointer;
    font-size: 32px;
    /* Double the assumed original font size */
    text-align: center;
    /* To ensure the text is centered if it's not already */
}

@media screen and (min-width: 1024px) {
    .search {
        max-width: 1024px;
    }
}
</style>