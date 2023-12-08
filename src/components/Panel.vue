<template>
    <div class="panel">
        <div class="header" @click="fetchUserData">
            <img src="../assets/wm.png" alt="watermelon">
            <div>0x00000 </div>
        </div>
        
        <div class="content">
            <div class="con_item" @click="handleEntropyClick">
                <div class="img">
                    <img src="../assets/icon1.png" alt="look">
                </div>
                <div class="text">
                    <span>ENTROPY</span>
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
            message += "comment point: " + this.user.comment + "\n"
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
    border-radius: 15px
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2)
    //padding: 20px
    display: flex
    flex-direction: column
    align-items: center
}

.header {
    display: flex
    align-items: center
    justify-content: center
    font-size: 18px;
    margin-top: 50px
    margin-bottom: 20px
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
    align-items: center
    border-radius: 10px /* Rounded corners for items */
    padding: 5px 15px
    background-color: rgba(0, 0, 0, 0.05) // Darker semi-transparent background
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1) // Subtle shadow for depth
    transition: all 0.3s ease // Transition for hover effects
}

.content .con_item:hover {
    background-color: rgba(255, 255, 255, 0.5) /* Change background on hover */
    transform: scale(1.05) /* Slightly enlarge on hover */
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

