import { getAction } from '@api/manage'
import { createAsyncJsEnhanceFunction } from '@comp/yoko/kform/CustomMethods'

/**
 * @description 监听online列表子表组件初始化前钩子
 * @type {{data(): {getSnowIdUrl: string}, methods: {getSnowId(): Promise<*>, handleBeforeOnlListSubReady(*): void}}}
 */
export const BeforeOnlListSubReadyMixins =  {
  data() {
    return {
      innerFormData: {},
      getSnowIdUrl: '/sys/id/snowId'
    }
  },
  methods: {
    /**
     * 获取雪花id
     * @returns {Promise<*|string>}
     */
    async getSnowId() {
      const { result, message, success } = await getAction(this.getSnowIdUrl, {})
      if (success) {
        return result
      }
      this.$message.error(message)
      return '123'
    },
    /**
     * 监听online列表子表组件初始化前钩子
     * @param e
     * @param kFormBuild
     * @returns {Promise<void>}
     */
    async handleBeforeOnlListSubReady(e, kFormBuild) {
      console.log('监听到online列表子表组件初始化前钩子', e, kFormBuild)
      const id = await this.getSnowId()
      // 设置主表id
      this.$set(this.innerFormData, e.mainIdField, id)
      kFormBuild && kFormBuild.setData(this.innerFormData)
    },
    /**
     * 监听表单change 事件
     * 正式渲染
     * @param {*} value
     * @param {*} key
     * @param jsonData
     * @param that
     */
    async handleChange(value, key, jsonData, that) {
      // console.log(value, key)
      // const formData = this.$refs.kfb.getData()
      // formData[key] = value
      // this.$refs.kfb.setData(formData)
      // const that = this.$refs.kfb
      // 判断是否有配置js
      // const { config } = this.formDataJson
      const { config } = jsonData
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
                'getAllTabs', 'selectTabByName',
                'hide', 'show', 'disable', 'enable', 'reset', 'formMeta'],
              [value, key, that.data, that.getData, that.setData,
                that.setOptions, that.changeDict,
                that.setRules, that.openRequired, that.closeRequired,
                that.getAllTabs, that.selectTabByName,
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
     * @param jsonData
     * @param that
     */
    async handleMyInput(value, key, jsonData, that) {
      // console.log(value, key)
      // const formData = this.$refs.kfb.getData()
      // formData[key] = value
      // this.$refs.kfb.setData(formData)
      // const that = this.$refs.kfb
      // 判断是否有配置js
      // const { config } = this.formDataJson
      const { config } = jsonData
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
