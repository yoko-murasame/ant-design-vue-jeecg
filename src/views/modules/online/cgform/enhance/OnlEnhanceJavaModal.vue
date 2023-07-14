<template>
  <a-modal
    title="JAVA增强"
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
        <a-select :getPopupContainer="node => node.parentNode" v-decorator="[ 'buttonCode']" placeholder="请选择页面控件">
          <a-select-option value="add">新增</a-select-option>
          <a-select-option value="edit">编辑</a-select-option>
          <a-select-option value="delete">删除</a-select-option>
          <a-select-option value="import">导入</a-select-option>
          <a-select-option value="export">导出</a-select-option>
          <a-select-option value="query">查询</a-select-option>
          <template v-for="(item,index) in btnList">
            <a-select-option :key="index" :value="item.buttonCode">{{ item.buttonName }}</a-select-option>
          </template>
        </a-select>
      </a-form-item>

      <a-form-item label="事件状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-radio-group name="radioGroup" v-decorator="[ 'event']">
          <a-radio value="start">开始</a-radio>
          <a-radio value="end">结束</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-radio-group name="radioGroup" v-decorator="[ 'cgJavaType']">
          <a-radio value="spring">spring-key</a-radio>
          <a-radio value="class">java-class</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="内容" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-input placeholder="请输入内容" v-decorator="[ 'cgJavaValue',{rules: [{ required: true, message: '请输入内容!' }]}]"></a-input>
      </a-form-item>

      <a-form-item label="是否生效" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-radio-group name="radioGroup" v-decorator="[ 'activeStatus']">
          <a-radio value="1">有效</a-radio>
          <a-radio value="0">无效</a-radio>
        </a-radio-group>
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
    name: 'OnlEnhanceJavaModal',
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
        url: '/online/cgform/head/enhanceJava/',
        model: {
          buttonCode: 'add',
          event: 'end',
          cgJavaType: 'spring',
          activeStatus: '1'
        }
      }
    },
    methods: {
      add() {
        this.edit({
          buttonCode: 'add',
          event: 'end',
          cgJavaType: 'spring',
          cgJavaValue: '',
          activeStatus: '1'
        });
      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model, 'buttonCode', 'activeStatus', 'cgJavaValue', 'cgJavaType', 'event'))
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
