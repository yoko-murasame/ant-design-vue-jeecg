<template>
  <a-modal
    title="SQL增强"
    :width="modalWidth"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    cancelText="关闭"
    wrapClassName="ant-modal-cust-warp"
    style="top:5%;height: 95%;">

    <template slot="footer">
      <a-button key="back" @click="handleCancel">关闭</a-button>
      <a-button key="submit" type="primary" @click="handleSubmit">确定</a-button>
    </template>

    <a-form :form="form">

      <a-form-item label="页面按钮" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-select v-decorator="[ 'buttonCode']" placeholder="请选择页面控件" :getPopupContainer="node => node.parentNode">
          <a-select-option value="add">新增</a-select-option>
          <a-select-option value="edit">编辑</a-select-option>
          <a-select-option value="delete">删除</a-select-option>
          <template v-for="(item,index) in btnList">
            <a-select-option :key="index" :value="item.buttonCode">{{ item.buttonName }}</a-select-option>
          </template>
        </a-select>
      </a-form-item>

      <a-form-item label="增强SQL" :labelCol="labelCol" :wrapperCol="wrapperCol" >
        <div class="coder-cust-height">
          <j-code-editor
            ref="codeEditor"
            language="sql"
            placeholder="请输入SQL语句"
            :language-change="false"
            :lineNumbers="false"
            :fullScreen="true"
            :min-height="320"
            @input="handleInputCgbSql"></j-code-editor>
        </div>
        <a-textarea :hidden="true" v-decorator="['cgbSql']"/>
      </a-form-item>

      <a-form-item label="描述" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-textarea :rows="2" placeholder="请输入描述" v-decorator="[ 'content']" ></a-textarea>
      </a-form-item>

    </a-form>
  </a-modal>
</template>

<script>
  import ATextarea from 'ant-design-vue/es/input/TextArea'
  import { postAction, getAction, putAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import { AiTestOnlineMixin } from '@/views/modules/aitest/onlinetest.mixins'

  export default {
    name: 'OnlEnhanceSqlModal',
    mixins: [AiTestOnlineMixin],
    components: { ATextarea },
    props: {
      code: {
        type: String,
        required: true,
        default: ''
      },
      btnList: {
        type: Array,
        default: () => [],
        required: false
      }
    },
    data() {
      return {
        modalWidth: 800,
        visible: false,
        confirmLoading: false,
        form: this.$form.createForm(this),
        labelCol: {
          xs: { span: 24 },
          sm: { span: 4 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        },
        url: '/online/cgform/head/enhanceSql/',
        model: {
          buttonCode: 'add',
          cgbSql: '',
          content: ''
        }
      }
    },
    methods: {
      handleInputCgbSql(value) {
        this.form.setFieldsValue({ cgbSql: value })
      },
      add() {
        this.edit({
          buttonCode: 'add',
          cgbSql: '',
          content: ''
        });
      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model, 'buttonCode', 'cgbSql', 'content'))
          this.$refs.codeEditor.setCodeContent(this.model.cgbSql || '')
        });
      },
      handleSubmit() {
        this.form.validateFields((err, values) => {
          if (!err) {
            this.confirmLoading = true;
            let promiseForm;
            if (!this.model.id) {
              promiseForm = postAction(this.url + this.code, values)
            } else {
              let formData = Object.assign(this.model, values)
              promiseForm = putAction(this.url + this.code, formData)
            }
            promiseForm.then(res => {
              this.confirmLoading = false;
              if (res.success) {
                this.visible = false
                this.$message.success(res.message)
                this.$emit('ok')
              } else {
                this.$message.warning(res.message)
              }
            })
          }
        })
      },
      handleCancel() {
        this.visible = false
      }

    }
  }
</script>

<style scoped>

</style>
