<template>
  <span>
    <Button
      v-bind="this.$attrs"
      @click="
        record.options.handle === 'submit'
          ? false
          : record.options.handle === 'reset'
          ? $attrs.onHandleReset()
          : (record.options.dynamicFun || record.options.dynamicFormFun)
          ? executeFunc()
          : false
      "
      :html-type="record.options.handle === 'submit' ? 'submit' : undefined"
      v-text="record.label"
    ></Button>
  </span>
</template>
<script>
import { createAsyncJsEnhanceFunction } from '@comp/yoko/kform/CustomMethods'
import { pluginManager } from '../../utils/index'
const Button = pluginManager.getComponent('aButton').component
export default {
  name: 'KButton',
  props: ['record', 'dynamicData'],
  components: { Button },
  methods: {
    async executeFunc() {
      // 调用表单函数
      if (this.record.options.dynamicFormFun) {
        const that = this.getFormParent(this.$parent)
        const formFunName = this.record.options.dynamicFormFun
        if (that[formFunName] && typeof that[formFunName] === 'function') {
          that[formFunName].call()
        }
      }
      // 存在自定义JS增强
      if (this.record.options.dynamicFun) {
        const funcStr = this.record.options.dynamicFun
        if (!funcStr || funcStr.trim() === '') {
          return Promise.resolve()
        }
        const that = this.getFormParent(this.$parent)
        try {
          const res = await createAsyncJsEnhanceFunction(
            that,
            funcStr,
            // this.record才是配置
            ['config', 'dynamicData', 'data', 'setData', 'getData', 'setOptions',
              'hide', 'show', 'disable', 'enable', 'reset', 'newDefaultData'],
            [this.record, this.dynamicData, that.data, that.setData, that.getData, that.setOptions,
              that.hide, that.show, that.disable, that.enable, that.reset, that.newDefaultData])
          .call()
          return res
        } catch (e) {
          this.$message.error(e)
        }
      }
    },
    getFormParent(parent) {
      if (parent.$options.name === 'KFormBuild') {
        return parent
      } else {
        return this.getFormParent(parent.$parent)
      }
    }
  }
}
</script>
