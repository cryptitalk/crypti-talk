<template>
    <div class="entropy-popup" v-if="visible">
        <div class="popup-content">
            <h3>Entropy Details:</h3>
            <ul>
                <li v-for="(value, key) in data" :key="key">{{ key }}: {{ value }}</li>
            </ul>
        </div>
        <button @click="closePopup">Close</button>
    </div>
</template>

<script>
export default {
    props: {
        visible: {
            type: Boolean,
            required: true
        },
        data: {
            type: Object,
            required: true
        }
    },
    methods: {
        closePopup() {
            this.$emit('close');
        }
    }
}
</script>


<style scoped>
.entropy-popup {
    /* Your styles for the popup */
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    z-index: 1000; /* Make sure it's above other content */
}

.popup-content {
    margin-bottom: 20px;
}

/* Add additional styling as needed */
</style>