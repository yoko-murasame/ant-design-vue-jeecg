<template>
  <div class="container">
    <Query />
    <draw />
    <div id="map" class="map"></div>
  </div>
</template>
<script>
import draw from '@/map-page/components/tools/draw/draw.vue'
import Query from '@/map-page/components/tools/QueryAdress/Query.vue'
import { MapboxglInit } from '@/map-page/configs/MapApi'
import { MapLoadHandler } from './MapboxglHandler'

export default {
  name: 'Mapboxgl',
  components: {
    draw,
    Query
  },
  data() {
    return {}
  },
  beforeMount() {
    window.map = undefined
    window.IsClick = false
  },
  mounted() {
    window.map = MapboxglInit('map', 12) // 地图初始化
    // 监听地图初始化完成
    MapLoadHandler(window.map)
    // 调用事件
    this.eventRegsiter()
  },
  methods: {
    eventRegsiter() {
      this.$bus.$on('AddPoint', (sql) => {
        // todo
      })
    }
  }
}
</script>
<style lang="less" scoped>
.container {
  width: 100vw;
  height: 100vh;
  position: absolute;
  z-index: 1;

  .map {
    position: absolute;
    left: 0;
    right: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
    cursor: pointer;
  }
}
</style>