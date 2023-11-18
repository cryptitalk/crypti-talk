// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import axios from 'axios'
import Mint from 'mint-ui'
import 'mint-ui/lib/style.css'
import VueTouch from 'vue-touch'
Vue.use(VueTouch, { name: 'v-touch' })

//axios.defaults.baseURL = 'http://host.docker.internal:5000/'   //加前缀
//axios.defaults.baseURL = 'http://localhost:5000/'   //加前缀

if (process.env.EXEC_ENV === 'production') {
  axios.defaults.baseURL = 'https://main-wjaxre4ena-uc.a.run.app/';   // Set base URL
  global.axios = axios;    // Globalize axios
  console.log("in production");
} else {
  axios.defaults.baseURL = 'https://byzql.nas.cpolar.cn/';   // Set base URL
  global.axios = axios;    // Globalize axios
  console.log("in test");
}

global.isInitiated = false
global.lastScrollY = 0

Vue.filter('truncate', function (value, length) {
  if (value.length <= length) {
    return value;
  }
  return value.substring(0, length) + '...';
});

Vue.prototype.$queue = [];

Vue.prototype.$updateQueue = function (item) {
  this.$queue.push(item);
  if (this.$queue.length > 4) {
    this.$queue.shift(); // Remove the first (oldest) item
  }
};

Vue.prototype.$queueToString = function () {
  if (this.$queue.length === 0) {
    return '0';
  }
  return this.$queue.join(',');
};

Vue.config.productionTip = false

Vue.use(Mint);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
