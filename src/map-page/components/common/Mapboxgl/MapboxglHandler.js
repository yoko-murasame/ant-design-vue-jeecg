import Vue from 'vue'

/**
 * 地图加载完成后执行
 * @constructor
 */
export const MapLoadHandler = (Map) => {
  Map.on('load', () => {
    console.log('初始化地图完成')
    // 添加地图监听服务
    MapHandler(Map)
    // 传参给界面,地图加载完成允许加载其他组件
    Vue.prototype.$bus.$emit("MapLoad", true);
  })
}

/**
 * 地图层级监听
 * @constructor
 */
export const MapHandler = (Map) => {
  // 层级变化监听
  Map.on("zoomend", (e) => {
    let zoomLevel = Map.getZoom();
  })
  Map.on('click',(e)=>{
    if(window.IsClick){
      Vue.prototype.$confirm({
        title: '提示',
        content: '确定定位在这里吗?',
        onOk () {
          let lngLat = e.lngLat;
          let coordinatesAry = [];
          coordinatesAry[0] = lngLat.lng;
          coordinatesAry[1] = lngLat.lat;
          Vue.prototype.$bus.$emit('getPointLayer',coordinatesAry)
        },
        onCancel () {
        }
      })
    }
  })
  // 地图鼠标移动监听
  Map.on('mousemove', (e) => {
    const lngLat = e.lngLat;
    // Vue.prototype.$bus.$emit("MouseMove", lngLat);
  })
}
/**
 * 地图点击事件
 * @param name
 * @constructor
 */
export const MapClickHandler = (Map, name) => {
  Map.on('click', name + "_layer", ClickEventCallback)
}
// 点击事件内容（要单独写出来,要不然off不能解绑事件）
export const ClickEventCallback = (e) => {
  let feature = e.features[0]
  if (feature) {
    feature.properties.clickPoint = feature.geometry.coordinates
  }
}
/**
 * 解绑点击事件
 * @param name
 * @constructor
 */
export const MapOffClickHandler = (Map, name) => {
  Map.off('click', name + "_layer", ClickEventCallback)
}