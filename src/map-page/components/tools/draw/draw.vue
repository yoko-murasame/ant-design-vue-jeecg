<template>
  <div class="draw">
    <a-button size="default" @click="draw" style="margin-right: 1vh">开始绘制</a-button>
    <!--<a-button size="default" @click="PostMessage">确认绘制</a-button>-->
    <a-button size="default" v-if="drawMode === 'point'" @click="GetAndCopyAddress">获取实际地址</a-button>
  </div>
</template>
<script>
import { wgs84togcj02 } from '@/map-page/components/tools/QueryAdress/point'
import DrawPolygon from '@/map-page/hook/drawPolygon'
import MeatureTool from '@/map-page/hook/measureTool'
import { cloneDeep } from 'lodash'
import { AddImage, AddPointServer, ResetMap } from '@/map-page/configs/MapApi'

export default {
  name: 'Draw',
  data() {
    return {
      drawData: null,
      address: ''
    }
  },
  created() {
    // 测试查询地址
    // const [lng, lat] = wgs84togcj02(120.717873, 28.018514)
    // this.QueryLocationFromLnglat(lng, lat)
  },
  computed: {
    // 当前绘制模式
    drawMode() {
      return this.$route.query.mode || 'point'
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

    this.$bus.$on('getPointLayer', (pointLngLat) => {
      window.map.getCanvas().style.cursor = ''
      window.IsClick = false
      let point = {
        type: 'FeatureCollection',
        features: [
          {
            geometry: {
              coordinates: pointLngLat,
              type: 'Point'
            },
            id: 1,
            properties: { SMID: 1 },
            type: 'Feature'
          }
        ]
      }
      // 添加点图标
      AddImage('ClickPoint', 'point.png')
      // 添加点
      AddPointServer(window.map, 'ClickPoint', point, '', 'ClickPoint', '')
      that.drawData = pointLngLat.join(',')
      // 直接传递消息
      that.PostMessage(false)
    })
  },
  methods: {
    // 国家2000转高德
    convert2000ToGaoDeLnglat(lng, lat) {
      if (!lng || !lat) {
        console.log('国家2000转高德-坐标转换测试', wgs84togcj02(120.717873, 28.018514))
      }
      return wgs84togcj02(lng, lat)
    },
    // 根据国家2000转高德 坐标查询地址
    QueryLocationFromLnglat(lng, lat) {
      if (!lng || !lat) {
        this.$message.error('请先选择坐标！')
        return Promise.resolve()
      }
      // 拿到 2000 坐标，转回高德
      const lngLat = this.convert2000ToGaoDeLnglat(lng, lat)
      const that = this
      const CopyToClipboard = function (address) {
        const el = document.createElement('textarea')
        el.value = address
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
        that.$message.success(`真实地址查询成功：${address}，已复制到剪切板！`)
      }
      return new Promise(resolve => {
        window.AMap.plugin('AMap.Geocoder', () => {
          const geocoder = new window.AMap.Geocoder({
            city: '温州', // 城市设为北京，默认：“全国”
            radius: 500 // 范围，默认：500
          })
          geocoder.getAddress(lngLat, function(status, result) {
            if (status === 'complete' && result.regeocode) {
              var address = result.regeocode.formattedAddress
              console.log('经纬度查询成功', address)
              // 复制到剪切板
              CopyToClipboard(address)
              that.address = address
              // 直接传递消息
              that.PostMessage(false)
              resolve(address)
            } else {
              console.error('根据经纬度查询地址失败', status, result)
              that.$message.error('根据经纬度查询地址失败')
              resolve()
            }
          })
        })
      })
    },
    async GetAndCopyAddress() {
      if (!this.drawData || !this.drawData.trim()) {
        this.$message.info('请先绘制点！')
        return
      }
      if (this.drawMode !== 'point') {
        this.$message.info('请选择绘制点模式')
        return
      }
      const [lng, lat] = this.drawData.split(';')[0].split(',')
      const address = await this.QueryLocationFromLnglat(Number(lng), Number(lat))
      this.address = address
      return address
    },
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
    PostMessage(confirm = true) {
      const that = this
      const callbackOk = function() {
        if (that.drawData) {
          let dataConfig = {
            lnglatStr: that.drawData,
            address: that.address
          }
          window.parent.postMessage(dataConfig, '*')
        } else {
          that.$message.info('请绘制相关点、线、面')
        }
      }
      if (!confirm) {
        callbackOk()
        return
      }
      this.$confirm({
        title: '提示',
        content: '确定绘制完成了吗?',
        onOk: callbackOk,
        onCancel: function() {
          // that.$message.info('请绘制相关点、线、面')
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
