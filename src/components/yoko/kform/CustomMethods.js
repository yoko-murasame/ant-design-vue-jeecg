import store from '@/store'
import axios from 'axios'
import Vue from 'vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import moment from 'moment'
import { getAction, httpAction, postAction, putAction } from '@api/manage'

let apiBaseUrl = window._CONFIG['domianURL'] || '/jeecg-boot';

/**
 * 自定义请求
 * @type {AxiosInstance}
 */
const myRequest = axios.create({
  baseURL: apiBaseUrl
})

myRequest.interceptors.request.use(config => {
  const token = Vue.ls.get(ACCESS_TOKEN)
  if (token) {
    config.headers['X-Access-Token'] = token // 让每个请求携带自定义 token 请根据实际情况自行修改
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

myRequest.interceptors.response.use((response) => {
  const { data } = response
  switch (data.code) {
    case 500:
      return Promise.reject(data.message)
  }
  return data
}, () => {})

/**
 * 获取当前用户真实姓名
 * @returns {any}
 */
export const getCurrentRealname = () => {
  return Promise.resolve(store.getters.nickname)
}

/**
 * 根据orgCode获取部门信息
 * @param orgCodes
 * @returns {Promise<*>}
 */
export const getDepartmentByOrgCode = async (orgCodes) => {
  const depart = await myRequest({
    url: '/sys/api/queryDepartsByOrgcodes',
    method: 'get',
    params: { orgCodes }
  })
  console.log('获取当前部门', depart)
  return depart
}

/**
 * 获取当前登陆用户的部门对象
 * @returns {Promise<*>}
 */
export const getCurrentDepartment = async () => {
  console.log('getCurrentDepartment', store.getters.userInfo, store.getters.userInfo.orgCode)
  const depart = await getDepartmentByOrgCode(store.getters.userInfo.orgCode)
  return depart[0]
}

/**
 * 获取当前日期
 * @param format 格式化字符串 默认 YYYY-MM-DD
 * @returns {string}
 */
export const getCurrentDate = (format = 'YYYY-MM-DD') => {
  return Promise.resolve(moment().format(format))
}

/**
 * 获取在线表单列表数据，同online列表接口，支持搜索参数和分页
 * @param onlineCode online表单配置地址的code
 * @param params 搜索参数，如：{name:'张三'}，分页也在这里
 * @returns {Promise<*>}
 */
export const getOnlineDataList = async (onlineCode, params = {}) => {
  if (!onlineCode) {
    throw new Error('onlineCode不能为空')
  }
  params.needList = 'id'
  params.pageSize = params.pageSize || 10
  params.pageNo = params.pageNo || 1
  const { result, success, message } = await getAction('/online/cgform/api/getData/' + onlineCode, params)
  !success && Vue.prototype.$message.error(message)
  return result
}

/**
 * 获取表单数据
 * @param id 主键
 * @param tableName 表名
 * @returns {Promise<*>}
 */
export const getFullFormData = async (id, tableName) => {
  if (!id) {
    throw new Error('id不能为空')
  }
  if (!tableName) {
    throw new Error('tableName不能为空！')
  }
  const { result, success, message } = await getAction(`/online/cgform/api/form/table_name/${tableName}/${id}`)
  !success && Vue.prototype.$message.error(message)
  return result
}

/**
 * 更新表单数据
 * @param code online表单的配置地址中的code
 * @param data 表单数据
 * @returns {Promise<*>}
 */
export const updateFormData = async (code, data) => {
  if (!data.id) {
    return
  }
  // 需要剔除空字符串的值，防止日期字段报错
  const convert = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        convert(obj[key]); // 递归处理嵌套对象
      } else if (obj[key] === '') {
        obj[key] = null; // 将空字符串转换为 null
      }
    }
  }
  convert(data)
  const { success, message, result } = await putAction('/online/cgform/api/form/' + code, data)
  !success && Vue.prototype.$message.error(message)
  return result
}

/**
 * 通过模板发送消息
 * @param fromUser 发送人，留空自动获取当前用户名
 * @param toUser 接收人，多个用户名使用逗号分隔
 * @param title 消息标题
 * @param templateCode 模板编码
 * @param formData 模板参数，表单数据
 * @param THIRD_APP_TYPE 第三方消息推送类型，可选值： DINGTALK、WECHAT_ENTERPRISE、ALL，不传都不推送
 * @param THIRD_APP_TYPE 第三方消息推送类型，可选值： DINGTALK、WECHAT_ENTERPRISE、ALL，不传都不推送
 * @param msgAbstract 消息摘要，可选
 * @returns {Promise<*>}
 */
export const sendTemplateAnnouncement = async (fromUser, toUser, title, templateCode, formData, THIRD_APP_TYPE, msgAbstract) => {
  fromUser = fromUser || store.getters.username
  if (!toUser) {
    throw new Error('toUser不能为空，多个用户名使用逗号分隔！')
  }
  if (!title) {
    throw new Error('title不能为空')
  }
  if (!templateCode) {
    throw new Error('templateCode不能为空')
  }
  if (!formData) {
    throw new Error('formData不能为空')
  }
  // 消息接口无返回值
  try {
    await postAction(`/sys/api/sendTemplateAnnouncement?THIRD_APP_TYPE=${THIRD_APP_TYPE}`, {
      fromUser,
      toUser,
      title,
      templateCode,
      templateParam: formData,
      msgAbstract
    })
    Vue.prototype.$message.success('发送成功')
  } catch (e) {
    Vue.prototype.$message.error(err)
  }
}

/**
 * 根据规则编码生成编码
 * @param ruleCode 规则编码
 * @param formData 表单数据，可选
 * @returns {Promise<*>}
 */
export const generateCodeByRule = async (ruleCode, formData = {}) => {
  const { result } = await putAction(`/sys/fillRule/executeRuleByCode/${ruleCode}`, formData)
  return result
}

/**
 * 保存业务几何数据到超图空间表
 * @param mode 模式(point、line、polygon)
 * @param formData 业务表单数据
 * @param businessIdField 业务主键字段
 * @param businessIdFieldInSupermap 空间表关联的业务主键字段
 * @param iserverFeaturesUrl 空间表服务地址，e.g. http://localhost:8090/iserver/services/data-GJDW/rest/data/datasources/GJDW/datasets/region_test/features
 * @param coordinatesStr 坐标串（来自天地图组件的返回结果）
 * @param debug 调试模式，默认false
 * @param throwError 抛出错误，默认false
 * @param lnglatSplitChar 坐标串经纬度分隔符，默认逗号
 * @param lnglatArrSplitChar 坐标串经纬度数组分隔符，默认分号
 * @returns {Promise<void>}
 */
export const saveBusinessGeometryDataToSupermapFeatures = async (
  {
    mode,
    formData,
    businessIdField,
    businessIdFieldInSupermap,
    iserverFeaturesUrl,
    coordinatesStr,
    debug,
    throwError,
    lnglatSplitChar,
    lnglatArrSplitChar
  }
) => {
  // 参数预处理
  if (!mode) {
    throw new Error('模式(mode)为空（point、line、polygon），请检查！')
  }
  if (!formData) {
    throw new Error('表单数据(formData)为空，请检查！')
  }
  businessIdField = businessIdField || 'id'
  const businessId = formData[businessIdField]
  if (!businessId) {
    throw new Error(`表单数据(formData)中没有${businessIdField}字段，或者业务主键值为空，请检查！`)
  }
  if (!businessIdFieldInSupermap) {
    throw new Error('超图空间表关联的业务主键字段(businessIdFieldInSupermap)为空，请检查！')
  }
  businessIdFieldInSupermap = businessIdFieldInSupermap.toUpperCase()
  if (!iserverFeaturesUrl) {
    throw new Error('超图空间表服务地址(iserverFeaturesUrl)为空，请检查！备注：精确到features')
  }
  if (!coordinatesStr) {
    throw new Error('坐标串(coordinatesStr)为空，请检查！')
  }
  debug = debug || false
  throwError = throwError || false
  lnglatSplitChar = lnglatSplitChar || ','
  lnglatArrSplitChar = lnglatArrSplitChar || ';'
  // url处理
  if (!~iserverFeaturesUrl.lastIndexOf('json')) {
    if (!~iserverFeaturesUrl.lastIndexOf('features')) {
      throw new Error('超图空间表服务地址(iserverFeaturesUrl)格式错误，请检查！示例：' +
        'http://localhost:8090/iserver/services/data-GJDW/rest/data/datasources/GJDW/datasets/region_test/features')
    }
    iserverFeaturesUrl = iserverFeaturesUrl + '.rjson'
  }
  const deleteUrl = `${iserverFeaturesUrl}?_method=DELETE&deleteMode=SQL`
  const addUrl = `${iserverFeaturesUrl}`

  try { // 先删除对应关联的空间数据
    const delRes = await myRequest({
      baseURL: '',
      url: deleteUrl,
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
      data: { 'attributeFilter': `${businessIdFieldInSupermap} like '${businessId}'` } // 这个根据业务主键删除，需要和超图空间表协商
    })
    debug && console.log('删除超图空间表数据结果：', delRes)
    if (!delRes.succeed) {
      Vue.prototype.$message.error('删除超图空间数据失败，请检查超图配置！')
      return
    }
    // 处理业务数据字段
    const fieldNames = []
    const fieldValues = []
    Object.keys(formData).forEach((key) => {
      if (key === businessIdField) {
        fieldNames.push(businessIdFieldInSupermap)
        fieldValues.push(businessId)
      } else {
        fieldNames.push(key.toUpperCase())
        fieldValues.push(formData[key])
      }
    })
    // 处理空间数据
    const points = coordinatesStr.split(lnglatArrSplitChar).map(coord => {
      let [x, y] = coord.split(lnglatSplitChar)
      x = Number.parseFloat(x)
      y = Number.parseFloat(y)
      return { x, y }
    })
    const geometry = {
      type: mode === 'point' ? 'POINT' : (mode === 'line' ? 'LINE' : 'REGION'),
      points
    }
    // 新增的数据结构
    const geometryResult = [
      {
        fieldNames,
        fieldValues,
        geometry
      }
    ]
    // 新增
    const addRes = await myRequest({
      baseURL: '',
      url: addUrl,
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
      data: geometryResult
    })
    debug && console.log('超图新增孔家数据', geometryResult, addRes)
    if (!addRes.succeed) {
      Vue.prototype.$message.error('超图服务空间数据添加失败，请检查超图配置！')
      return
    }
    Vue.prototype.$message.success('超图服务空间数据添加成功！')
  } catch (e) {
    if (throwError) {
      throw e
    } else {
      console.error(e)
    }
  }
}

/**
 * 根据用户名获取用户信息
 * @param username
 */
export const getUserByUsername = (username) => {
  return getAction('/sys/api/getUserByName', { username })
}

/**
 * 自定义方法名称
 * @type {string[]}
 */
export const methodsFunc = [
  getCurrentRealname, getDepartmentByOrgCode, getCurrentDepartment,
  getCurrentDate, myRequest, getFullFormData, getOnlineDataList,
  updateFormData, sendTemplateAnnouncement, generateCodeByRule,
  saveBusinessGeometryDataToSupermapFeatures,
  getUserByUsername
]

export const methodsNames = [
  'getCurrentRealname', 'getDepartmentByOrgCode', 'getCurrentDepartment',
  'getCurrentDate', 'myRequest', 'getFullFormData', 'getOnlineDataList',
  'updateFormData', 'sendTemplateAnnouncement', 'generateCodeByRule',
  'saveBusinessGeometryDataToSupermapFeatures',
  'getUserByUsername'
]

/**
 * 创建异步函数
 * @param ref 目标vue对象
 * @param funStr 函数字符串
 * @param customArgsName 自定义上下文方法名称（可选）
 * @param customArgsObj 自定义上下文方法对象（可选）
 * @returns {*}
 */
export const createAsyncJsEnhanceFunction = (ref, funStr, customArgsName = [], customArgsObj = []) => {
  const that = ref
  // console.log('createAsyncJsEnhanceFunction', methodsFunc, methodsNames, customArgsObj, customArgsName)
  // const funStr = 'await testAsync();console.log("testEnhance", this, getAction, that);'
  // 实现异步函数包裹，唯一解决方案
  // const asyncFunStr = `(async myFunc() {try{${funStr}}catch(e){Vue.prototype.$message.error('JS增强代码执行失败'+e);throw e;}})()`
  // const argsText = ['that', 'getAction', 'postAction', 'putAction', 'httpAction', ...methodsNames, ...customArgsName, asyncFunStr]
  // const argsBind = [ref, that, getAction, postAction, putAction, httpAction, ...methodsFunc, ...customArgsObj]
  // const fun = new Function(...argsText)
  // console.log("fun", fun.toString())
  // return fun.bind(...argsBind)
  // 新版本异步执行解决方案，支持抛出异常，支持Promise返回值
  const argsText = ['that', 'getAction', 'postAction', 'putAction', 'httpAction', ...methodsNames, ...customArgsName]
  const argsBind = [that, getAction, postAction, putAction, httpAction, ...methodsFunc, ...customArgsObj]
  const myFunc = async function (){
    try {
      const _arguments = arguments
      const paramStr = argsText.reduce((str, arg, index) => {
        return `${str}let ${arg} = _arguments[${index}];\n`;
      }, '\n');
      if (!funStr || !funStr.trim()) {
        return Promise.reject('JS增强代码不能为空')
      }
      // eslint-disable-next-line no-eval
      return eval(`(async function(_arguments) {${paramStr}${funStr}\n}).call(ref, _arguments)`);
    } catch (e) {
      Vue.prototype.$message.error('JS增强代码执行失败 ' + e)
      throw e
    }
  }
  return myFunc.bind(ref, ...argsBind)
}

/**
 * 初始化js增强的监听器
 * @param watcherJsStr Vue2的监听属性里怎么写就怎么写
 * @param code 表单code
 * @param cacheMap 缓存的监听器Map<code, Array<UnWatchedApi>>
 * @param vm vue对象
 */
export const createVue2Watcher = (watcherJsStr, code, cacheMap, vm) => {
  if (!watcherJsStr) {
    return
  }
  try {
    // eslint-disable-next-line no-eval
    const WatcherFun = eval(`(function(){return {${watcherJsStr}}})`)
    const WatcherObject = new WatcherFun()

    // 当前online表单存在的监听器先取消
    Object.keys(cacheMap).forEach(key => {
      const unWatchedApi = cacheMap[key]
      if (unWatchedApi && unWatchedApi.length) {
        unWatchedApi.forEach(func => func())
      }
    })
    if (!cacheMap[code]) {
      cacheMap[code] = []
    }
    // 依次注册到Vue
    Object.keys(WatcherObject).forEach(key => {
      const func = WatcherObject[key]
      // 函数形式直接注册
      if (typeof func === 'function') {
        // 校验是否是当前online的监听器
        const preCheckWrapper = `(async function(nv, ov){console.log('js增强监听器增强::判断是否执行监听,当前表单code:', this.code, '注册的code:', '${code}');if(this.code !== '${code}'){return}return await func.bind(vm)(nv, ov)})`
        // eslint-disable-next-line no-eval
        const wrapperFunc = eval(preCheckWrapper)
        console.log('初始化监听器', key)
        const unWatched = vm.$watch('queryParam.company', wrapperFunc)
        cacheMap[code].push(unWatched)
      }
      if (typeof func === 'object') {
        if (func.hasOwnProperty('handler')) {
          const { handler, deep, immediate } = func
          // 校验是否是当前online的监听器
          const preCheckWrapper = `(async function(nv, ov){console.log('js增强监听器增强::判断是否执行监听,当前表单code:', this.code, '注册的code:', '${code}');if(this.code !== '${code}'){return}return await handler.bind(vm)(nv, ov)})`
          // eslint-disable-next-line no-eval
          const wrapperFunc = eval(preCheckWrapper)
          console.log('初始化监听器', key)
          const unWatched = vm.$watch('queryParam.company', wrapperFunc, {
            deep: deep || false,
            immediate: immediate || false
          })
          cacheMap[code].push(unWatched)
        }
      }
    })
  } catch (e) {
    console.error('初始化监听器失败', e)
    Vue.prototype.$message.error('初始化监听器失败，请检查js增强监听器配置是否正确！和Vue2写法相同！')
  }
}

/**
 * 扩展表单设计器自定义方法
 */
const installer = {
  vm: {},
  install(Vue, router = {}) {
    for (let methodsName of methodsNames) {
      Object.defineProperty(Vue.prototype, `$${methodsName}`, {
        get() {
          return methodsFunc[methodsNames.indexOf(methodsName)]
        }
      })
    }
    Vue.prototype.$createAsyncJsEnhanceFunction = createAsyncJsEnhanceFunction
    Vue.prototype.$createVue2Watcher = createVue2Watcher
    // Vue.prototype.$getCurrentDepartment = getCurrentDepartment
    // Vue.prototype.$getCurrentRealname = getCurrentRealname
    // Vue.prototype.$getDepartmentByOrgCode = getDepartmentByOrgCode
    // Vue.prototype.$getCurrentDate = getCurrentDate
    // Vue.prototype.$myRequest = myRequest
  }
}

export {
  installer as CustomMethods
}


// testAsync() {
//   return new Promise(resolve => {
//     setTimeout(() => {
//       console.log("testAsync")
//       resolve('ok')
//     }, 4000)
//   })
// },
/**
 * 测试JS增强传入自定义上下文和参数
 * 支持异步语法 async await
 */
// testEnhance() {
//   const that = this
//   const funStr = 'await testAsync();console.log("testEnhance", this, getAction, that);'
//   // 实现异步函数包裹，唯一解决方案
//   const asyncFunStr = `(async () => {${funStr}})()`
//   const argsText = ['that', 'getAction', 'testAsync', asyncFunStr]
//   const argsBind = [this, that, getAction, this.testAsync]
//   const fun = new Function(...argsText)
//   console.log("fun", fun.toString())
//   fun.bind(...argsBind).call()
// }