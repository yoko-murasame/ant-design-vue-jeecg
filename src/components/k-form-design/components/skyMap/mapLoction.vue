<template>
  <j-modal title="选择位置" :width="modalWidth" :visible="visible" :confirmLoading="confirmLoading" @ok="handleSubmit"
           @cancel="handleCancel" wrapClassName="j-depart-select-modal" switchFullscreen cancelText="关闭">
    <a-spin tip="Loading..." :spinning="false">
      <iframe :src="iframeUrl" name="iframe" frameborder="0" class="mapIframe"></iframe>
      <a-input placeholder="获取地图经纬度" type="text" onkeyup="value=value.replace(/[^0-9.,]/g,'')"
               v-model="lnglatStr" class="mapInput"/>
    </a-spin>
  </j-modal>
</template>

<script>
import { debounce } from 'lodash'

/**
 * 点模式
 * @type {string}
 */
export const MODE_POINT = 'point'
/**
 * 线模式
 * @type {string}
 */
export const MODE_LINE = 'line'
/**
 * 面模式
 * @type {string}
 */
export const MODE_POLYGON = 'polygon'

export default {
  name: 'mapLoction',
  props: ['modalWidth', 'mapUrl', 'mode', 'lnglatSplitChar', 'lnglatArrSplitChar'],
  data() {
    return {
      visible: false,
      confirmLoading: false,
      iframeUrl: '',
      lnglatStr: ''
    }
  },
  watch: {
    visible: {
      handler: 'initMap',
      deep: true,
      immediate: true
    }
  },
  created() {
    this.dbounceHandleMessage = debounce(this.handleMessage, 300)
    window.removeEventListener('message', this.dbounceHandleMessage)
  },
  methods: {
    initMap() {
      let baseUrl = process.env.VUE_APP_API_MAP_URL
      if (this.mapUrl) {
        baseUrl = this.mapUrl
      }
      // console.log('initMap', baseUrl, this.lnglatStr)
      //温州天地图
      if (this.lnglatStr) {
        this.iframeUrl = `${baseUrl}?lat=${this.lnglatStr.split(',')[1]}&lng=${this.lnglatStr.split(',')[0]}`
      } else {
        this.iframeUrl = baseUrl
      }
      window.addEventListener('message', this.dbounceHandleMessage, '*')
    },
    show() {
      this.visible = true
    },
    handleSubmit() {
      this.$emit("ok", this.lnglatStr)
      this.visible = false
    },
    handleCancel() {
      this.visible = false
    },
    /**
     * 接收地图经纬度
     *
     * @param { data }
     * {
     *   lnglatStr: '拼接后的经纬度字符串',
     *   address: '地名地址'
     * }
     */
    handleMessage({ data }) {
      // console.log('handleMessage', e)
      // 兼容一下老的数据
      if (e.data) {
        let loc = e.data[0]
        if (loc && loc.hasOwnProperty('lng')) {
          this.lnglatStr = `${loc.lng},${loc.lat}`
        }
        // 判断是不是数组，数组形式的拼接经纬度
        if (Array.isArray(loc) && loc.length === 2) {
          this.lnglatStr = `${loc[0]},${loc[1]}`
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.mapIframe {
  width: 100%;
  height: 500%;
  min-height: 500px;

}
</style>