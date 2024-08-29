<template>
  <div>
    <desform-view
      v-if="formBpm && ready"
      class="desform-view"
      :mode="mode"
      :desformCode="realCode"
      :dataId="formData.dataId"
      height="100vh"
      :enable-loading="true"
      :new-default-data="newDefaultData"
      @success="() => {}"
      ref="realForm"
    />
    <!--嵌入流程审批组件-->
    <component
      :is="realTaskModule"
      v-if="formBpm && ready && onlineFormConfig.showDealBlock"
      :show-steps="false"
      :form-vm="$refs.realForm ? $refs.realForm : null"
      :save-form="(throwEx, buttonName, showError) => saveAllData(true, buttonName, true)"
      :formData="formData"
      @complete="$emit('complete')" />
  </div>
</template>

<script>

import DesformView from '@comp/online/desform/DesformView'
import { createAsyncJsEnhanceFunction } from '@comp/yoko/kform/CustomMethods'
import BindBpmFormMixin from '@views/modules/bpm/mytask/BindBpmFormMixin'
import TaskModule from '@views/modules/bpm/task/form/TaskModule'

export default {
  name: 'KFormBpmForm',
  mixins: [BindBpmFormMixin],
  components: { TaskModule, DesformView },
  props: {
    // 流程表单data
    formData: {
      type: Object,
      default: () => {},
      required: false
    },
    // 表单模式：true流程表单 false普通表单
    formBpm: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  computed: {
    // kForm表单的展示形式
    mode() {
      return (this.formData && this.formData.disabled) ? 'detail' : 'edit'
    },
    realTaskModule() {
      console.log('加载动态审批组件', this.formData.customTaskModule)
      if (this.formData.customTaskModule) {
        return () => import(`@/views/${this.formData.customTaskModule}.vue`)
      }
      return 'TaskModule'
    }
  },
  data() {
    return {
      isOnline: false,
      onlineFormConfig: {
        // 设计器code，默认和流程的表名一致
        code: '',
        // 展示审批模块
        showDealBlock: false,
        // 初始化筛选参数
        initQueryParam: {},
        // 确认提交的按钮名称
        whichButtonToUse: '确认提交'
      },
      ready: false,
      newDefaultData: {},
      realCode: '',
      realUseButton: '确认提交'
    }
  },
  created() {
    // 如果是流程中表单，则需要加载流程表单data
    this.showFlowData()
  },
  methods: {
    // 渲染流程表单数据
    async showFlowData() {
      if (this.formBpm === true) {
        let { onlineFormConfig, onlineInitQueryParamGetter } = this.formData
        console.log('渲染流程::kForm表单组件::KFormBpmForm', this.formData)
        if (!onlineFormConfig || typeof onlineFormConfig !== 'object') {
          // 如果外部组件审批已开启，就默认不展示内嵌
          this.onlineFormConfig.showDealBlock = !this.formData.showTask
          this.realCode = this.formData.tableName
          this.ready = true
          console.log('流程表单参数onlineFormConfig未配置，使用默认值。', this.onlineFormConfig)
          return
        }

        // 设计器code，默认和流程的表名一致
        this.realCode = onlineFormConfig.code || this.formData.tableName
        this.realUseButton = onlineFormConfig.whichButtonToUse || '确认提交'

        // 处理表单默认参数
        const record = this.formData.records
        onlineFormConfig.initQueryParam = onlineFormConfig.initQueryParam || {}
        // 参数放入配置化getter函数，这里可以自己决定调用store等处理方式
        if (onlineInitQueryParamGetter && onlineInitQueryParamGetter.trim() !== '') {
          try {
            const func = createAsyncJsEnhanceFunction(this, onlineInitQueryParamGetter, ['record'], [record])
            const getterParams = await func()
            onlineFormConfig.initQueryParam = Object.assign(onlineFormConfig.initQueryParam, getterParams || {})
          } catch (e) {
            this.$message.error('流程节点配置错误，参数初始化函数：onlineInitQueryParamGetter，执行异常！')
            console.error(e)
          }
        }
        this.onlineFormConfig = Object.assign(this.onlineFormConfig, onlineFormConfig)
        this.newDefaultData = { ...this.onlineFormConfig.initQueryParam }
        this.ready = true
        console.log('渲染流程::kForm表单组件::KFormBpmForm', this.formData, this.onlineFormConfig)
      }
    },
    /**
     * 流程提交前，保存表单数据
     * @param throwEx 抛出异常
     * @param buttonName 按钮名称
     * @param showError 是否提示错误
     * @returns {Promise<void>}
     */
    saveAllData(throwEx = true, buttonName, showError = false) {
      if (this.formData.disabled || (buttonName && !~this.realUseButton.indexOf(buttonName))) {
        return Promise.resolve()
      }
      return new Promise(async(resolve, reject) => {
        try {
          const data = await this.$refs.realForm.saveAllData(true)
          resolve(data)
        } catch (e) {
          showError && this.$message.error('表单未完成')
          reject('表单未完成')
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
</style>
