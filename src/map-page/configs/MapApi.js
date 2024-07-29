//添加地图图层
import { MapOffClickHandler } from '@/map-page/components/common/Mapboxgl/MapboxglHandler'
import { AddAlpha } from '@/map-page/utils/AddAlpha'
import { getLayerName } from '@/map-page/configs/IserverApi'
import { getTempLayersID } from '@/map-page/configs/MapQueryApi'
import useFileHome from '@/map-page/utils/pub-use'

// 地图初始化
export const MapboxglInit = (mapId, mapZoom) => {
  return new window.mapboxgl.Map({
    container: mapId,
    crs: 'EPSG:4490',
    style: {
      version: 8,
      sources: {
        map_source: {
          type: 'raster',
          tiles: [window._CONFIG.VUE_APP_MAP_SOURCE_URL],
          tileSize: 256
        },
        annotation_source: {
          type: 'raster',
          tiles: [window._CONFIG.VUE_APP_MAP_ANNOTATION_URL],
          tileSize: 256
        }
      },
      glyphs: 'https://iserver.supermap.io/iserver/services/map-world/rest/maps/World/tileFeature/sdffonts/{fontstack}/{range}.pbf',
      layers: [
        {
          id: 'map_layer',
          name: 'map_layer',
          type: 'raster',
          source: 'map_source',
          minzoom: 6,
          maxzoom: 22
        },
        {
          id: 'annotation_layer',
          name: 'annotation_layer',
          type: 'raster',
          source: 'annotation_source',
          minzoom: 6,
          maxzoom: 22
        }
      ]
    },
    center: [120.672287, 27.99],
    minZoom: 6,
    maxZoom: 26,
    zoom: mapZoom
  })
}


// 地图放大
export const MapzoomIn = (Map) => {
  Map.zoomIn({ duration: 1000 })
}
// 地图缩小
export const MapzoomOut = (Map) => {
  Map.zoomOut({ offset: [80, 60] })
}
//地图放大移动
export const MapMove = (Map, zoom, mapCenter) => {
  Map.setZoom(zoom)
  Map.flyTo({
    center: mapCenter
  })
}
/**
 * iserver 地图服务叠加
 * @param Map  地图
 * @param type
 * @param url  地图服务地址
 * @param alias 名称
 * @param minzoomed  最小层级
 * @param maxzoomed  最大层级
 * @param LayerName  叠加在LayerName图层之下
 * @constructor
 */
export const AddLineOrPolygonFromServer = (Map, type, url, alias, minzoomed, maxzoomed, LayerName) => {
  if (Map.getLayer(alias + '_layer')) {
    Map.removeLayer(alias + '_layer')
  }
  if (Map.getSource(alias + '_source')) {
    Map.removeSource(alias + '_source')
  }
  if (type === 'iserver') {
    Map.addSource(alias + '_source', {
      type: 'raster',
      tiles: [url],
      tileSize: 256,
      rasterSource: 'iserver'
    })
  } else {
    Map.addSource(alias + '_source', {
      type: 'raster',
      tiles: [url],
      tileSize: 256
    })
  }

  if (LayerName) {
    Map.addLayer({
      id: alias + '_layer',
      type: 'raster',
      source: alias + '_source',
      minzoom: minzoomed || 0,
      maxzoom: maxzoomed || 20
    }, LayerName)
  } else {
    Map.addLayer({
      id: alias + '_layer',
      type: 'raster',
      source: alias + '_source',
      minzoom: minzoomed || 0,
      maxzoom: maxzoomed || 20
    })
  }
}
// 添加图片
export const AddImage = (name, url) => {
  let img_url = useFileHome('@/map-page/img/point/' + url)
  // console.log('img_url', img_url)
  window.map.loadImage(img_url,
    (error, image) => {
      if (!window.map.hasImage(name + '_point')) {
        window.map.addImage(name + '_point', image)
      }
    }
  )
}
// 添加点
export const AddPointServer = (Map, alias, features, Pointimage, PictureName, Config) => {
  let sourceId = alias + '_source'
  let PointLayer = alias + '_layer'
  // 对数据源的处理
  if (!Map.getSource(sourceId)) {
    // 添加源
    Map.addSource(sourceId, {
      type: 'geojson',
      data: features
    })
  } else {
    // 修改源
    Map.getSource(alias + '_source').setData(features)
  }
  // 对原点图层的处理
  if (Map.getLayer(PointLayer)) {
    // 移除原图层
    MapOffClickHandler(Map, alias)
    Map.removeLayer(PointLayer)
  }
  // 添加新的点名称
  Map.addLayer({
    id: PointLayer,
    type: 'symbol',
    source: sourceId,
    layout: {
      'icon-image': Pointimage || PictureName + '_point',
      'icon-size': 0.5,
      'icon-allow-overlap': true
    }
  })

}
//添加点label图层
export const AddPointLabel = (Map, alias, field, offset, color) => {
  if (Map.getLayer(alias + '_LabelLayer')) {
    Map.removeLayer(alias + '_LabelLayer')
  }
  Map.addLayer({
    id: alias + '_LabelLayer',
    type: 'symbol',
    source: alias + '_source',
    layout: {
      'text-field': field,
      // "text-font": ["DIN Offc Pro Bold", "Arial Unicode MS Bold"],
      'text-font': ['Microsoft YaHei Regular'],
      'text-offset': offset,
      'text-size': 14,
      'text-max-width': 18
    },
    paint: {
      'text-color': color
      // "text-halo-width": 0.1,
      // "text-halo-color": "rgba(0, 0, 0, 1)",
    }
  })
}
/**
 * 添加线
 * @param Map
 * @param features
 * @param LayerName
 * @param color
 * @param LineWidth
 * @param dasharray
 * @param MinZoomed
 * @param MaxZoomed
 * @constructor
 */
export const AddLine = (Map, features, LayerName, color, LineWidth, dasharray, MinZoomed, MaxZoomed) => {
  //清空高亮图层
  if (Map.getLayer(LayerName + '_layer')) {
    Map.removeLayer(LayerName + '_layer')
  }
  if (Map.getSource(LayerName + '_source')) {
    Map.removeSource(LayerName + '_source')
  }
  //获取数据绘制图层
  Map.addSource(LayerName + '_source', {
    type: 'geojson',
    data: features
  })
  // 绘制线
  Map.addLayer({
    id: LayerName + '_layer',
    type: 'line',
    source: LayerName + '_source',
    paint: {
      'line-color': color /* 填充的颜色 */,
      'line-width': LineWidth /* 边框 */,
      'line-dasharray': dasharray // 虚线的距离 [1] 实线 [2,4] 虚线
    },
    minzoom: MinZoomed || 0,
    maxzoom: MaxZoomed || 20
  })
}
/**
 * 添加面
 * @param Map
 * @param features
 * @param LayerName
 * @param data
 * @constructor
 */
export const AddPolygon = (Map, features, LayerName, data) => {
  //清空高亮图层
  if (Map.getLayer(LayerName + '_layer')) {
    Map.removeLayer(LayerName + '_layer')
  }
  if (Map.getLayer(LayerName + '_Line_layer')) {
    Map.removeLayer(LayerName + '_Line_layer')
  }
  if (Map.getSource(LayerName + '_source')) {
    Map.removeSource(LayerName + '_source')
  }
  //获取数据绘制高亮图层
  Map.addSource(LayerName + '_source', {
    type: 'geojson',
    data: features
  })
  let color = []
  if (data.sceneColor) {
    color.push(AddAlpha(data.sceneColor, 0.25))
    color.push(data.sceneColor)
  }
  // 绘制填充面 (不为镂空的情况添加填充面)
  if (data.faceHollow === '否') {
    Map.addLayer({
      id: LayerName + '_layer',
      type: 'fill',
      source: LayerName + '_source',
      paint: {
        'fill-color': color[0],
        'fill-outline-color': color[1]
      },
      minzoom: data.minLevel || 0,
      maxzoom: data.maxLevel || 20
    })
  }
  // 绘制面的范围线 (范围线的问题)
  if (data.faceLine === '是') {
    Map.addLayer({
      id: LayerName + '_Line_layer',
      type: 'line',
      source: LayerName + '_source',
      paint: {
        'line-color': color[1] /* 填充的颜色 */,
        'line-width': data.lineWidth /* 边框 */
      },
      minzoom: data.minLevel || 0,
      maxzoom: data.maxLevel || 20
    })
  }
}
/**
 * 临时图层叠加
 * @param Map
 * @param url
 * @param alias
 * @param sql
 * @param minzoomed
 * @param maxzoomed
 * @param LayerName
 */
export const getLayersInfoCompleted = async (Map, url, alias, sql, minzoomed, maxzoomed, LayerName) => {
  let LayerStatu = []
  // 获取服务子图层
  let LayerData = await getLayerName(url)
  let Layers = LayerData.data.subLayers.layers
  for (let i in Layers) {
    let layerStatus = new window.SuperMap.LayerStatus({
      layerName: Layers[i].name, // 子图层名称
      isVisible: true,
      displayFilter: sql // 筛选条件
    })
    LayerStatu.push(layerStatus)
  }
  let config = {
    LayerStatu: LayerStatu,
    url: url
  }
  // 获取临时图层ID
  let LayerID = await getTempLayersID(config)
  // 叠加临时图层
  if (Map.getLayer(alias + '_layer')) {
    Map.removeLayer(alias + '_layer')
  }
  if (Map.getSource(alias + '_source')) {
    Map.removeSource(alias + '_source')
  }
  Map.addSource(alias + '_source', {
    type: 'raster',
    tiles: [url + '?layersID=' + LayerID[0].result.newResourceID],
    tileSize: 256,
    rasterSource: 'iserver'
  })
  if (LayerName) {
    Map.addLayer({
      id: alias + '_layer',
      type: 'raster',
      source: alias + '_source',
      minzoom: minzoomed || 0,
      maxzoom: maxzoomed || 20
    }, LayerName)
  } else {
    Map.addLayer({
      id: alias + '_layer',
      type: 'raster',
      source: alias + '_source',
      minzoom: minzoomed || 0,
      maxzoom: maxzoomed || 20
    })
  }
}
/**
 * 叠加子图层
 * @param Map
 * @param url
 * @param alias
 * @param LayerStatu
 * @param LayerName
 * @param minZoomed
 * @param maxZoomed
 */
export const getSublayerAdd = async (Map, url, alias, LayerStatu, LayerName, minZoomed, maxZoomed) => {
  let Sublayerconfig = {
    LayerStatu: LayerStatu,
    url: url
  }
  console.log('Sublayerconfig', Sublayerconfig)
  // 获取临时图层ID
  let LayerID = await getTempLayersID(Sublayerconfig)
  // 移除之前的图层
  if (Map.getLayer(alias + '_layer')) {
    Map.removeLayer(alias + '_layer')
  }
  if (Map.getSource(alias + '_source')) {
    Map.removeSource(alias + '_source')
  }
  console.log('获取临时图层ID', LayerID)
  // 叠加临时图层
  Map.addSource(alias + '_source', {
    type: 'raster',
    tiles: [url + '?layersID=' + LayerID[0].result.newResourceID],
    tileSize: 256,
    rasterSource: 'iserver'
  })
  if (LayerName) {
    Map.addLayer({
      id: alias + '_layer',
      type: 'raster',
      source: alias + '_source',
      minzoom: minZoomed || 0,
      maxzoom: maxZoomed || 20
    }, LayerName)
  } else {
    Map.addLayer({
      id: alias + '_layer',
      type: 'raster',
      source: alias + '_source',
      minzoom: minZoomed || 0,
      maxzoom: maxZoomed || 20
    })
  }
}
// 移除地图服务
export const RemoveMapServer = (Map, LayerName) => {
  if (Map.getLayer(LayerName)) {
    Map.removeLayer(LayerName)
  }
}
/**
 * 删除图层
 * @param map
 * @param layerName
 * @constructor
 */
export const removeLayerAll = (map, layerName) => {
  // 删除一般图层
  if (map.getLayer(layerName + '_layer')) {
    map.removeLayer(layerName + '_layer')
  }
  // 删除文字图层
  if (map.getLayer(layerName + '_LabelLayer')) {
    map.removeLayer(layerName + '_LabelLayer')
  }
  // 删除线或者面图层
  if (map.getLayer(layerName + '_Line_layer')) {
    map.removeLayer(layerName + '_Line_layer')
  }
  // 删除数据源
  if (map.getSource(layerName + '_source')) {
    map.removeSource(layerName + '_source')
  }
}

export const ResetMap = (Map) => {
  // // 只重置中心点
  // Map.setCenter([120.672287, 27.99]);
  // // 只重置缩放级别
  // Map.setZoom(12);
  // 移除自定义图层（不包括底图的默认图层）
  Map.getStyle().layers.forEach((layer) => {
    if (layer.id !== 'map_layer' && layer.id !== 'annotation_layer') {
      Map.removeLayer(layer.id)
    }
  })
  // 移除添加的数据源
  Object.keys(Map.getStyle().sources).forEach((source) => {
    if (source !== 'map_source' && source !== 'annotation_source') {
      Map.removeSource(source)
    }
  })
  // 移除标记
  if (Map.markers) {
    Map.markers.forEach((marker) => {
      marker.remove()
    })
  }
  // 移除弹出窗口
  if (Map.popups) {
    Map.popups.forEach((popup) => {
      popup.remove()
    })
  }

  const elementsWithMyClass = document.querySelectorAll('.measure-result')
  if (elementsWithMyClass.length) {
    elementsWithMyClass.forEach(element => {
      element.remove()
    })
  }
  const dom = document.querySelectorAll('.polygon-result')
  const len = dom.length
  if (len) {
    for (let i = len - 1; i >= 0; i--) {
      if (dom[i]) dom[i].remove()
    }
  }

}
