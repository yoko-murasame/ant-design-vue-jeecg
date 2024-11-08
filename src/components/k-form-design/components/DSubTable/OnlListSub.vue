<template>
  <div>
    <onl-cgform-auto-list
      v-if="isReady"
      v-bind="getOnlineListConfig"
      @formSuccess="onFormSuccess"
    >
      <template #cardTitle="props" v-if="!disabled">
        <a-button @click="props.handleAdd">{{ $attrs.addButtonName || '新增' }}</a-button>
      </template>
    </onl-cgform-auto-list>
    <div v-else class="d-flex df-jc-center df-ai-center">
      这是online列表子表组件哦~
    </div>
  </div>
</template>

<script>

import OnlCgformAutoList from '@views/modules/online/cgform/auto/OnlCgformAutoList.vue'

/**
 * 在线online表单子表组件
 */
export default {
  name: 'OnlListSub',
  components: {
    OnlCgformAutoList
  },
  props: {
    // online表单编码
    onlineCode: {
      type: String,
      required: false,
      default: ''
    },
    // 主表id字段名
    mainIdField: {
      type: String,
      required: false,
      default: 'id'
    },
    // 外键字段名
    relIdField: {
      type: String,
      required: false,
      default: ''
    },
    // 当前组件的配置属性
    record: {
      type: Object,
      required: true
    },
    // 暂时用不到
    value: {
      type: String,
      required: false,
      default: ''
    },
    // 表单的动态数据
    formData: {
      type: Object,
      required: false,
      default: () => {}
    },
    // 表单的动态数据
    newFormData: {
      type: Object,
      required: false,
      default: () => {}
    },
    // 禁用状态
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    // 卡片模式
    cardMode: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data() {
    return {
    }
  },
  created() {
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  watch: {
    value() {
    }
  },
  mounted() {
    if (!this.isReady) {
      console.log('online子表列表组件尚未加载, 需要主表ID', this.formData)
      this.$emit('beforeOnlListSubReady', { ...this.$attrs, ...this.$props })
    }
  },
  computed: {
    isReady() {
      return this.onlineCode && this.relIdField && this.mainIdField && this.formData[this.mainIdField]
    },
    /**
     * online列表配置
     */
    getOnlineListConfig() {
      return {
        // online子表模式
        onlineSubMode: true,
        // 卡片模式
        cardMode: this.cardMode,
        cartAttrs: {
          'bordered': this.$attrs.bordered || false,
          'style': { 'border-radius': this.$attrs.borderRadius || '1vh', ...JSON.parse(this.$attrs.cardStyle || '{}') },
          'class': `none-ant-table-wrapper-min-height none-ant-empty-normal-margin${
            this.cardMode ? ' none-card-body-padding none-card-head-padding' : ''
          }`
        },
        onlineFormConfig: {
          // 表单code
          code: this.onlineCode,
          // 展示审批模块
          showDealBlock: false,
          // 展示查询模块
          showQueryBlock: this.$attrs.showQueryBlock || false,
          // 初始化筛选参数
          initQueryParam: {
            ...this.newFormData,
            [this.relIdField]: this.formData[this.mainIdField],
            needList: `${this.mainIdField},${this.relIdField}${this.newFormData['needList'] ? (',' + this.newFormData['needList']) : ''}`
          },
          // 新增按钮文本
          addButtonName: this.$attrs.addButtonName || '新增',
          // loadData触发debounce，0时就不延迟
          loadDataDebounce: this.$attrs.loadDataDebounce === null ? 50 : this.$attrs.loadDataDebounce,
          // action固定 'left', 'right'
          actionFixed: this.$attrs.actionFixed === null ? 'right' : this.$attrs.actionFixed,
          // 禁用状态
          disabled: this.disabled
        },
        onLoadDataBefore: this.onLoadDataBefore
      }
    }
  },
  methods: {
    /**
     * 表单提交成功回调
     * @param data
     */
    onFormSuccess(data) {
      this.$emit('change', data)
      this.$emit('input', data)
    },
    /**
     * 加载数据之前回调 TODO 扩展功能
     * @param that
     * @returns {Promise<void>}
     */
    async onLoadDataBefore(that) {
      console.log('online子表列表数据加载前钩子，在这里处理自定义逻辑~', that, JSON.parse(JSON.stringify(this.formData)), this, this.record)
      // 禁用状态
      that.buttonSwitch.disableAdd = false
      that.buttonSwitch.disableEdit = this.disabled
      that.buttonSwitch.disableDelete = this.disabled
    }
  }
}
</script>

<style scoped>

</style>
