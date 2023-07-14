<template>
  <div style="display: inline-block; margin-right: 5px">
    <a-button v-if="disableSubmit" v-bind="$attrs" v-on="$listeners">
      关闭
    </a-button>
    <a-popconfirm
      v-else
      :title="title"
      ok-text="关了吧"
      ok-type="danger"
      cancel-text="手滑了"
      placement="bottomRight"
      @cancel="cancel"
      @confirm="confirm"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <a-button v-bind="$attrs" @click.prevent>
        关闭
      </a-button>
    </a-popconfirm>
  </div>
</template>

<script>
export default {
  name: 'CancelButton',
  props: {
    disableSubmit: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '数据未保存，确认关闭吗?'
    }
  },
  methods: {
    confirm() {
      this.$emit('click');
    },
    cancel() {
    }
  }
}
</script>

<style scoped>

</style>
