import * as types from '../mutation-types'
import Vue from 'vue';

const state = {
    all: [],
    choosedNote: [],
    isSelected: {}
}

const getters = {
    // Create five getters for five different lists
    list1: state => state.all.filter((item, index) => index % 5 === 0),
    list2: state => state.all.filter((item, index) => index % 5 === 1),
    list3: state => state.all.filter((item, index) => index % 5 === 2),
    list4: state => state.all.filter((item, index) => index % 5 === 3),
    list5: state => state.all.filter((item, index) => index % 5 === 4),
    note5: state => state.choosedNote,
    isSelected: (state) => (id) => {
        return state.isSelected[id] || false;
    },
}

const actions = {
    getDiscoverys5({ commit }, data) {
        commit(types.INITDISDATA, { data })
    },
    appendDiscovery5({ commit }, newData) {
        commit(types.APPENDDISDATA5, newData);
    },
    getNote5({ commit }, value) {
        commit(types.GETNOTE, { value })
    },
    clearData5({ commit }) {
        commit(types.CLEARDISDATA);
    },
    toggleItemSelection5({ commit, state }, { item, id }) {
        const currentlySelected = state.isSelected[id] || false;
        commit(types.SET_ITEM_SELECTION5, { id, selected: !currentlySelected });
    },
}

const mutations = {
    [types.INITDISDATA](state, { data }) {
        state.all = data
    },
    [types.APPENDDISDATA5](state, newData) {
        // TODO why this is not working?
        state.all.push(...newData);
    },
    [types.GETNOTE](state, { value }) {
        state.choosedNote = value
    },
    [types.CLEARDISDATA](state) {
        state.all = [];
        state.choosedNote = [];
    },
    [types.SET_ITEM_SELECTION5](state, { id, selected }) {
        Vue.set(state.isSelected, id, selected);
    }
}

export default {
    state,
    getters,
    actions,
    mutations,
}
