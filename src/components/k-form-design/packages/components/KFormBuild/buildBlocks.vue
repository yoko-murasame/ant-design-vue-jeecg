<template>
  <!-- 标签页布局 -->
  <a-tabs
    v-if="record.type === 'tabs'"
    class="grid-row"
    :default-active-key="0"
    :tabBarGutter="record.options.tabBarGutter"
    :type="record.options.type"
    :size="record.options.size"
    :tabPosition="record.options.tabPosition"
    :animated="record.options.animated"
    v-model="activeKey">
    <a-tab-pane v-for="(tabItem, index) in record.columns" :key="index" :tab="tabItem.label" :forceRender="true">
      <buildBlocks
        ref="nestedComponents"
        @handleReset="$emit('handleReset')"
        @change="handleChange"
        @myInput="handleMyInput"
        @beforeOnlListSubReady="handleBeforeOnlListSubReady"
        v-for="item in tabItem.list"
        :disabled="disabled"
        :dynamicData="dynamicData"
        :formData="formData"
        :key="item.key"
        :record="item"
        :formConfig="formConfig"
        :config="config" />
    </a-tab-pane>
  </a-tabs>
  <!-- 栅格布局 -->
  <a-row v-else-if="record.type === 'grid'" class="grid-row" :gutter="record.options.gutter">
    <a-col class="grid-col" v-for="(colItem, idnex) in record.columns" :key="idnex" :span="colItem.span || 0">
      <buildBlocks
        ref="nestedComponents"
        @handleReset="$emit('handleReset')"
        @change="handleChange"
        @myInput="handleMyInput"
        @beforeOnlListSubReady="handleBeforeOnlListSubReady"
        v-for="item in colItem.list"
        :disabled="disabled"
        :dynamicData="dynamicData"
        :formData="formData"
        :key="item.key"
        :record="item"
        :formConfig="formConfig"
        :config="config" />
    </a-col>
  </a-row>
  <!-- 卡片布局 -->
  <a-card v-else-if="record.type === 'card'" class="grid-row" :title="record.label">
    <buildBlocks
      ref="nestedComponents"
      @handleReset="$emit('handleReset')"
      @change="handleChange"
      @myInput="handleMyInput"
      @beforeOnlListSubReady="handleBeforeOnlListSubReady"
      v-for="item in record.list"
      :disabled="disabled"
      :dynamicData="dynamicData"
      :formData="formData"
      :key="item.key"
      :record="item"
      :formConfig="formConfig"
      :config="config" />
  </a-card>
  <!-- 表格布局 -->
  <table
    v-else-if="record.type === 'table'"
    class="kk-table-9136076486841527"
    :class="{
      bright: record.options.bright,
      small: record.options.small,
      bordered: record.options.bordered
    }"
    :style="'width:' + record.options.width + ';' + record.options.customStyle">
    <tr v-for="(trItem, trIndex) in record.trs" :key="trIndex">
      <td
        class="table-td"
        v-for="(tdItem, tdIndex) in trItem.tds.filter(
          item => item.colspan && item.rowspan
        )"
        :key="tdIndex"
        :colspan="tdItem.colspan"
        :rowspan="tdItem.rowspan">
        <buildBlocks
          ref="nestedComponents"
          @handleReset="$emit('handleReset')"
          @change="handleChange"
          @myInput="handleMyInput"
          @beforeOnlListSubReady="handleBeforeOnlListSubReady"
          v-for="item in tdItem.list"
          :disabled="disabled"
          :dynamicData="dynamicData"
          :formData="formData"
          :key="item.key"
          :record="item"
          :formConfig="formConfig"
          :config="config" />
      </td>
    </tr>
  </table>

  <!--TODO 这里的隐藏状态是if，会影响数据保存字段，暂时去掉-->
  <!--<div v-else-if="!record.options.hidden">-->
  <div v-else>
    <KFormItem
      v-show="!record.options.hidden"
      :disabled="disabled"
      v-if="record.type === 'subtable'"
      ref="nestedComponents"
      @handleReset="$emit('handleReset')"
      @change="handleChange"
      @myInput="handleMyInput"
      @beforeOnlListSubReady="handleBeforeOnlListSubReady"
      :dynamicData="dynamicData"
      :formData="formData"
      :key="record.key"
      :record="record"
      :formConfig="formConfig"
      :config="config" />

    <j-form-container v-show="!record.options.hidden" :disabled="disabled" v-else>
      <KFormItem
        ref="nestedComponents"
        @handleReset="$emit('handleReset')"
        @change="handleChange"
        @myInput="handleMyInput"
        @beforeOnlListSubReady="handleBeforeOnlListSubReady"
        :dynamicData="dynamicData"
        :formData="formData"
        :key="record.key"
        :record="record"
        :formConfig="formConfig"
        :config="config"
        slot="detail" />
    </j-form-container>
  </div>
  <!-- <KFormItem
  :disabled="disabled"
  v-if="record.type === 'subtable'"
    ref="nestedComponents"
    @handleReset="$emit('handleReset')"
    @change="handleChange"
    @myInput="handleMyInput"
    @beforeOnlListSubReady="handleBeforeOnlListSubReady"
    :dynamicData="dynamicData"
    :formData="formData"
    :key="record.key"
    :record="record"
    :formConfig="formConfig"
    :config="config"
  /> -->
</template>
<script>
/*
 * author kcz
 * date 2019-11-20
 */
import KFormItem from '../KFormItem/index'

export default {
  name: 'BuildBlocks',
  props: {
    // 各个表单组件配置项
    record: {
      type: Object,
      required: true
    },
    // form-item 宽度配置
    formConfig: {
      type: Object,
      required: true
    },
    // 传递给表单组件的config项，目前没啥用
    config: {
      type: Object,
      default: () => ({})
    },
    // 动态字典配置数据
    dynamicData: {
      type: Object,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    validatorError: {
      type: [Object, null],
      default: () => ({})
    },
    // 业务表单默认数据
    formData: {
      type: Object,
      default: () => ({})
    }
  },
  components: {
    KFormItem
  },
  data() {
    return {
      activeKey: 0
    }
  },
  methods: {
    validationSubform() {
      // 验证动态表格
      const nestedComponents = this.$refs.nestedComponents
      if (
        typeof nestedComponents === 'object' &&
        nestedComponents instanceof Array
      ) {
        for (let i = 0; nestedComponents.length > i; i++) {
          if (!nestedComponents[i].validationSubform()) {
            return false
          }
        }
        return true
      } else if (typeof nestedComponents !== 'undefined') {
        return nestedComponents.validationSubform()
      } else {
        return true
      }
    },
    handleChange(value, key) {
      this.$emit('change', value, key)
    },
    handleMyInput(value, key) {
      // console.log('buildBlocks::handleMyInput', value, key)
      this.$emit('myInput', value, key)
    },
    // online子表组件的初始化前事件
    handleBeforeOnlListSubReady(e) {
      this.$emit('beforeOnlListSubReady', e)
    }
  },
  watch: {
    /**
     * @author: lizhichao<meteoroc@outlook.com>
     * @description: 监视validatorError对象，当检测到Tabs中有表单校验无法通过时，切换到最近校验失败的tab页。
     */
    validatorError: {
      deep: true,
      handler: function (n) {
        const errorItems = Object.keys(n)
        if (errorItems.length) {
          if (!this.record.columns) return false
          for (let i = 0; i < this.record.columns.length; i++) {
            const err = this.record.columns[i].list.filter(item =>
              errorItems.includes(item.model)
            )
            if (err.length) {
              this.activeKey = i
              break
            }
          }
        }
      }
    }
  }
}
</script>
