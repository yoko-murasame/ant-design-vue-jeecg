<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    switchFullscreen
    @ok="handleOk"
    :okButtonProps="{ class:{'jee-hidden': disableSubmit} }"
    @cancel="handleCancel"
    cancelText="关闭">
    <template v-slot:footer>
      <cancel-button :disableSubmit="disableSubmit" key="back" @click="handleCancel" style="margin-right: 8px"/>
      <a-button type="primary" @click="$refs.realForm.prev()" v-if="!disableSubmit && hasPrev" :disabled="!hasPrev">上一步</a-button>
      <a-button type="primary" @click="$refs.realForm.next()" v-if="!disableSubmit && hasNext" :disabled="!hasNext">下一步</a-button>
      <a-button type="primary" @click="handleOk(1)" v-if="!disableSubmit && temporarilySave">保存</a-button>
      <a-button type="primary" @click="handleOk(2)" v-if="!disableSubmit && formalSave && !hasNext">完成</a-button>
      <!--<a-button type="primary" @click="handleOk(3)" v-if="!disableSubmit && submitProcess">提交</a-button>-->
      <!--<a-button type="primary" @click="handleOk(2)" v-if="!disableSubmit && !temporarilySave && !formalSave && !submitProcess">提交</a-button>-->
    </template>
    <ztb-xedj-form
      ref="realForm"
      @ok="submitCallback"
      @autoSubmitProcess="autoSubmitProcess"
      :disabled="disableSubmit"
      :view-mode="disableSubmit"
      @update:hasPrev="e => hasPrev = e"
      @update:hasNext="e => hasNext = e"
    ></ztb-xedj-form>
  </j-modal>
</template>

<script>
import ZtbXedjForm from './ZtbXedjForm'

export default {
  name: 'ZtbXedjModal',
  components: {
    ZtbXedjForm
  },
  props: {
    // 暂存
    temporarilySave: {
      type: [Boolean, String],
      default: false
    },
    // 保存
    formalSave: {
      type: [Boolean, String],
      default: true
    },
    // 提交流程
    submitProcess: {
      type: [Boolean, String],
      default: false
    }
  },
  data () {
    return {
      title: '',
      width: 1250,
      visible: false,
      disableSubmit: false,
      hasPrev: false,
      hasNext: true
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
      this.visible = false;
    },
    /**
     * 1 暂存 忽略校验
     * 2 保存 校验必填
     * 3 提交 校验必填&自动发起流程
     * @param type
     */
    handleOk (type) {
      this.$refs.realForm.submitForm(type);
    },
    autoSubmitProcess(record) {
      if (!record && !record.id) {
        this.$message.warning('保存接口未返回数据项id,流程自动提交失败!');
      } else if (record.bpmStatus === '2') {
        this.$message.info('流程已发起')
      } else if (record.bpmStatus === '3') {
        this.$message.info('流程已完成')
      } else {
        this.$emit('autoSubmitProcess', record);
      }
    },
    submitCallback() {
      this.$emit('ok');
      this.visible = false;
    },
    handleCancel () {
      this.close()
    }
  }
}
</script>
