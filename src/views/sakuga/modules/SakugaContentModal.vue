<template>
  <j-modal
    :maskClosable="false"
    :title="title"
    :width="width"
    :visible="visible"
    switchFullscreen
    @ok="handleOk"
    :okButtonProps="{ class:{'jee-hidden': disableSubmit} }"
    @cancel="handleCancel"
    cancelText="关闭">
    <template slot="footer">
      <cancel-button :disableSubmit="disableSubmit" key="back" @click="handleCancel"/>
      <a-button type="primary" @click="handleOk" v-if="!disableSubmit">确定</a-button>
    </template>
    <sakuga-content-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit"></sakuga-content-form>
  </j-modal>
</template>

<script>

import SakugaContentForm from './SakugaContentForm'
export default {
  name: 'SakugaContentModal',
  components: {
    SakugaContentForm
  },
  data () {
    return {
      title: '',
      width: 1400,
      visible: false,
      disableSubmit: false
    }
  },
  methods: {
    add () {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.add();
      })
    },
    edit (record) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.edit(record);
      })
    },
    close () {
      this.$emit('close');
      this.$refs.realForm.videoUrl = ''
      this.visible = false;
    },
    handleOk () {
      this.$refs.realForm.submitForm();
    },
    submitCallback() {
      this.$emit('ok');
      this.$refs.realForm.videoUrl = ''
      this.visible = false;
    },
    handleCancel () {
      this.close()
    }
  }
}
</script>
