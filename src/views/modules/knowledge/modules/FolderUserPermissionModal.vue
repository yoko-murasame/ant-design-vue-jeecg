<template>
  <a-modal
    :title="title"
    :width="modalWidth"
    @ok="handleOk"
    @cancel="handleCancel"
    :ok-button-props="{ props: { disabled: disableSubmit } }"
    :cancel-button-props="{ props: { disabled: disableSubmit } }"
    :visible="visible"
    :confirmLoading="confirmLoading"
  >
    <div :style="{ width: '100%', background: '#fff' }">
      <a-spin :spinning="confirmLoading">
        <j-form-container :disabled="formDisabled">
          <a-form :form="form" slot="detail">
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="选中目录" hasFeedback>
              <j-search-select-tag
                v-decorator="['folderId', validatorRules.folderId]"
                placeholder="请选择目录"
                dict="technical_folder,name,id"
                :async="true"
                :pageSize="1"
              />
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="个人可见授权" hasFeedback>
              <j-select-user-by-dep :multi="true" v-decorator="['usernames']" />
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="全部可见授权" hasFeedback>
              <j-select-user-by-dep :multi="true" v-decorator="['superUsernames']" />
            </a-form-item>
          </a-form>
        </j-form-container>
      </a-spin>
    </div>
  </a-modal>
</template>

<script>
import { postAction } from '@/api/manage'

export default {
  name: 'FolderUserPermissionModal',
  components: {},
  props: {},
  data() {
    return {
      modalWidth: 1000,
      title: '操作',
      visible: false,
      disableSubmit: false,
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      confirmLoading: false,
      form: this.$form.createForm(this),
      formDisabled: false,
      validatorRules: {
        folderId: {
          rules: [{ required: true, message: '请选择目录!' }]
        }
      }
    }
  },
  computed: {
  },
  created() {
  },
  mounted() {
  },
  methods: {
    add(record = {}) {
      this.edit(record)
    },
    edit(record) {
      this.resetScreenSize()
      this.form.resetFields()
      postAction('/technical/folder/user/permission/queryPermission', { folderId: record.id })
      .then(res => {
        if (res.success) {
          const result = res.result || []
          const usernames = result.map(e => e.username).join(',')
          const superUsernames = result.filter(e => e.dataPermissionType === 'KNOWLEDGE_FOLDER_USER_FULL')
                .map(e => e.username).join(',')
          this.model = {
            folderId: record.id,
            usernames,
            superUsernames
          }
          this.visible = true
          this.$nextTick(() => {
            this.form.setFieldsValue(this.model)
          })
        }
      })
    },
    close() {
      this.$emit('close')
      this.disableSubmit = false
      this.visible = false
    },
    handleOk() {
      const that = this
      this.form.validateFields((err, values) => {
        if (!err) {
          let formData = Object.assign(this.model, values)
          that.confirmLoading = true
          postAction('/technical/folder/user/permission/savePermission', {
            folderId: formData.folderId,
            usernames: formData.usernames.split(','),
            superUsernames: formData.superUsernames.split(',')
          }).then(res => {
            if (res.success) {
              that.$message.success(res.message)
              that.$emit('ok', { id: formData.folderId })
            } else {
              that.$notification.warning({
                message: '出错提醒',
                description: res.message
              })
            }
          }).finally(() => {
            that.confirmLoading = false
            that.close()
          })
        }
      })
    },
    handleCancel() {
      this.close()
    },
    // 根据屏幕变化,设置抽屉尺寸
    resetScreenSize() {
      let screenWidth = document.body.clientWidth
      if (screenWidth < 500) {
        this.modalWidth = screenWidth
      }
    }
  }
}
</script>
<style scoped lang="less">
</style>
