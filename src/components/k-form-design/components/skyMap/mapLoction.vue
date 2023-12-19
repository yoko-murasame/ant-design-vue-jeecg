<template>
  <j-modal title="选择位置" :width="modalWidth" :visible="visible" :confirmLoading="confirmLoading" @ok="handleSubmit"
           @cancel="handleCancel" wrapClassName="j-depart-select-modal" switchFullscreen cancelText="关闭">
    <a-spin tip="Loading..." :spinning="false">
      <iframe :src="iframeUrl" name="iframe" frameborder="0" class="mapIframe"></iframe>
      <!-- <a-input-search placeholder="搜索位置" enter-button="搜索" size="large" @search="onSearch" />
      <div id="map" class="map"></div> -->
      <a-input placeholder="获取地图经纬度" type="text" onkeyup="value=value.replace(/[^0-9.,]/g,'')"
               v-model="lnglatStr" class="mapInput"/>
    </a-spin>
  </j-modal>
</template>

<script>
// import MapInit from "./map.js"
import { debounce } from 'lodash'

export default {
  name: 'mapLoction',
  props: ['modalWidth', 'multi', 'rootOpened', 'mapUrl'],
  data() {
    return {
      visible: false,
      confirmLoading: false,
      searchValue: "",
      T: null,
      map: null,
      localsearch: null,
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
      window.addEventListener('message', debounce(this.handleMessage, 300), '*')

    },
    //地图点击获取经纬度
    getLngLat(e) {
      let lng = e.lnglat.getLng();
      let lat = e.lnglat.getLat()
      this.lnglatStr = `${lng},${lat}`;
      this.map.clearOverLays();
      var marker = new T.Marker(new T.LngLat(lng, lat));
      this.map.addOverLay(marker);

    },

    //使用地理编码接口获得坐标信息
    searchResult(result) {
      if (result.getStatus() == 0) {
        let location = result.getLocationPoint()
        this.map.panTo(location, 16);
        //创建标注对象
        var marker = new T.Marker(location);
        //向地图上添加标注
        this.map.addOverLay(marker);
        this.lnglatStr = `${location.lng},${location.lat}`
      } else {
        this.$message(result.getMsg());
      }

    },
    onSearch(value) {
      console.log(value);
      let geocoder = new T.Geocoder();
      geocoder.getPoint(value, this.searchResult);

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
    handleMessage(e) {
      // console.log('handleMessage', e)
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
.map {
  width: 100%;
  height: 100%;
  min-height: 100px;
  margin: 20px 0 20px 0;
}

.mapIframe {
  width: 100%;
  height: 500%;
  min-height: 500px;

}
</style>