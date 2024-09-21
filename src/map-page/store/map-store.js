import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
  },
  state: {
    mapLoaded: false
  },
  mutations: {
    UPDATE_MAP_LOADED: (state, flag) => {
      state.mapLoaded = flag
    }
  },
  actions: {
    updateMapLoaded({ commit }, flag) {
      commit('UPDATE_MAP_LOADED', flag)
    }
  },
  getters: {
    mapLoaded: state => state.mapLoaded
  }
})
