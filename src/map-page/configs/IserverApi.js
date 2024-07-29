import Vue from 'vue'

export const getLayerName = (url)=>{
  let name = url.split('/rest/maps')[1]
  return Vue.prototype.$myRequest.request({
    baseURL: '',
    method: 'get',
    url: url+'/layers'+name+'.rjson'
  })
}
