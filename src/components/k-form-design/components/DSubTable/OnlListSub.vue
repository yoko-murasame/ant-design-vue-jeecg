<template>
  <div v-if="!hidden">
    <onl-cgform-auto-list
      v-if="isReady"
      v-bind="getOnlineListConfig"
      :imageSlotMaxWidth="$attrs.imageSlotMaxWidth"
      :imageSlotMaxNum="$attrs.imageSlotMaxNum"
      :selected-row-keys.sync="selectedRowKeys"
      :selection-rows.sync="selectionRows"
      :sync-table-name.sync="subTableName"
      @formSuccess="onFormSuccess"
    >
      <template #cardTitle="props" v-if="!disabled">
        <a-button @click="props.handleAdd" type="primary" icon="plus">{{ $attrs.addButtonName || '新增' }}</a-button>
        <a-button
          @click="props.handleDelBatch"
          style="margin-left: 1vh"
          v-show="selectedRowKeys.length > 0"
          ghost
          type="primary"
          icon="delete">{{ $attrs.batchDeleteButtonName || '批量删除' }}</a-button>
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
    // 禁用状态
    hidden: {
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
      selectedRowKeys: [],
      selectionRows: [],
      subTableName: ''
    }
  },
  created() {
    // 和后端协商好的新子表标识（主要为了兼容老的子表），传入新子表标识，后端不会再处理全量的子表数据（老的子表是这么做的）
    this.$set(this.formData, 'newSubTable', '1')
    this.subTableName && this.$set(this.formData, this.subTableName, undefined)
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  mounted() {
    if (!this.isReady) {
      console.log('online子表列表组件尚未加载, 需要主表ID', this.formData)
      this.$emit('beforeOnlListSubReady', { ...this.$attrs, ...this.$props })
    }
  },
  computed: {
    /**
     * 是否准备就绪
     * @returns {""|*}
     */
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
     * 提供绑定change事件，表单提交、表单删除会触发
     * @param data
     */
    onFormSuccess(data) {
      console.log('子表表单提交成功回调', data)
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
      that.buttonSwitch.disableAdd = this.disabled
      that.buttonSwitch.disableEdit = this.disabled
      that.buttonSwitch.disableDelete = this.disabled
      // 禁用时取消checkbox
      that.checkboxFlag = !this.disabled
    }
  }
}
</script>

<style scoped>

</style>
