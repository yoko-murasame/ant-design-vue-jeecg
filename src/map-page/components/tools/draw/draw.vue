<template>
  <div class="draw">
    <a-button size="default" @click="draw" style="margin-right: 1vh">开始绘制</a-button>
    <a-button size="default" @click="PostMessage">确认绘制</a-button>
  </div>
</template>
<script>
import DrawPolygon from '@/map-page/hook/drawPolygon'
import MeatureTool from '@/map-page/hook/measureTool'
import { cloneDeep } from 'lodash'
import { AddImage, AddPointServer, ResetMap } from '@/map-page/configs/MapApi'

export default {
  name: 'draw',
  data() {
    return {
      drawData: null
    }
  },
  mounted() {
    const that = this
    this.$bus.$on('getLayerSource', layerId => {
      window.map.getCanvas().style.cursor = ''
      let features = ''
      if (layerId) {
        features = window.map.queryRenderedFeatures({
          layers: [layerId]
        })
      }
      let coordinatesString = ''
      const type = this.$route.query.mode
      switch (type) {
        case 'line':
          let point = []
          let featureList = cloneDeep(features)
          featureList.sort((a, b) => a.id - b.id)
          const uniqueItems = Array.from(
            new Map(featureList.map((item) => [item.id, item])).values()
          )
          for (let k in uniqueItems) {
            for (let g in uniqueItems[k].geometry.coordinates) {
              point.push(uniqueItems[k].geometry.coordinates[g])
            }
          }
          const map = new Map(point.map((item) => [JSON.stringify(item), item]))
          const uniqueArray = Array.from(map.values())
          coordinatesString = uniqueArray.map((coord) => coord.join(',')).join(';')
          that.drawData = coordinatesString
          break
        case 'polygon':
          const feature = features[0]
          let pointList = feature.geometry.coordinates[0]
          coordinatesString = pointList.map((coord) => coord.join(',')).join(';')
          that.drawData = coordinatesString
          break
      }
    })

    this.$bus.$on('getPointLayer',(pointLngLat)=>{
      window.map.getCanvas().style.cursor = '';
      window.IsClick = false
      let point = {
        type: "FeatureCollection",
        features: [
          {
            geometry: {
              coordinates: pointLngLat,
              type: "Point",
            },
            id: 1,
            properties: {SMID: 1},
            type: "Feature",
          },
        ],
      };
      // 添加点图标
      AddImage('ClickPoint', 'point.png')
      // 添加点
      AddPointServer(window.map, 'ClickPoint',point, '', 'ClickPoint', '');
      that.drawData  = pointLngLat.join(',')
    })
  },
  methods: {
    draw() {
      ResetMap(window.map)
      const type = this.$route.query.mode
      console.log('绘制模式', type)
      window.map.getCanvas().style.cursor = 'url(supermap/image/draw.cur), auto'
      switch (type) {
        case 'point':
          window.IsClick = true
          break
        case 'line':
          let drawLine = new MeatureTool(window.map)
          drawLine.measureDistance('line')
          // 防止函数冲突
          drawLine.setDistance()
          break
        case 'polygon':
          let drawPolygons = new DrawPolygon(window.map)
          drawPolygons.drawPolygonPoint('polygon')
          // 防止函数冲突
          drawPolygons.setDrawPolygon()
          break
      }
    },
    PostMessage() {
      const that = this
      this.$confirm({
        title: '提示',
        content: '确定绘制完成了吗?',
        onOk: function() {
          if (that.drawData) {
            let dataConfig = {
              lnglatStr: that.drawData,
              address: ''
            }
            window.parent.postMessage(dataConfig, '*')
          } else {
            that.$message.info('请绘制相关点、线、面')
          }
        },
        onCancel: function() {
          that.$message.info('请绘制相关点、线、面')
        }
      })
    }
  }
}
</script>
<style scoped>
.draw {
  position: absolute;
  right: 5vh;
  top: 2vh;
  z-index: 999;
}
</style>