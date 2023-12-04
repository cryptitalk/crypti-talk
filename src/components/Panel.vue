<template>
    <div class="panel">
        <div class="header" @click="fetchUserData">
            <img src="../assets/wm.png" alt="watermelon">
            <div>Hi Crypti User </div>
        </div>
        
        <div class="content">
            <div class="con_item" @click="handleEntropyClick">
                <div class="img">
                    <img src="../assets/icon1.png" alt="look">
                </div>
                <div class="text">
                    <span>My ENTROPY</span>
                </div>
            </div>
        </div>

    </div>
</template>
<script>
export default {
    data() {
        return {
            user: [],
        }
    },
    mounted() {
        this.fetchUserData();
    },
    methods: {
        async handleEntropyClick() {
            await this.fetchUserData();
            let message = "user: " + global.connectedAccount + "\n"
            message += "browsing point: " + this.user.browsing + "\n"
            message += "search point: " + this.user.search + "\n"
            message += "like point: " + this.user.like + "\n"
            this.showToast(message);
        },

        showToast(message) {
            alert(message);
        },
        async fetchUserData() {
            try {
                console.log("come here to load user info")
                if (global.connectedAccount != '') {
                    const response = await axios.get(`/validuser/${global.connectedAccount}`);
                    this.user = response.data;
                } else {
                    this.user = []
                }
            } catch (error) {
                console.error('There was an error fetching the user data:', error);
            }
        }
    }
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
.panel {
    width: 100%;
    height: 100%;
    background: white;
}

.header {
    width: 100%;
    height: 10%;
    font-size: 20px;
    margin-top: 60px;
    text-align: center;
}

.header img {
    width: 40px;
    height: 40px;
}

.content {
    width: 80%;
    padding: 30px;
    cursor: pointer; /* Cursor changes to pointer when mouse hovers over content */
}

.content .con_item {
    height: 25px;
    line-height: 25px;
    font-size: 16px;
    margin-bottom: 30px;
    display: flex;
    flex-direction: row;
}

.content .con_item .img {
    margin-right: 15px;
}

.content .con_item .img img {
    width: 25px;
    height: 25px;
}

.content .con_item .text {
    height: 25px;
    line-height: 25px;
}
</style>

