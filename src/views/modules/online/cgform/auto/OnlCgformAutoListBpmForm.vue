<template>
  <onl-cgform-auto-list
    v-if="formBpm && ready"
    :online-form-data="formData"
    :online-form-config="onlineFormConfig"
    @complete="$emit('complete')"
  />
</template>

<script>

import { getAction } from '@/api/manage'
import { createAsyncJsEnhanceFunction } from '@comp/yoko/kform/CustomMethods'
import BindBpmFormMixin from '@views/modules/bpm/mytask/BindBpmFormMixin'
import OnlCgformAutoList from '@views/modules/online/cgform/auto/OnlCgformAutoList'

export default {
  name: 'OnlCgformAutoListBpmForm',
  mixins: [BindBpmFormMixin],
  components: { OnlCgformAutoList },
  props: {
    // 流程表单data
    formData: {
      type: Object,
      default: null,
      required: false
    },
    // 表单模式：true流程表单 false普通表单
    formBpm: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  data() {
    return {
      onlineFormConfig: {
        // 表单code，自动从流程配置获取
        code: '',
        // 展示审批模块
        showDealBlock: true,
        // 展示查询模块
        showQueryBlock: true,
        // 初始化筛选参数
        initQueryParam: {},
        // 新增按钮文本
        addButtonName: '填报队伍',
        // byId接口
        queryById: '/warning/tbBisWarning/queryById'
      },
      ready: false
    }
  },
  computed: {
  },
  created() {
    // 如果是流程中表单，则需要加载流程表单data
    this.showFlowData()
  },
  methods: {
    // 渲染流程表单数据
    showFlowData() {
      if (this.formBpm === true) {
        let params = { id: this.formData.dataId }
        let { onlineFormConfig, onlineInitQueryParamGetter } = this.formData
        console.log('TbBisWarningTeamBpmForm::showFlowData', this.formData)
        if (!onlineFormConfig && typeof onlineFormConfig !== 'object') {
          this.$message.error('流程节点配置错误，请配置：onlineFormConfig，类型为对象！')
          return
        }
        const { queryById } = onlineFormConfig
        if (!queryById) {
          this.$message.error('流程节点配置错误，请配置：onlineFormConfig.queryById，类型为字符串！')
          return
        }
        // 请求实际表单
        getAction(queryById, params).then(async (res) => {
          if (res.success) {
            // 从配置读取
            const record = res.result
            onlineFormConfig.initQueryParam = onlineFormConfig.initQueryParam || {}
            // 参数放入配置化遍历函数，这里可以自己决定调用store等处理方式
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
            this.onlineFormConfig = onlineFormConfig
            this.ready = true
            console.log('渲染流程::online列表组件::OnlCgformAutoListBpmForm', this.formData)
          }
        })
      }
    },
    submitForm(type = 2) {
      return Promise.resolve()
    }
  }
}
</script>
<style lang="less" scoped>
</style>
