import * as types from '../mutation-types'
const state = {
    all: [],
    choosedNote: []
}
const getters = {
    leftDisList: function () {
        const ll = []
        state.all.map((item,index) => {
            if ((index+1)%2)
                ll.push(item)
        })
        return ll
    },
    rightDisList: function () {
        const rl = []
        state.all.map((item,index) => {
            if (!((index+1)%2))
                rl.push(item)
        })
        return rl
    },
    note: state => state.choosedNote
}
const actions = {
    getDiscoverys({ commit }, data) {
        commit(types.INITDISDATA, { data })
    },
    appendDiscovery({ commit }, newData) {
        commit(types.APPENDDISDATA, newData);
    },
    getNote ({ commit }, value) {
        commit(types.GETNOTE,{ value })
    },
    clearData({ commit }) {
        commit(types.CLEARDISDATA);
    }
}
const mutations = {
    [types.INITDISDATA] (state, { data }) {
        // console.log(data)
        state.all = data
    },
    [types.APPENDDISDATA](state, newData) {
        state.all.push(...newData);
    },
    [types.GETNOTE] (state, { value }) {
        state.choosedNote = value
    },
    [types.CLEARDISDATA](state) {
        state.all = [];
        state.choosedNote = [];
    }
}
export default {
    state,
    getters,
    actions,
    mutations,
}