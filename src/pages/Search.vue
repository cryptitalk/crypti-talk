<template>
    <div id="search">
        <div class="search-container">
            <div class="search-bar">
                <img src="../assets/search.png" class="search-icon" />
                <form @submit.prevent="search(key)" class="search-form">
                    <input type="text" v-model="key" placeholder="Search...">
                </form>
                <div class="search-cancel" @touchend="search(key)" @click="search(key)">
                    Search
                </div>
            </div>
        </div>
        <!-- ... other parts of your template ... -->
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
    width: 100%;
    display: flex;
    justify-content: center;
    padding-top: 20px; /* Adjust as needed for spacing from the top */
}

/* Styles for the search bar container */
.search-container {
    width: 100%;
    max-width: 600px; /* Adjust for desired width */
}

/* Styles for the search bar */
.search-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f5f8fa;
    border-radius: 25px;
    padding: 10px;
    width: 100%; /* Ensure full width */
}

/* Styles for the form within the search bar */
.search-form {
    display: flex;
    flex-grow: 1; /* Ensure form takes available space */
    margin: 0; /* Remove any default margin */
}

/* Styles for the input within the search form */
.search-form input {
    width: 100%; /* Ensure full width */
    border: none;
    background: transparent;
    outline: none;
    font-size: 16px;
    color: #333;
    padding: 10px 15px; /* Adjust padding to match search bar */
    border-radius: 20px; /* Slight rounding to match search bar */
}

.search-form input::placeholder {
    color: #999;
}

/* Adjustments for search icon and cancel button for consistency */
.search-icon {
    height: 30px;
    width: 30px;
    margin-right: 10px; /* Adjust spacing */
}

.search-cancel {
    background: #3498db;
    color: white;
    border-radius: 20px;
    padding: 10px 15px;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

@media screen and (min-width: 1024px) {
    .search-container {
        max-width: 1024px;
    }
}
</style>