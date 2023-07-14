/**
 * 添加页面script脚本
 * @param src
 * @param to 路由对象
 * @param exclude 排除的列表
 * @returns {Promise}
 */
function addScriptFunc(src, to, exclude = []) {
  return new Promise(resolve => {
    // 预先移除script
    const head = document.getElementsByTagName('head')[0]
    head.childNodes.forEach(node => {
      if (node.src && ~node.src.indexOf(src)) {
        console.log(`script ${src} removed`)
        node.remove()
      }
    })
    // 大屏 或排除列表
    if (~(to.fullPath || '').indexOf('onemap') || (exclude.length && exclude.includes(src))) {
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = src
      head.appendChild(script)
      script.onload = () => {
        console.log(`script ${src} loaded`)
        resolve()
      }
    } else {
      resolve()
    }
  })
}

/**
 * 批量添加一张图页面脚本
 * @returns {Promise}
 */
function addOnemapScripts(to) {
  const scripts = [
    '/static/js/SuperMap.Include.js',
    '/static/js/SuperMap-7.1-11828.js',
    // '/static/3d/Build/Cesium/Cesium.js',
    // '/static/3d/Build/Cesium/ThirdParty/Workers/PlotAlgo/PlotAlgoInclude.js',
    // '/static/js/mapbox-gl-enhance.js',
    // '/static/js/iclient-mapboxgl-es6.min.js',
    '/static/js/liveplayer-element.min.js',
    '/static/js/httpRequest.js',
    '/static/js/jquery-3.6.0.min.js'
  ]
  // const excludeScripts = ['/static/3d/Build/Cesium/Cesium.js', '/static/3d/Build/Cesium/ThirdParty/Workers/PlotAlgo/PlotAlgoInclude.js']
  const promises = scripts.map(src => addScriptFunc(src, to))
  return new Promise(resolve => {
    Promise.all(promises).then(() => {
      resolve()
    })
  })
}

export {
  addScriptFunc,
  addOnemapScripts
}
