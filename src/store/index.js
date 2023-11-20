import Vue from 'vue'
import Vuex from 'vuex'
import discovery from './modules/discovery'
import discovery5 from './modules/discovery5'
import goods from './modules/goods'
import cart from './modules/cart'
import * as getters from './getters'
import * as actions from './actions'
import mutations from './mutations'

Vue.use(Vuex)

const state = {
    isNav: true,
    popupVisible: false
}

export default new Vuex.Store({
    state,
    modules: {
        discovery,
        discovery5,
        goods,
        cart
    },
    getters,
    actions,
    mutations
})