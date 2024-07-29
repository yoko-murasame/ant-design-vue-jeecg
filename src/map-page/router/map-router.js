import Vue from 'vue'
import Router from 'vue-router'
import MapView from '@/map-page/views/MapView.vue'

Vue.use(Router)

export default new Router({
  mode: 'hash', // 为了不影响主应用的history，这里采用hash模式
  base: process.env.BASE_URL,
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      path: '/',
      component: MapView
    },
    {
      path: '/404',
      component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
    }
  ]
})
