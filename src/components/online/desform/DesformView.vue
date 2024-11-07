<template>
  <a-spin :spinning="loading">
    <!-- <iframe v-if="show" v-bind="iframeProps" :height="height"></iframe> -->
    <k-form-build
      ref="kfb"
      v-if="!formDataLoading"
      :value="formDataJson"
      :disabled="formDisabled || currentSavedResult !== null"
      :form-data="innerFormData"
      :new-form-data="newFormData"
      :output-string="false"
      @change="handleChange"
      @myInput="handleMyInput"
      :parent="parent"
    />
  </a-spin>
</template>

<script>
import { httpAction, getAction, postAction } from '@/api/manage'
import { randomString, cloneObject } from '@/utils/util'
import { DESFORM_ROUTE_TYPE, DESFORM_ROUTE_DATA_ID } from '@/utils/desform/DesformRouteUtils'
import { createAsyncJsEnhanceFunction } from '@/components/yoko/kform/CustomMethods'
import BindBpmFormMixin from '@views/modules/bpm/mytask/BindBpmFormMixin'
import { debounce } from 'lodash'

/* desform 动态表单页面 */
export default {
  name: 'DesformView',
  mixins: [BindBpmFormMixin],
  props: {
    // add = 新增，edit = 修改，detail = 只读查看
    mode: {
      type: String,
      required: true
    },
    /**
     * kForm表单定义code，必填
     */
    desformCode: {
      type: String,
      default: ''
    },
    /**
     * kForm表单定义id，同online表单的定义id，可以不填，通过desformCode获取
     */
    onlineTableId: {
      type: String,
      default: ''
    },
    dataId: {
      type: String,
      default: null
    },
    // 新增时，默认携带的表单参数（自动注入到某些字段中）
    newFormData: {
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
    },
    enableLoading: {
      type: Boolean,
      default: true
    },
    // 父列表组件
    parent: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      show: true,
      loading: false,
      formDataLoading: true,
      // 为了防止多个页面混淆的id
      messageId: randomString('16'),
      iframeHeight: 300,
      // kForm表单定义code
      innerDesformCode: '',
      // kForm表单定义id
      innerTableId: '',
      otherParams: '',
      url: {
        // add: '/desform/data/add',
        add: '/online/cgform/api/form',
        // edit: '/desform/data/edit',
        edit: '/online/cgform/api/form',
        online: '/online/cgform/api/crazyForm',
        json: '/desform/queryByCode',
        getFormData: '/online/cgform/api/form/table_name'
      },
      formDataJson: {},
      innerFormData: {},
      // 产生异常使用，如果当前表单已保存用以判断
      currentSavedResult: null
    }
  },
  computed: {
    formDisabled() {
      if (this.mode === 'add' || this.mode === 'edit') {
        return false
      } else {
        return true
      }
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
    desformCode: {
      immediate: true,
      handler(val) {
        console.log('初始化kForm', val)
        this.innerDesformCode = val
        val && this.initKForm()
      }
    },
    onlineTableId: {
      immediate: true,
      handler() {
        this.innerTableId = this.onlineTableId
      }
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
  },
  methods: {
    /**
     * 初始化kForm
     * @returns {Promise<void>}
     */
    async initKForm() {
      if (this.enableLoading) {
        this.loading = true
      }
      this.formDataLoading = true
      try {
        await this.loadFormJson()
        await this.loadFormData()
      } catch (e) {
        console.error('设计器加载异常', e)
        this.$message.error('设计器加载异常' + e)
      } finally {
        this.loading = false
        this.formDataLoading = false
        this.currentSavedResult = null
        this.handleChange = debounce(this.handleChange, 500)
      }
    },
    /**
     * 获取 form json
     * @returns {Promise<void>}
     */
    async loadFormJson() {
      const params = { desformCode: this.innerDesformCode }// 查询条件
      const res = await getAction(this.url.json, params)
      this.formDataJson = JSON.parse(res.result.desformDesignJson)
      this.innerTableId = this.onlineTableId || res.result.cgformId
      console.log('loadFormJson', this.formDataJson)
    },
    /**
     * 获取表单数据
     * @returns {Promise<void>}
     */
    async loadFormData() {
      if (!this.dataId) {
        console.info('没有dataId，不需要加载表单数据')
        this.innerFormData = { ...this.newFormData }
        return
      }
      // 有id即是编辑操作
      const res = await getAction(`${this.url.getFormData}/${this.innerDesformCode}/${this.dataId}`)
      // 编辑操作优先以拿回来的数据为准
      this.innerFormData = { ...this.newFormData, ...res.result }
      console.log('loadFormData', this.innerFormData, res.result)
    },
    reload() {
      this.show = false
      this.$nextTick(() => {
        this.show = true
      })
    },
    async saveAllData(throwEx = false) {
      const that = this
      return new Promise(async (resolve, reject) => {
        try {
          const { formData, callback } = await that.$refs.kfb.handleSubmit()
          if (this.innerTableId) {
            // let formData = await this.handleGetData()

            let url = that.url.add + '/' + that.innerTableId
            let method = 'POST'
            // let formData = {
            //   desformCode: _this.desformCode,
            //   desformDataJson: JSON.stringify(params)
            // }
            // let formData =

            formData['desformCode'] = that.desformCode
            if (that.dataId) {
              url = that.url.edit + '/' + that.innerTableId
              method = 'PUT'
              formData['id'] = that.dataId
            }
            if (that.enableLoading) {
              that.loading = true
            }
            (() => {
              // 如果存在 onlineForm 就首先提交给online表单，获取到 id 后再提交到数据表
              console.log('saveForm', formData)
              if (formData.onlineForm) {
                formData['onlineFormCode'] = formData.onlineForm
                if (that.dataId != null) {
                  formData.json.id = formData.onlineDataId
                }
                let onlineUrl = `${that.url.online}/${formData.onlineForm}`

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
                // 当前提交过了，就不再让提交
                if (that.currentSavedResult) {
                  console.warn('当前提交过了，就不再让提交', that.currentSavedResult)
                  return Promise.resolve(that.currentSavedResult.res)
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
                if (that.dataId == null) {
                  formData['onlineFormDataId'] = res.result
                }
              } else {
                if (that.alert === true) that.$error({ title: '保存失败', content: res.message })
                return Promise.reject()
              }
              // 当前提交过了，就不再让提交
              if (that.currentSavedResult) {
                console.warn('当前提交过了，就不再让提交', that.currentSavedResult)
                return Promise.resolve(that.currentSavedResult.res)
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
              const resData = { ...that.innerFormData, ...formData, formSaveResult: res, dataId: res.result }
              if (res.success) {
                if (that.alert && !that.currentSavedResult) {
                  that.$message.success('保存成功')
                }
                // 执行保存成功后的回调，返回id主键
                console.log('kForm::saveAllData::success', resData)
                await callback(res.result)
                this.$emit('success', resData)
                that.currentSavedResult = resData
                resolve(resData)
              } else {
                that.$emit('error', { res, target: that })
                if (that.alert) {
                  that.$error({ title: '保存失败', content: res.message })
                }
                that.currentSavedResult = null
                reject(resData)
              }
            }).finally(() => {
              that.loading = false
            })
          }
        } catch (rootEx) {
          throwEx && reject(rootEx)
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
    saveAndSubmitBPM(throwEx = false) {
      return new Promise(async(resolve, reject) => {
        try {
          const data = await this.saveAllData(throwEx)
          resolve(data)
        } catch (e) {
          reject(e)
        }
      })
    },
    /**
     * 监听表单change 事件
     * 正是渲染
     * @param {*} value
     * @param {*} key
     */
    async handleChange(value, key) {
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
          if (!funcStr || funcStr.trim() === '') {
            return Promise.resolve()
          }
          try {
            const res = await createAsyncJsEnhanceFunction(
              that,
              funcStr,
              ['value', 'key', 'data', 'getData', 'setData',
                'setOptions', 'changeDict',
                'setRules', 'openRequired', 'closeRequired',
                'hide', 'show', 'disable', 'enable', 'reset', 'formMeta'],
              [value, key, that.data, that.getData, that.setData,
                that.setOptions, that.changeDict,
                that.setRules, that.openRequired, that.closeRequired,
                that.hide, that.show, that.disable, that.enable, that.reset, that.value])
            .call()
            return res
          } catch (e) {
            this.$message.error(e)
          }
        }
      }
    },
    /**
     * 监听表单Input 事件
     * 正式渲染
     * @param {*} value
     * @param {*} key
     */
    async handleMyInput(value, key) {
      // console.log(value, key)
      // const formData = this.$refs.kfb.getData()
      // formData[key] = value
      // this.$refs.kfb.setData(formData)
      const that = this.$refs.kfb
      // 判断是否有配置js
      const { config } = this.formDataJson
      if (that && config.hasOwnProperty('afterDataInput')) {
        let afterDataInput = config.afterDataInput
        if (afterDataInput.hasOwnProperty(key)) {
          let funcStr = afterDataInput[key]
          if (!funcStr || funcStr.trim() === '') {
            return Promise.resolve()
          }
          try {
            const res = await createAsyncJsEnhanceFunction(
              that,
              funcStr,
              ['value', 'key', 'data', 'getData', 'setData',
                'setOptions', 'changeDict',
                'setRules', 'openRequired', 'closeRequired',
                'hide', 'show', 'disable', 'enable', 'reset', 'formMeta'],
              [value, key, that.data, that.getData, that.setData,
                that.setOptions, that.changeDict,
                that.setRules, that.openRequired, that.closeRequired,
                that.hide, that.show, that.disable, that.enable, that.reset, that.value])
            .call()
            return res
          } catch (e) {
            this.$message.error(e)
          }
        }
      }
    }
  }
}
</script>

<style scoped></style>
