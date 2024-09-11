<template>
  <a-form-item :label="label">
    <a-switch v-model="checked" @change="handleChange">
      <a-icon slot="checkedChildren" type="check" />
      <a-icon slot="unCheckedChildren" type="close" />
    </a-switch>
  </a-form-item>
</template>

<script>
/**
 * 流程功能-封装我的待办筛选按钮，快速接入列表页，点击筛选时将强制刷新待办列表；
 * 流程功能-在所有流程操作后，强制触发刷新我的待办列表；
 */
export default {
  name: 'BindBpmShowMyTask',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    label: {
      type: String,
      default: '我的待办'
    },
    parent: {
      type: Object,
      default: () => ({}),
      required: true
    },
    value: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        // console.log('change value', val)
        this.checked = val
      }
    }
  },
  data() {
    return {
      checked: false
    }
  },
  methods: {
    async handleChange(flag) {
      this.$emit('change', flag)
      const that = this.parent
      if (flag) {
        await that.fetchBpmDataList()
        if (!that.myTaskList.length) {
          this.$message.info(`${this.label}列表为空`);
          this.checked = false;
          this.$emit('change', false);
          return
        }
        that.queryParam.id = that.myTaskList.map(e => e.businessId).join(',');
        that.loadData();
      } else {
        that.queryParam.id = ''
        that.loadData();
      }
    }
  }
}
</script>
