/** init domain config */
import '../config'

import Vue from 'vue'
import MapApp from './MapApp.vue'
import Storage from 'vue-ls'
import router from './router/map-router'
import store from './store/map-store'
import { VueAxios } from '@/utils/request'

import Antd, { version } from 'ant-design-vue'
import 'ant-design-vue/dist/antd.less' // or 'ant-design-vue/dist/antd.less'
import '@/utils/filter' // base filter
import config from '@/defaultSettings'

import vueBus from '@/utils/vueBus'

console.log('ant-design-vue version:', version)

Vue.config.productionTip = false
Vue.use(Storage, config.storageOptions)
Vue.use(Antd)
Vue.use(VueAxios, router)
Vue.use(vueBus)

main()
function main() {
  new Vue({
    router,
    store,
    mounted () {
    },
    render: h => h(MapApp)
  }).$mount('#app')
}
