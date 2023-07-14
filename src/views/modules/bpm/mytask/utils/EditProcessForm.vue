<template>
  <a-spin :spinning="confirmLoading">
    <a-row>
      <a-col :span="24" style="text-align: center">
        <a-button @click="showFlowData">查看关联表单</a-button>
      </a-col>
      <a-col v-if="showFlowSubmitButton" :span="24" style="text-align: center">
        <a-button @click="showFlowData">提 交</a-button>
      </a-col>
    </a-row>
  </a-spin>
</template>

<script>
/**
   * @deprecated 没有用到
   */
export default {
  name: 'EditProcessForm',
  components: {},
  props: {
    // 流程表单data
    formData: {
      type: Object,
      default: () => {
      },
      required: false
    },
    // 表单模式：true流程表单 false普通表单
    formBpm: {
      type: Boolean,
      default: false,
      required: false
    },
    // 表单禁用
    disabled: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  data() {
    return {
      confirmLoading: false
    }
  },
  computed: {
    formDisabled() {
      if (this.formBpm === true) {
        if (this.formData.disabled === false) {
          return false
        }
        return true
      }
      return this.disabled
    },
    showFlowSubmitButton() {
      if (this.formBpm === true) {
        if (this.formData.disabled === false) {
          return true
        }
      }
      return false
    }
  },
  created() {
    // 如果是流程中表单，则需要加载流程表单data
    this.showFlowData();
  },
  methods: {
    // 渲染流程表单数据
    showFlowData() {
      if (this.formBpm === true) {
        console.log('showFlowData', this.formData);
        let params = { id: this.formData.dataId };
        // getAction(this.url.queryById, params).then((res) => {
        //   if (res.success) {
        //     this.edit(res.result);
        //   }
        // });
      }
    }
  }
}
</script>
<style lang="less" scoped>
</style>
