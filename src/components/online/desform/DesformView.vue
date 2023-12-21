<template>
  <a-spin :spinning="loading">
    <!-- <iframe v-if="show" v-bind="iframeProps" :height="height"></iframe> -->
    <k-form-build
      ref="kfb"
      v-if="!loading"
      :value="formDataJson"
      :disabled="formDisabled"
      :default-value="defaultValue"
      :output-string="false"
      @change="handleChange" />
  </a-spin>
</template>

<script>
import { httpAction, getAction, postAction } from '@/api/manage'
import { randomString, cloneObject } from '@/utils/util'
import { DESFORM_ROUTE_TYPE, DESFORM_ROUTE_DATA_ID } from '@/utils/desform/DesformRouteUtils'
import { createAsyncJsEnhanceFunction } from '@/components/yoko/kform/CustomMethods'
import { debounce } from 'lodash'

/* desform 动态表单页面 */
export default {
  name: 'DesformView',
  props: {
    // add = 新增，edit = 修改，detail = 只读查看
    mode: {
      type: String,
      required: true
    },
    desformCode: {
      type: String,
      default: ''
    },
    onlineTableId: {
      type: String,
      default: ''
    },
    dataId: {
      type: String,
      default: null
    },
    // 新增时，默认携带的表单参数（自动注入到某些字段中）
    newDefaultData: {
      type: Object,
      default: () => ({})
    },
    alert: {
      type: Boolean,
      default: true
    },
    height: {
      type: String,
      default: null
    },
    innerDialog: {
      type: Boolean,
      default: false
    },
    isOnline: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      show: true,
      loading: false,
      // 为了防止多个页面混淆的id
      messageId: randomString('16'),
      iframeHeight: 300,
      innerDesformCode: this.desformCode,
      innerTableId: this.onlineTableId,
      otherParams: '',
      url: {
        // add: '/desform/data/add',
        add: '/online/cgform/api/form',
        // edit: '/desform/data/edit',
        edit: '/online/cgform/api/form',
        online: '/online/cgform/api/crazyForm',
        json: '/desform/queryByCode',
        startProcess: '/workflow/common/startMutilProcess',
        getFormData: '/online/cgform/api/form/table_name'
      },
      formDataJson: {},
      defaultValue: {},
      flowCodePre: 'onl_'
    }
  },
  computed: {
    formDisabled() {
      if (this.mode === 'add' || this.mode === 'edit') {
        return false
      } else {
        return true
      }
    },
    flowCode() {
      return this.flowCodePre + this.innerDesformCode
    }
    // async iframeProps() {
    //   let domianURL = window._CONFIG['domianURL']
    //   let dataId = this.dataId == null ? 'add' : this.dataId
    //   // 拼接 iframe 的 src 属性
    //   // update--begin--autor:lvdandan-----date:20201023------for：online表单集成表单设计器
    //   let src = ''
    //   if (this.isOnline) {
    //     src = `${domianURL}/desform/${this.mode}/online/${this.innerDesformCode}`
    //   } else {
    //     src = `${domianURL}/desform/${this.mode}/${this.innerDesformCode}`
    //   }
    //   // update--begin--autor:lvdandan-----date:20201023------for：online表单集成表单设计器
    //   //  - 修改和查看都需要传递 dataId 参数
    //   if (this.mode === 'edit' || this.mode === 'detail') {
    //     src += `/${dataId}`
    //   }
    //   src += `?messageId=${this.messageId}&token=${Vue.ls.get(ACCESS_TOKEN)}`
    //   src += `&innerDialog=${this.innerDialog}` // 内部展示对话框
    //   if (this.innerDialog) {
    //     src += `&skip=false` // 是否跳转到成功页面，如果不跳转就触发success事件
    //   }
    //   src += `&innerRequest=false` // 关闭iframe的内部请求
    //   src += `&disableScroll=true` // 关闭iframe的内部滚动
    //   src += this.otherParams // 其他参数
    //   return {
    //     src,
    //     style: {
    //       'width': '100%',
    //       'height': this.height || this.iframeHeight + 'px',
    //       // 'height': (typeof this.height === 'number') ? `${this.height}px` : this.height
    //       'overflow': 'hidden',
    //       'transition': this.height ? null : 'height 0.3s'
    //     },
    //     frameborder: '0'
    //   }

  },
  watch: {
    desformCode() {
      this.innerDesformCode = this.desformCode
    },
    onlineTableId() {
      this.innerTableId = this.onlineTableId
    }
  },
  async created() {
    // const _this = this
    // window.addEventListener('message', function(event) {
    //   let { messageId, type, data } = event.data
    //   if (`${_this.messageId}` !== messageId) {
    //     return
    //   }
    //   switch (type) {
    //     case 'close':
    //       _this.handleClose()
    //       break
    //     case 'success':
    //       _this.$emit('success', { target: _this })
    //       break
    //     case 'reload':
    //       _this.handleReload()
    //       break
    //     case 'route-jump':
    //       _this.handleRouteJump(data)
    //       break
    //     case 'save':
    //       _this.saveAllData(data)
    //       break
    //     case 'height-change':
    //       _this.iframeHeight = data + 10
    //       break
    //     case 'dialog-change':
    //       _this.$emit('dialogChange', data)
    //       break
    //     case 'show-message':
    //       _this.$message[data.type](data.message)
    //       break
    //   }
    // }, false)

    this.loading = true
    try {
      await this.loadFormJson()
      await this.loadFormData()
    } catch (e) {
      console.error('设计器加载异常', e)
      this.$message.error('设计器加载异常' + e)
    } finally {
      this.loading = false
      this.handleChange = debounce(this.handleChange, 500)
    }
  },
  methods: {
    /**
     * 获取 form json
     * @returns {Promise<void>}
     */
    async loadFormJson() {
      const params = { desformCode: this.innerDesformCode }// 查询条件
      const res = await getAction(this.url.json, params)
      this.formDataJson = JSON.parse(res.result.desformDesignJson)
      console.log('loadFormJson', this.formDataJson)
    },
    /**
     * 获取表单数据
     * @returns {Promise<void>}
     */
    async loadFormData() {
      if (!this.dataId) {
        console.info('没有dataId，不需要加载表单数据')
        this.defaultValue = { ...this.newDefaultData }
        return
      }
      const res = await getAction(`${this.url.getFormData}/${this.innerDesformCode}/${this.dataId}`)
      this.defaultValue = { ...res.result, ...this.newDefaultData }
      console.log('loadFormData', this.defaultValue)
    },
    reload() {
      this.show = false
      this.$nextTick(() => {
        this.show = true
      })
    },
    async saveAllData() {
      const { formData, callback } = await this.$refs.kfb.handleSubmit()
      return new Promise(async (resolve, reject) => {
        if (this.innerTableId) {
          const _this = this

          // let formData = await this.handleGetData()

          let url = _this.url.add + '/' + this.innerTableId
          let method = 'POST'
          // let formData = {
          //   desformCode: _this.desformCode,
          //   desformDataJson: JSON.stringify(params)
          // }
          // let formData =

          formData['desformCode'] = this.desformCode
          if (_this.dataId) {
            url = _this.url.edit + '/' + this.innerTableId
            method = 'PUT'
            formData['id'] = _this.dataId
          }

          _this.loading = true;
          (() => {
            // 如果存在 onlineForm 就首先提交给online表单，获取到 id 后再提交到数据表
            console.log('saveForm', formData)
            if (formData.onlineForm) {
              formData['onlineFormCode'] = formData.onlineForm
              if (_this.dataId != null) {
                formData.json.id = formData.onlineDataId
              }
              let onlineUrl = `${_this.url.online}/${formData.onlineForm}`

              // online 特殊处理，防止因为java的toString破坏了格式
              let onlinePostJson = cloneObject(formData.json)
              for (let key in onlinePostJson) {
                if (onlinePostJson.hasOwnProperty(key)) {
                  let item = onlinePostJson[key]
                  if (typeof item === 'object') {
                    onlinePostJson[key] = JSON.stringify(item)
                  }
                }
              }

              return httpAction(onlineUrl, onlinePostJson, method)
            } else {
              return Promise.resolve(null)
            }
          })().then((res) => {
            if (res == null) {
              // 没有提交到online表单
              // do nothing
            } else if (res.success) {
              // 提交到了onlineForm，获取到新增的uuid，且只有在新增时才提交
              if (_this.dataId == null) {
                formData['onlineFormDataId'] = res.result
              }
            } else {
              if (_this.alert === true) _this.$error({ title: '保存失败', content: res.message })
              return Promise.reject()
            }
            // 提交到数据表
            return httpAction(url, formData, method)
          }).then(res => {
            if (res.success) {
              // 注释，没有params参数，暂未发现影响
              // debugger
              // // 保存到用户自定义url
              // let { formConfig: { customRequestURL: curl } } = params
              // if ((curl instanceof Array) && curl[0] && curl[0].url) {
              //   formData.dataId = res.result
              //   return httpAction(curl[0].url, formData, method)
              // }
            }
            return res
          }).then(async res => {
            const resData = { res, dataId: res.result, target: _this }
            if (res.success) {
              if (_this.alert === true) _this.$message.success('保存成功')
              // 执行保存成功后的回调，返回id主键
              console.log('callback', res)
              await callback(res.result)
              this.$emit('success', resData)
              resolve(resData)
            } else {
              _this.$emit('error', { res, target: _this })
              if (_this.alert === true) _this.$error({ title: '保存失败', content: res.message })
              reject(resData)
            }
          }).finally(() => {
            _this.loading = false
          })
        }
      })
    },
    async handleGetData() {
      // 使用getData函数获取数据
      let data = await this.$refs.kfb.getData()
      return data
      // console.log('验证通过', data)
      // .then(values => {
      //   // console.log('验证通过', values)
      //   return values
      // }).catch(() => {
      //   console.log('验证未通过，获取失败')
      // })
    },
    // handleClose(data) {
    //   this.$emit('close', { target: this })
    // },
    handleReload(data) {
      this.$emit('reload', { target: this })
    },
    /** 处理路由跳转 */
    handleRouteJump(data) {
      this.handleReload()
      let { nextRouteConfig: { routeType, routePath }, dataId } = data
      let params = `?${DESFORM_ROUTE_DATA_ID}=${dataId}`
      if (routeType === DESFORM_ROUTE_TYPE.form) {
        this.innerDesformCode = routePath
        this.otherParams = '&' + params.substring(1)
      } else if (routeType === DESFORM_ROUTE_TYPE.menu) {
        this.routeJumpNextTick(() => {
          this.$router.push(routePath + params)
        })
      } else if (routeType === DESFORM_ROUTE_TYPE.href) {
        this.routeJumpNextTick(() => {
          window.open(routePath + params, '_blank')
        })
      }
    },
    routeJumpNextTick(callback) {
      this.handleClose()
      return this.$nextTick(callback)
    },
    // 保存并发起流程
    async saveAndSubmitBPM() {
      const data = await this.saveAllData()
      let { res } = await postAction(this.url.startProcess, {
        id: data.dataId,
        flowCode: this.flowCode,
        formUrl: 'modules/bpm/task/form/OnlineFormDetail',
        formUrlMobile: 'check/onlineForm/detail'
      })
      return res
    },
    /**
     * 监听表单change 事件
     * @param {*} value
     * @param {*} key
     */
    handleChange(value, key) {
      // console.log(value, key)
      // const formData = this.$refs.kfb.getData()
      // formData[key] = value
      // this.$refs.kfb.setData(formData)
      const that = this.$refs.kfb
      // 判断是否有配置js
      const { config } = this.formDataJson
      if (that && config.hasOwnProperty('afterDataChange')) {
        let afterDataChange = config.afterDataChange
        if (afterDataChange.hasOwnProperty(key)) {
          let funcStr = afterDataChange[key]
          return createAsyncJsEnhanceFunction(
            that,
            funcStr,
            ['value', 'key', 'data', 'getData', 'setData', 'setOptions',
              'hide', 'show', 'disable', 'enable', 'reset'],
            [value, key, that.data, that.getData, that.setData, that.setOptions,
              that.hide, that.show, that.disable, that.enable, that.reset])
          .call()
        }
      }
    }
  }
}
</script>

<style scoped></style>
