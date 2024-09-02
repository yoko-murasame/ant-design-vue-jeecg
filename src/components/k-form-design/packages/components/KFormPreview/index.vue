<template>
  <a-modal
    title="预览"
    :visible="visible"
    @ok="handleGetData"
    @cancel="handleCancel"
    okText="获取数据"
    cancelText="关闭"
    style="top:20px;"
    :destroyOnClose="true"
    :centered="true"
    :dialogStyle="dialogStyle"
    :bodyStyle="bodyStyle"
    wrapClassName="k-form-modal"
    :width="`${previewWidth}px`">
    <k-form-build
      :value="jsonData"
      @myInput="handleMyInput"
      @change="handleChange"
      @submit="handleSubmit"
      ref="KFormBuild" />
    <jsonModel ref="jsonModel" />
  </a-modal>
</template>
<script>
/*
 * author kcz
 * date 2019-11-20
 */
import jsonModel from '../KFormDesign/module/jsonModal'
import { dialogStyle, bodyStyle } from '../../config/modal.js'
import { createAsyncJsEnhanceFunction } from '@/components/yoko/kform/CustomMethods'
export default {
  name: 'KFormPreview',
  data() {
    return {
      visible: false,
      previewWidth: 850,
      jsonData: {},
      dialogStyle,
      bodyStyle
    }
  },
  components: {
    jsonModel
  },
  methods: {
    /**
     * 按钮触发提交
     * @param {*} p
     */
    handleSubmit(p) {
      p()
        .then(res => {
          console.log(res, '获取数据成功')
          this.$refs.jsonModel.jsonData = res
          this.$refs.jsonModel.visible = true
        })
        .catch(err => {
          console.error(err, '获取数据失败')
        })
    },
    /**
     * 手动验证获取表单数据
     */
    async handleGetData() {
      this.$refs.KFormBuild.getData()
        .then(res => {
          console.log(res, '获取数据成功')
          this.$refs.jsonModel.jsonData = res
          this.$refs.jsonModel.visible = true
        })
        .catch(err => {
          console.log(err, '获取数据失败')
        })
    },
    /**
     * 监听表单change 事件
     * @param {*} value
     * @param {*} key
     */
    async handleChange(value, key) {
      // console.log('监听表单change 事件', value, key)
      // const formData = await this.$refs.KFormBuild.getData()
      // formData[key] = value
      // this.$refs.KFormBuild.setData(formData)
      // 判断是否有配置js
      const { config } = this.jsonData
      if (config.hasOwnProperty('afterDataChange')) {
        let afterDataChange = config.afterDataChange
        if (afterDataChange.hasOwnProperty(key)) {
          let funcStr = afterDataChange[key]
          if (!funcStr || funcStr.trim() === '') {
            return Promise.resolve()
          }
          try {
            const res = await createAsyncJsEnhanceFunction(
              this,
              funcStr,
              ['value', 'key', 'data', 'getData', 'setData', 'setOptions',
                'hide', 'show', 'disable', 'enable', 'reset'],
              [value, key, this.$refs.KFormBuild.data, this.$refs.KFormBuild.getData, this.$refs.KFormBuild.setData, this.$refs.KFormBuild.setOptions,
                this.$refs.KFormBuild.hide, this.$refs.KFormBuild.show, this.$refs.KFormBuild.disable, this.$refs.KFormBuild.enable, this.$refs.KFormBuild.reset])
            .call()
            return res
          } catch (e) {
            this.$message.error(e)
          }
        }
      }
    },
    async handleMyInput(value, key) {
      // console.log('监听表单input 事件', value, key)
      // const formData = await this.$refs.KFormBuild.getData()
      // formData[key] = value
      // this.$refs.KFormBuild.setData(formData)
      // 判断是否有配置js
      const { config } = this.jsonData
      if (config.hasOwnProperty('afterDataInput')) {
        let afterDataInput = config.afterDataInput
        if (afterDataInput.hasOwnProperty(key)) {
          let funcStr = afterDataInput[key]
          if (!funcStr || funcStr.trim() === '') {
            return Promise.resolve()
          }
          try {
            console.log(funcStr, 'input执行')
            const res = await createAsyncJsEnhanceFunction(
              this,
              funcStr,
              ['value', 'key', 'data', 'getData', 'setData', 'setOptions',
                'hide', 'show', 'disable', 'enable', 'reset'],
              [value, key, this.$refs.KFormBuild.data, this.$refs.KFormBuild.getData, this.$refs.KFormBuild.setData, this.$refs.KFormBuild.setOptions,
                this.$refs.KFormBuild.hide, this.$refs.KFormBuild.show, this.$refs.KFormBuild.disable, this.$refs.KFormBuild.enable, this.$refs.KFormBuild.reset])
            .call()
            console.log(res, 'input执行结果')
            return Promise.resolve()
          } catch (e) {
            this.$message.error(e)
          }
        }
      }
    },
    handleCancel() {
      this.visible = false
    }
  }
}
</script>
