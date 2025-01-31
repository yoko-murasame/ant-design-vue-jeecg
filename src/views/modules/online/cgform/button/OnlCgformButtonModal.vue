<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭">

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="按钮编码">
          <a-input placeholder="请输入按钮编码" v-decorator="['buttonCode',{rules: [{ required: true, message: '请输入按钮编码!' }]}]" />
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="按钮名称">
          <a-input placeholder="请输入按钮名称" v-decorator="['buttonName',{rules: [{ required: true, message: '请输入按钮名称!' }]}]" />
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="按钮样式">
          <a-select placeholder="请选择按钮样式" @change="handleStyleChange" v-decorator="['buttonStyle']" :getPopupContainer="node => node.parentNode">
            <a-select-option value="link">link(放在更多按钮下拉列表的动态按钮)</a-select-option>
            <a-select-option value="link-pre">link-pre(放在默认按钮前的动态按钮)</a-select-option>
            <a-select-option value="link-after">link-after(放在默认按钮后&更多按钮前的动态按钮)</a-select-option>
            <a-select-option value="button">button(和“新增”按钮同级的按钮)</a-select-option>
            <a-select-option value="form">form(放在表单里的按钮)</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          v-show="formButton"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="按钮位置">
          <a-select placeholder="请选择按钮位置" v-decorator="['optPosition',{initialValue:'2'}]" :getPopupContainer="node => node.parentNode">
            <a-select-option value="1">侧面</a-select-option>
            <a-select-option value="2">底部</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="按钮类型">
          <a-select placeholder="请选择按钮类型" v-decorator="['optType']" :getPopupContainer="node => node.parentNode">
            <a-select-option value="js">js</a-select-option>
            <a-select-option value="js-confirm">js-confirm</a-select-option>
            <a-select-option value="action">action</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="排序">
          <a-input-number placeholder="请输入按钮排序" v-decorator="[ 'orderNum']" style="width: 100%"/>
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="按钮图标">
          <a-input placeholder="请输入按钮图标" v-decorator="['buttonIcon']" >
            <a-tooltip slot="suffix" title="a-icon type">
              <a-icon type="info-circle" style="color: rgba(0,0,0,.45)" />
            </a-tooltip>
          </a-input>
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol">
          <span slot="label">
            <a-tooltip :overlayStyle="{'min-width': '25vw'}">
              <span>表达式</span>
              <span slot="title">
                说明：用于根据行数据动态计算按钮是否显示。<br/>
                1、等于表达式：字段名#eq#值。<br/>
                2、不等于表达式：字段名#ne#值。<br/>
                3、判断空：字段名#empty#true。<br/>
                4、非空：字段名#empty#false。<br/>
                5、in表达式： 字段名#in#值。<br/>
                举例：create_by#eq#Yoko 表示数据的 create_by 字段需要等于 Yoko 时才会显示按钮。<br/>
                备注：目前只支持单个字段。<br/>
              </span>
              <a-icon class="question-circle" type="question-circle-o"/>
            </a-tooltip>
          </span>
          <a-input placeholder="请输入表达式" v-decorator="['exp']" />
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="按钮状态">
          <a-select placeholder="请选择按钮状态" v-decorator="['buttonStatus']" :getPopupContainer="node => node.parentNode">
            <a-select-option value="1">激活</a-select-option>
            <a-select-option value="0">未激活</a-select-option>
          </a-select>
        </a-form-item>

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  export default {
    name: 'OnlCgformButtonModal',
    props: {
      code: {
        type: String,
        required: true,
        default: ''
      }
    },
    data () {
      return {
        title: '操作',
        visible: false,
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
        validatorRules: {
        },
        url: {
          add: '/online/cgform/button/add',
          edit: '/online/cgform/button/edit'
        },
        formButton: false
      }
    },
    created () {
    },
    methods: {
      add () {
        this.edit({
          buttonStyle: 'link',
          optType: 'js',
          buttonStatus: '1'
        });
      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.formButton = record.buttonStyle === 'form'
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model, 'optPosition', 'buttonCode', 'buttonIcon', 'buttonName', 'buttonStatus', 'buttonStyle', 'exp', 'optType', 'orderNum'))
        });
      },
      close () {
        this.$emit('close');
        this.visible = false;
      },
      handleOk () {
        const that = this;
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            if (!this.model.id) {
              httpurl += this.url.add;
              method = 'post';
            } else {
              httpurl += this.url.edit;
               method = 'put';
            }
            let formData = Object.assign(this.model, values);
            formData.cgformHeadId = this.code
            console.log(formData)
            httpAction(httpurl, formData, method).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                that.$emit('ok');
              } else {
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
              that.close();
            })
          }
        })
      },
      handleCancel () {
        this.close()
      },

      handleStyleChange(value) {
        this.formButton = value === 'form'
      }

    }
  }
</script>

<style scoped>

</style>
