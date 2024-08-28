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

        <!--<a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="formId">
          <a-input placeholder="请输入formId" v-decorator="['formId', {}]" />
        </a-form-item>-->
        <!--<a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="流程ID">
          <a-input placeholder="请输入流程ID" v-decorator="['processId', {}]" />
        </a-form-item>-->
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="节点名称">
          <a-input placeholder="请输入节点名称" v-decorator="['processNodeName', {}]" />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="节点编码">
          <a-input placeholder="请输入节点编码" v-decorator="['processNodeCode', {}]" />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="PC表单类型">
          <a-select v-decorator="['modelAndViewType', {}]" placeholder="请选择PC表单类型" @change="handleFormTypeChange">
            <a-select-option value="1">Online表单(暂不支持自定义Online表单配置)</a-select-option>
            <a-select-option value="2">kForm设计器(支持自定义Online表单配置)</a-select-option>
            <a-select-option value="3">自定义开发</a-select-option>
            <a-select-option value="4">Online列表(支持自定义Online表单配置)</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          v-show="['1', '2', '3', '4'].includes(form.getFieldValue('modelAndViewType'))"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="PC表单地址">
          <a-input placeholder="请输入PC表单地址" v-decorator="['modelAndView', {}]" />
          <span style="color: red;font-size: 12px">备注：添加参数`?edit=1`表示当前流程节点的表单可编辑。</span>
        </a-form-item>
        <a-form-item
          v-show="['4'].includes(form.getFieldValue('modelAndViewType'))"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="online列表编码">
          <j-search-select-tag
            v-decorator="['onlineCode', validatorRules.onlineCode]"
            @change="handleSearchSelectChange"
            placeholder="online列表编码"
            dict="onl_cgform_head,table_txt,id"
            :async="true"
            :pageSize="20"
          />
        </a-form-item>
        <a-form-item
          v-show="['2', '4'].includes(form.getFieldValue('modelAndViewType'))"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="Online表单特殊配置">
          <j-code-editor
            ref="codeEditor"
            language="javascript"
            v-decorator="['onlineFormConfig', validatorRules.onlineFormConfig]"
            :fullScreen="true"
            @change="handleConfigChange"
            style="min-height: 100px"/>
        </a-form-item>
        <a-form-item
          v-show="['2', '4'].includes(form.getFieldValue('modelAndViewType'))"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="初始化表单参数Getter">
          <j-code-editor
            ref="codeEditor"
            language="javascript"
            v-decorator="['onlineInitQueryParamGetter', validatorRules.onlineInitQueryParamGetter]"
            :fullScreen="true"
            style="min-height: 100px"/>
          <span style="color: red;font-size: 12px">备注：JS增强支持await语法，最后一行代码务必return 对象，如：`return {}`。</span>
        </a-form-item>
        <!--<a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="流程状态">
          <a-input placeholder="请输入流程状态" v-decorator="['nodeBpmStatus', {}]" />
        </a-form-item>-->
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="是否显示任务处理模块">
          <a-switch checked-children="是" un-checked-children="否" v-decorator="['showTask', validatorRules.showTask]" />
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="是否显示流程图模块">
          <a-switch checked-children="是" un-checked-children="否" v-decorator="['showProcess', validatorRules.showProcess]" />
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="是否显示驳回按钮">
          <a-switch checked-children="是" un-checked-children="否" v-decorator="['showReject', validatorRules.showReject]" />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="自定义任务处理模块">
          <a-input placeholder="自定义任务处理模块" v-decorator="['customTaskModule', validatorRules.customTaskModule]" />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="移动表单地址">
          <a-input placeholder="请输入移动表单地址" v-decorator="['modelAndViewMobile', {}]" />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="超时提醒（时）">
          <a-input-number v-decorator="[ 'nodeTimeout', {}]" :min="0"/> （单位小时，0表示不提醒）
        </a-form-item>

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { httpAction } from '@/api/manage'
import pick from 'lodash.pick'

export default {
    name: 'ExtActProcessNodeModal',
    props: {
      processId: {
        type: String,
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
          onlineCode: { rules: [{ required: false, message: '请选择Online编码!' }] },
          showTask: { valuePropName: 'checked', rules: [{ required: false, message: '是否显示任务处理模块!' }], initialValue: true },
          showProcess: { valuePropName: 'checked', rules: [{ required: false, message: '是否显示流程图模块!' }], initialValue: true },
          showReject: { valuePropName: 'checked', rules: [{ required: false, message: '是否显示驳回按钮!' }], initialValue: false },
          customTaskModule: { rules: [{ required: false, message: '自定义任务处理模块!' }] },
          onlineFormConfig: { rules: [{ required: false, message: '请配置参数!' }] },
          onlineInitQueryParamGetter: { rules: [{ required: false, message: '请配置初始化参数增强!' }] }
        },
        url: {
          add: '/act/process/extActProcessNode/add',
          edit: '/act/process/extActProcessNode/edit'
        }
      }
    },
    created () {
    },
    methods: {
      handleConfigChange(config) {
        console.log(config)
      },
      handleSearchSelectChange(v) {
        if (!v) {
          return
        }
        let nowConfig = this.form.getFieldValue('onlineFormConfig')
        try {
          const newConfig = JSON.parse(nowConfig)
          newConfig.code = v
          const newConfigStr = JSON.stringify(newConfig, null, 2)
          console.log(newConfig, newConfigStr)
          this.form.setFieldsValue({ onlineFormConfig: newConfigStr })
          this.$refs.codeEditor.setCodeContent(newConfigStr)
        } catch (e) {
          console.error('JSON解析错误', e)
        }
      },
      /**
       * 表单类型改变，自动填充默认组件
       * @param value
       */
      handleFormTypeChange (value) {
        // online表单
        if (value === '1') {
          this.form.setFieldsValue({ modelAndView: `modules/bpm/task/form/OnlineFormDetail` })
        }
        // kForm表单
        if (value === '2') {
          const defaultKFormConfig = {
            // 设计器code，默认和流程的表名一致
            code: '',
            // 展示审批模块
            showDealBlock: true,
            // 初始化筛选参数
            initQueryParam: {},
            // 确认提交的按钮名称
            whichButtonToUse: '确认提交'
          }
          this.form.setFieldsValue({
            modelAndView: `modules/online/cgform/auto/KFormBpmForm`,
            onlineFormConfig: JSON.stringify(defaultKFormConfig, null, 2)
          })
        }
        // 自定义表单
        if (value === '3') {
          this.form.setFieldsValue({ modelAndView: `views/下的组件路径，记得把views去掉/CustomFormDetail` })
        }
        // online列表
        if (value === '4') {
          const defaultOnlineConfig = {
            // 表单code，自动从流程配置获取
            code: this.form.getFieldValue('onlineCode') || '',
            // 展示审批模块
            showDealBlock: true,
            // 展示查询模块
            showQueryBlock: true,
            // 初始化筛选参数
            initQueryParam: {},
            // 新增按钮文本
            addButtonName: '新增',
            // byId接口
            queryById: '/warning/tbBisWarning/queryById'
          }
          this.form.setFieldsValue({
            modelAndView: `modules/online/cgform/auto/OnlCgformAutoListBpmForm`,
            onlineFormConfig: JSON.stringify(defaultOnlineConfig, null, 2)
          })
        }
      },
      add (processId) {
        this.edit({ processId: processId })
      },
      edit (record) {
        this.form.resetFields()
        this.model = Object.assign({}, record)
        this.visible = true
        this.$nextTick(() => {
          // 时间格式化
          this.$refs.codeEditor._getCoder().then(() => {
            this.form.setFieldsValue(pick(this.model,
              'showReject', 'customTaskModule',
              'showTask', 'showProcess', 'onlineCode', 'onlineFormConfig', 'onlineInitQueryParamGetter',
              'modelAndViewType', 'formId', 'processId', 'processNodeCode',
              'processNodeName', 'modelAndView', 'modelAndViewMobile', 'nodeTimeout', 'nodeBpmStatus'))
          })
        })
      },
      close () {
        this.$emit('close')
        this.visible = false
      },
      handleOk () {
        const that = this
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true
            let httpurl = ''
            let method = ''
            if (!this.model.id) {
              httpurl += this.url.add
              method = 'post'
            } else {
              httpurl += this.url.edit
               method = 'put'
            }
            let formData = Object.assign(this.model, values)
            // 时间格式化

            console.log(formData)
            httpAction(httpurl, formData, method).then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            }).finally(() => {
              that.confirmLoading = false
              that.close()
            })
          }
        })
      },
      handleCancel () {
        this.close()
      }

    }
  }
</script>

<style scoped>

</style>
