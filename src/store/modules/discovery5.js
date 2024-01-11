import * as types from '../mutation-types'
import Vue from 'vue';

const state = {
    all: [],
    choosedNote: [],
    isSelected: {}
}

/* item format
{
   "id":"ihCSFbd",
   "img":"https://storage.googleapis.com/cryptitalk/uploaded_files/0xf05e75e42272ec60ba6157d647924fd2de7a9495/ihCSFbd_nft_media.png",
   "type":"post",
   "tokenReward":"none",
   "desc":"my post GG ININ DER",
   "comment":0,
   "like":0,
   "collect":20,
   "uname":"0xf05e75",
   "avator":"https://storage.googleapis.com/cryptitalk/uploaded_files/unna4med.png",
   "price":"",
   "adress":"",
   "time":"2024-01-03 02: 25: 14",
   "imgs":[
      "https://storage.googleapis.com/cryptitalk/uploaded_files/0xf05e75e42272ec60ba6157d647924fd2de7a9495/ihCSFbd_nft_media.png"
   ],
   "comments":[
      
   ],
   "alias":"0xf05e75",
   "status":"Active",
   "isVerified":"True",
   "links":"",
   "backers":"",
   "categories":"",
   "token":""
}
*/

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
    selectedItemsIdDescString: state => {
        return state.all
            .filter(item => state.isSelected[item.id]) // Filter only selected items
            .map(item => `${item.uname}: ${item.desc}`) // Map to create a string with 'id' and 'desc'
            .join("\n----\n"); // Join all items with "----\n"
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
    clearSelectedItems5({ commit }) {
        commit(types.CLEAR_SELECTED_ITEMS5);
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
    },
    [types.CLEAR_SELECTED_ITEMS5](state) {
        // Iterate over all keys in the isSelected object and set them to false
        Object.keys(state.isSelected).forEach(key => {
            Vue.set(state.isSelected, key, false);
        });
    },
}


export default {
    state,
    getters,
    actions,
    mutations,
}
