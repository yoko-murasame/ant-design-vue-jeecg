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
            <!-- <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="上级目录"
              hasFeedback >
              <a-tree-select
                allowClear
                tree-data-simple-mode
                style="width: 100%"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                :replaceFields="{children:'children', title:'name', key:'id',value:'id'}"
                :tree-data="treeData"
                :load-data="onLoadChildrenData"
                placeholder="请选择上级目录" v-decorator="[ 'parentId', validatorRules.parentId]" />
            </a-form-item> -->
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="目录名称" hasFeedback>
              <a-input placeholder="请输入名称" v-decorator="['name', validatorRules.name]" />
            </a-form-item>
          </a-form>
        </j-form-container>
      </a-spin>
    </div>
  </a-modal>
</template>

<script>
/* eslint-disable */
import Vue from 'vue'
import { PROJECT_ID, BUSINESS_ID, BUSINESS_NAME } from '@/store/mutation-types'
import { putAction, postAction, getAction } from '@/api/manage'
import { mapGetters } from 'vuex'

export default {
  name: 'FolderModal',
  components: {},
  props: {},
  data() {
    return {
      modalWidth: 700,
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
        name: {
          rules: [{ required: true, message: '请输入目录名称!' }]
        },
        parentId: {
          rules: [{ required: false, message: '请选择上级目录!' }]
        }
      },
      treeData: []
    }
  },
  computed: {
    ...mapGetters([PROJECT_ID, BUSINESS_ID, BUSINESS_NAME])
  },
  created() {},
  mounted() {},
  methods: {
    add(record = {}) {
      // 默认值
      this.edit(record)
    },
    edit(record, isDisabled) {
      this.resetScreenSize() // 调用此方法,根据屏幕宽度自适应调整抽屉的宽度
      this.form.resetFields()
      this.getTreeRootData()
      if (isDisabled) {
        this.formDisabled = true
      } else {
        this.formDisabled = false
      }
      this.model = Object.assign({}, record)
      this.visible = true
      this.$nextTick(() => {
        this.form.setFieldsValue(this.model)
      })
    },
    close() {
      console.log('close')
      this.$emit('close')
      this.disableSubmit = false
      this.visible = false
    },
    handleOk() {
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          let formData = Object.assign(this.model, values)
          that.confirmLoading = true
          let obj
          console.log(formData)
          let isAdd = false
          if (!formData.parentId) {
            console.log('新建根')
            formData.type = 'DOCUMENT'
            formData[PROJECT_ID] = this[PROJECT_ID]
            formData[BUSINESS_ID] = this[BUSINESS_ID]
            obj = getAction('/technical/folder/business/saveRoot', formData)
          } else {
            obj = getAction('/technical/folder/saveChild', formData)
          }
          if (!this.model.id) {
            formData.id = undefined
            isAdd = true
          } else {
            formData.id = this.model.id
            isAdd = false
          }
          obj
            .then(res => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok', res.result, isAdd)
              } else {
                that.$notification.warning({
                  message: '出错提醒',
                  description: res.message
                })
              }
            })
            .finally(() => {
              that.confirmLoading = false
              that.close()
            })
        }
      })
    },
    handleCancel() {
      console.log('handleCancel')
      this.close()
    },
    // 根据屏幕变化,设置抽屉尺寸
    resetScreenSize() {
      let screenWidth = document.body.clientWidth
      if (screenWidth < 500) {
        this.modalWidth = screenWidth
      } else {
        this.modalWidth = 700
      }
    },
    getTreeRootData() {
      getAction(`/technical/folder/business/findRoot?projectId=${this[PROJECT_ID]}&businessId=${this[BUSINESS_ID]}&businessName=${this[BUSINESS_NAME]}&type=DOCUMENT`).then(res => {
        if (res.success) {
          this.treeData = res.result
        } else {
          this.$notification.error({
            message: '出错提示',
            description: res.message
          })
        }
      })
    },
    onLoadChildrenData(treeNode) {
      return new Promise(resolve => {
        if (treeNode.dataRef.children) {
          resolve()
          return
        }
        getAction('/technical/folder/findChild?parentId=' + treeNode.dataRef.id).then(res => {
          if (res.success) {
            treeNode.dataRef.children = res.result
            this.treeData = [...this.treeData]
            resolve()
          } else {
            this.$notification.error({
              message: '出错提示',
              description: res.message
            })
            reject()
          }
        })
      })
    }
  }
}
</script>

<style scoped></style>
