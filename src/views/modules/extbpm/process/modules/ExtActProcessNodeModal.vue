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
          :wrapperCol="wrapperCol">
          <a-input placeholder="请输入PC表单地址" v-decorator="['modelAndView', {}]" />
          <span style="color: red;font-size: 12px">备注：添加参数`?edit=1`表示当前流程节点的表单可编辑。</span>
          <span slot="label">
            <a-tooltip :overlayStyle="{'min-width': '55vw'}">
              <span>PC表单地址</span>
              <span slot="title">
                1.添加参数`?edit=1`或者`?edit=true`表示当前流程节点的表单可编辑。<br/>
                2.自定义开发表单，请将组件放在：`views/下`，如组件实际路径：`views/xxx/modules/CustomForm`，填写路径：`xxx/modules/CustomForm`。<br/>
                3.Online表单目前支持性不好，不建议使用！<br/>
                4.kForm设计器，请勿修改默认组件路径，当然你可以自己添加功能！<br/>
                5.Online列表，请勿修改默认组件路径，当然你可以自己添加功能！
              </span>
              <a-icon class="question-circle" type="question-circle-o"/>
            </a-tooltip>
          </span>
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
          :wrapperCol="wrapperCol">
          <span slot="label">
            <a-tooltip :overlayStyle="{'min-width': '55vw'}">
              <span>Online表单特殊配置</span>
              <span slot="title">
                { <br/>
                "code": "", // KForm设计器模式下，以表名为准；Online列表模式下，以onlineCode为准；<br/>
                "initQueryParam": {}, // 初始化参数，与下面配置“初始化表单参数Getter”共同作用并注入到流程审批全局上下文，可以自动控制Online列表搜索、表单默认填充等。<br/>
                "showDealBlock": true, // 是否显示表单页面的审批组件模块（与表单页面集成）<br/>
                "showQueryBlock": true, // Online列表模式下生效，是否显示查询模块<br/>
                "addButtonName": "新增", // Online列表模式下生效，用于配置Online列表的新增按钮名称。<br/>
                "queryById": "/当前主表表单的byId接口/get接口/queryById" // Online列表模式下生效，用于配置Online列表流程组件去查询主表表单数据。<br/>
                "whichButtonToUse": "确认提交" // KForm设计器模式下生效，控制多分支下，哪个按钮可以触发表单提交，多个按钮通过逗号分隔。<br/>
                }
              </span>
              <a-icon class="question-circle" type="question-circle-o"/>
            </a-tooltip>
          </span>
          <j-code-editor
            ref="codeEditorConfig"
            language="javascript"
            v-decorator="['onlineFormConfig', validatorRules.onlineFormConfig]"
            :fullScreen="true"
            @change="handleConfigChange"
            style="min-height: 100px"/>
        </a-form-item>
        <a-form-item
          v-show="['2', '4'].includes(form.getFieldValue('modelAndViewType'))"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol">
          <span slot="label">
            <a-tooltip :overlayStyle="{'min-width': '55vw'}">
              <span>初始化表单参数Getter</span>
              <span slot="title">
                这里返回的对象参数，将自动合并到：`Online表单特殊配置->initQueryParam`，并注入到流程审批全局上下文，可以自动控制Online列表搜索、表单默认填充等。<br/>
                1、JS增强支持await语法。<br/>
                2、已提供流程中的业务流转数据参数：`formData`、`record`。<br/>
                3、最后一行代码务必return 对象，如：`return {}`。
              </span>
              <a-icon class="question-circle" type="question-circle-o"/>
            </a-tooltip>
          </span>
          <j-code-editor
            ref="codeEditorGetter"
            language="javascript"
            v-decorator="['onlineInitQueryParamGetter', validatorRules.onlineInitQueryParamGetter]"
            :fullScreen="true"
            style="min-height: 100px"/>
          <span style="color: red;font-size: 12px"></span>
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
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="是否显示处理意见框">
          <a-switch checked-children="是" un-checked-children="否" v-decorator="['showMessageHandle', validatorRules.showMessageHandle]" />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol">
          <span slot="label">
            <a-tooltip :overlayStyle="{'min-width': '32vw'}">
              <span>自定义任务处理模块</span>
              <span slot="title">
                请基于`src/views/modules/bpm/mixins/TaskModuleMixin.js`混入插件实现自定义审批组件。<br/>
                可以参考组件：`src/views/modules/bpm/task/form/TaskModule.vue`。
              </span>
              <a-icon class="question-circle" type="question-circle-o"/>
            </a-tooltip>
          </span>
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
          showMessageHandle: { valuePropName: 'checked', rules: [{ required: false, message: '是否显示处理意见框!' }], initialValue: true },
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
          // this.$refs.codeEditorConfig.setCodeContent(newConfigStr)
        } catch (e) {
          console.error('JSON解析错误', e)
        }
      },
      /**
       * 表单类型改变，自动填充默认组件
       * @param value
       */
      handleFormTypeChange (value) {
        this.form.setFieldsValue({ onlineFormConfig: '', onlineInitQueryParamGetter: '' })
        // this.$refs.codeEditorConfig.setCodeContent('')
        // this.$refs.codeEditorGetter.setCodeContent('')
        // online表单
        if (value === '1') {
          this.form.setFieldsValue({ modelAndView: `modules/bpm/task/form/OnlineFormDetail` })
        }
        // kForm表单
        if (value === '2') {
          const defaultKFormConfig = {
            // 设计器code，默认和流程的表名一致
            code: '',
            // 初始化筛选参数
            initQueryParam: {},
            // 展示审批模块
            showDealBlock: true,
            // 确认提交的按钮名称，多个用逗号隔开
            whichButtonToUse: '确认提交'
          }
          this.$nextTick(() => {
            let onlineFormConfigStr = JSON.stringify(defaultKFormConfig, null, 2)
            let onlineInitQueryParamGetterStr =
              `// 这里返回的对象参数，将自动合并到：\n` +
              `// Online表单特殊配置->initQueryParam，并注入到流程审批全局上下文\n` +
              `// initQueryParam可以用于自动控制Online列表搜索、表单默认填充等操作！\n` +
              `// formData：流程流转数据，有很多信息！\n` +
              `// record：当前表单数据！\n` +
              `console.log('初始化表单参数Getter', formData, record)\n` +
              `return {}`
            this.form.setFieldsValue({
              modelAndView: `modules/online/cgform/auto/KFormBpmForm`,
              onlineFormConfig: onlineFormConfigStr,
              onlineInitQueryParamGetter: onlineInitQueryParamGetterStr
            })
            // this.$refs.codeEditorConfig.setCodeContent(onlineFormConfigStr)
            // this.$refs.codeEditorGetter.setCodeContent(onlineInitQueryParamGetterStr)
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
            queryById: '/当前主表表单的byId接口/get接口/queryById'
          }
          this.$nextTick(() => {
            let onlineFormConfigStr = JSON.stringify(defaultOnlineConfig, null, 2)
            let onlineInitQueryParamGetterStr =
              `// 这里返回的对象参数，将自动合并到：\n` +
              `// Online表单特殊配置->initQueryParam，并注入到流程审批全局上下文\n` +
              `// initQueryParam可以用于自动控制Online列表搜索、表单默认填充等操作！\n` +
              `// formData：流程流转数据，有很多信息！\n` +
              `// record：Online表单特殊配置->queryById接口查询出来的表单数据！\n` +
              `console.log('初始化表单参数Getter', formData, record)\n` +
              `return {}`
            this.form.setFieldsValue({
              modelAndView: `modules/online/cgform/auto/OnlCgformAutoListBpmForm`,
              onlineFormConfig: onlineFormConfigStr,
              onlineInitQueryParamGetter: onlineInitQueryParamGetterStr
            })
            // this.$refs.codeEditorConfig.setCodeContent(onlineFormConfigStr)
            // this.$refs.codeEditorGetter.setCodeContent(onlineInitQueryParamGetterStr)
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
        this.$nextTick(async () => {
          // await this.$refs.codeEditorConfig._getCoder()
          // await this.$refs.codeEditorGetter._getCoder()
          // 时间格式化
          this.form.setFieldsValue(pick(this.model,
            'showReject', 'showMessageHandle', 'customTaskModule',
            'showTask', 'showProcess', 'onlineCode', 'onlineFormConfig', 'onlineInitQueryParamGetter',
            'modelAndViewType', 'formId', 'processId', 'processNodeCode',
            'processNodeName', 'modelAndView', 'modelAndViewMobile', 'nodeTimeout', 'nodeBpmStatus'))
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
