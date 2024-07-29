// 根据页数进行分页查询
export const getFeaturesBySQLData = async (
  {url, sql, datasetname, pagenum, pagesize}
) => {
  const sqlParam = new window.SuperMap.GetFeaturesBySQLParameters({
    queryParameter: {
      attributeFilter: sql
    },
    datasetNames: [datasetname],
    fromIndex: (pagenum - 1) * pagesize,
    toIndex: (pagesize - 1) + (pagenum - 1) * pagesize
  })
  return new Promise(resolve => {
    new window.mapboxgl.supermap.FeatureService(url).getFeaturesBySQL(sqlParam, (serviceResult) => {
      if (serviceResult && serviceResult.result) {
        resolve(serviceResult.result)
      } else {
        resolve({
          features: [],
          type: 'FeatureCollection'
        })
      }
    })
  })
}
// 根据经纬度服务查询
export const getFeaturesByPoint = async (
  {
    url,
    queryPolygonGeometry,
    sql,
    datasetname
  }
) => {
  let geometryParam = new window.SuperMap.GetFeaturesByGeometryParameters({
    datasetNames: [datasetname],
    geometry: queryPolygonGeometry,
    attributeFilter: sql,
    spatialQueryMode: 'WITHIN',
    fromIndex: 0,
    toIndex: 99999,
    maxFeatures: 100000
  })
  return new Promise(resolve => {
    new window.mapboxgl.supermap.FeatureService(url).getFeaturesByGeometry(
      geometryParam, (serviceResult )=> {
        if (serviceResult && serviceResult.result) {
          if (serviceResult.result.features.features.length > 0) {
            resolve(serviceResult.result.features.features)
          } else {
            resolve('')
          }
        } else {
          resolve('')
        }
      }
    )
  })
}
// 根据SQL服务查询
export const getFeaturesBySQL = async (
  {
    url,
    sql,
    datasetname
  }
) => {
  const sqlParam = new window.SuperMap.GetFeaturesBySQLParameters({
    queryParameter: {
      attributeFilter: sql
      //  fields: field
    },
    datasetNames: [datasetname],
    fromIndex: 0,
    toIndex: 99999,
    maxFeatures: 100000
  })
  return new Promise(resolve => {
    new window.mapboxgl.supermap.FeatureService(url).getFeaturesBySQL(sqlParam, (serviceResult) => {
      if (serviceResult && serviceResult.result) {
        resolve(serviceResult.result)
      } else {
        resolve({
          features: [],
          type: 'FeatureCollection'
        })
      }
    })
  })
}
// 根据空间范围查询叠加数据的内容
export const getFeaturesBySpaceSQL = async ({
                                              queryPolygonGeometry,
                                              datasetname,
                                              sql,
                                              url,
                                              pagenum,
                                              pagesize
                                            }) => {
  var geometryParam = new window.SuperMap.GetFeaturesByGeometryParameters({
    datasetNames: [datasetname],
    geometry: queryPolygonGeometry,
    attributeFilter: sql,
    spatialQueryMode: 'INTERSECT',
    fromIndex: pagenum?(pagenum - 1) * pagesize: 0,
    toIndex:pagenum? (pagesize - 1) + (pagenum - 1) * pagesize: 99999,
    maxFeatures: 100000
  });
  return new Promise(resolve => {
    new window.mapboxgl.supermap.FeatureService(url).getFeaturesByGeometry(
      geometryParam, (serviceResult) => {
        if (serviceResult && serviceResult.result) {
          if (serviceResult.result.features.features.length > 0) {
            resolve(serviceResult.result);
          } else {
            resolve('');
          }
        } else {
          resolve('');
        }
      }
    );
  })
}
// 根据返回字段和去除几何数据服务查询
export const getFeaturesSpecificFieldBySQL = async ({
                                                      url,
                                                      sql,
                                                      datasetname,
                                                      field
                                                    }) => {
  const sqlParam = new window.SuperMap.GetFeaturesBySQLParameters({
    queryParameter: {
      attributeFilter: sql,
      fields: field
    },
    hasGeometry: false,
    datasetNames: [datasetname],
    fromIndex: 0,
    toIndex: 99999,
    maxFeatures: 100000
  })
  return new Promise(resolve => {
    new window.mapboxgl.supermap.FeatureService(url).getFeaturesBySQL(sqlParam, (serviceResult) => {
      if (serviceResult && serviceResult.result) {
        resolve(serviceResult.result)
      } else {
        resolve({
          features: [],
          type: 'FeatureCollection'
        })
      }
    })
  })
}

// 获取地图服务临时图层
export const getTempLayersID = async ({
                                        LayerStatu,
                                        url
                                      }) => {
  return new Promise(resolve => {
    var setLayerStatusParameters = new window.SuperMap.SetLayerStatusParameters({
      layerStatusList: LayerStatu
    });
    var setLayerStatusService = new window.SuperMap.SetLayerStatusService(url, {
      eventListeners: {
        processCompleted: (...arg) => {
          resolve(arg)
        },
        processFailed: (...err) => {
          resolve(err)
        }
      }
    });
    setLayerStatusService.processAsync(setLayerStatusParameters);
  })
}
// 缓冲区分析
export const toSpatialanalyst = (options) => {
  const {geometryPolygon, Long} = options
  let distance = 0.1;
  if (Long >= 0 || Long != null) {
    distance = Long;
  }
  var params = new window.SuperMap.GeometryBufferAnalystParameters({
    sourceGeometry: geometryPolygon,
    sourceGeometrySRID: 4490,
    bufferSetting: new window.SuperMap.BufferSetting({
      endType: window.SuperMap.BufferEndType.ROUND,
      leftDistance: new window.SuperMap.BufferDistance({value: distance}),
      rightDistance: new window.SuperMap.BufferDistance({value: distance}),
      radiusUnit: "METER",
      semicircleLineSegment: 10
    }),
  });
  return new Promise(resolve => {
    // todo 换成实际服务地址
    new window.mapboxgl.supermap.SpatialAnalystService(`${window._CONFIG.VUE_APP_SUPERMAP_ISERVER}/services/spatialAnalysis-drainage/restjsr/spatialanalyst`).bufferAnalysis(
      params,
      (serviceResult) => {
        let dataFeature = serviceResult.result.resultGeometry;
        let lonLatArr = [];
        for (let k in dataFeature.geometry.coordinates[0][0]) {
          lonLatArr.push(dataFeature.geometry.coordinates[0][0][k][0], dataFeature.geometry.coordinates[0][0][k][1])
        }
        let features = {
          type: "Polygon",
          coordinates: dataFeature.geometry.coordinates[0]
        }
        resolve({features, lonLatArr})
      }
    )
  })
}

// 复杂的统计查询功能
export const getStatisticSql = (dataConfig)=>{
  const {url,sql,datasetName,field,queryPolygonGeometry} = dataConfig
  if(Object.keys(queryPolygonGeometry).length){
    const geometryParam = new window.SuperMap.GetFeaturesByGeometryParameters({
      datasetNames: [datasetName],
      geometry: queryPolygonGeometry,
      attributeFilter: sql,
      fields: field,
      spatialQueryMode: 'INTERSECT',
      fromIndex: 0,
      toIndex: 999,
      maxFeatures: 1000
    });
    return new Promise(resolve => {
      new window.mapboxgl.supermap.FeatureService(url).getFeaturesByGeometry(
        geometryParam, (serviceResult) => {
          if (serviceResult && serviceResult.result) {
            if (serviceResult.result.features.features.length > 0) {
              resolve(serviceResult.result);
            } else {
              resolve('');
            }
          } else {
            resolve('');
          }
        }
      );
    })
  }else{
    const sqlParam = new window.SuperMap.GetFeaturesBySQLParameters({
      queryParameter: {
        attributeFilter: sql,
        fields: field
      },
      datasetNames: [datasetName],
      fromIndex: 0,
      toIndex: 999,
      maxFeatures: 1000
    })
    return new Promise(resolve => {
      new window.mapboxgl.supermap.FeatureService(url).getFeaturesBySQL(sqlParam, (serviceResult) => {
        if (serviceResult && serviceResult.result) {
          resolve(serviceResult.result)
        } else {
          resolve({
            features: [],
            type: 'FeatureCollection'
          })
        }
      })
    })
  }
}