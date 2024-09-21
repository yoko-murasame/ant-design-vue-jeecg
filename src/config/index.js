/** init domain config */
import Vue from 'vue'
// 设置全局API_BASE_URL
Vue.prototype.API_BASE_URL = window._CONFIG.VUE_APP_API_BASE_URL ? window._CONFIG.VUE_APP_API_BASE_URL : process.env.VUE_APP_API_BASE_URL
window._CONFIG['domianURL'] = Vue.prototype.API_BASE_URL
// 单点登录地址
window._CONFIG['casPrefixUrl'] = window._CONFIG.VUE_APP_CAS_BASE_URL ? window._CONFIG.VUE_APP_CAS_BASE_URL : process.env.VUE_APP_CAS_BASE_URL
window._CONFIG['onlinePreviewDomainURL'] = window._CONFIG.VUE_APP_ONLINE_BASE_URL ? window._CONFIG.VUE_APP_ONLINE_BASE_URL : process.env.VUE_APP_ONLINE_BASE_URL
window._CONFIG['staticDomainURL'] = Vue.prototype.API_BASE_URL + '/sys/common/static'
window._CONFIG['pdfDomainURL'] = Vue.prototype.API_BASE_URL + '/sys/common/pdf/pdfPreviewIframe'
// 地图配置
window._CONFIG['VUE_APP_SUPERMAP_ISERVER'] = window._CONFIG.VUE_APP_SUPERMAP_ISERVER ? window._CONFIG.VUE_APP_SUPERMAP_ISERVER : process.env.VUE_APP_SUPERMAP_ISERVER
window._CONFIG['VUE_APP_MAP_SOURCE_URL'] = window._CONFIG.VUE_APP_MAP_SOURCE_URL ? window._CONFIG.VUE_APP_MAP_SOURCE_URL : process.env.VUE_APP_MAP_SOURCE_URL
window._CONFIG['VUE_APP_MAP_ANNOTATION_URL'] = window._CONFIG.VUE_APP_MAP_ANNOTATION_URL ? window._CONFIG.VUE_APP_MAP_ANNOTATION_URL : process.env.VUE_APP_MAP_ANNOTATION_URL
// window._CONFIG['VUE_APP_AMAP_KEY'] = window._CONFIG.VUE_APP_AMAP_KEY ? window._CONFIG.VUE_APP_AMAP_KEY : process.env.VUE_APP_AMAP_KEY // 这里没用，因为放在index的script中
// window._CONFIG['VUE_APP_AMAP_CODE'] = window._CONFIG.VUE_APP_AMAP_CODE ? window._CONFIG.VUE_APP_AMAP_CODE : process.env.VUE_APP_AMAP_CODE // 这里没用，因为放在index的script中