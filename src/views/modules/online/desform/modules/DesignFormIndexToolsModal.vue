<template>
  <j-modal
    title="索引同步工具"
    width="800px"
    :visible="visible"
    :maskClosable="false"
    :confirmLoading="loading"
    @ok="handleOk"
    @cancel="close()"
  >
    <a-spin :spinning="loading">
      <a-tabs v-model="activeKey">
        <a-tab-pane tab="变更数据格式" key="1" forceRender>
          <a-form-model
            ref="form1"
            :model="tab1.form"
            :rules="tab1.rules"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >

            <a-form-model-item label="组件类型" prop="widgetType">
              <a-select
                v-model="tab1.form.widgetType"
                placeholder="请选择组件类型"
                :options="tab1.widgetTypes"
                style="width: 100%"
                @change="handleForm1WidgetTypeChange"
              />
            </a-form-model-item>

            <a-form-model-item label="请选择操作" prop="action">
              <a-select
                v-model="tab1.form.action"
                placeholder="请选择操作"
                :options="form1ActionOptions"
                style="width: 100%"
              />
              <p style="font-size: 12px; color: #999; margin: 0; line-height: 2;">{{ form1CurrentTip }}</p>
            </a-form-model-item>

            <a-form-model-item label="请选择要操作的组件" prop="model">
              <a-select
                v-model="tab1.form.model"
                placeholder="请选择要操作的组件"
                :options="form1ActionWidgetOptions"
                show-search
                notFoundContent="没有可以操作的组件"
                style="width: 100%"
              />
            </a-form-model-item>

          </a-form-model>
        </a-tab-pane>
        <a-tab-pane tab="变更数据绑定model" key="2" forceRender>
          <a-form-model
            ref="form2"
            :model="tab2.form"
            :rules="tab2.rules "
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-form-model-item label="旧model" prop="oldKey">
              <a-input v-model="tab2.form.oldKey" placeholder="请输入旧model"/>
            </a-form-model-item>
            <a-form-model-item label="新model" prop="newKey">
              <a-select
                v-model="tab2.form.newKey"
                placeholder="请选择  新model"
                :options="form2NewKeyOptions"
                show-search
                style="width: 100%"
              />
            </a-form-model-item>

          </a-form-model>
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </j-modal>
</template>

<script>
  import { axios } from '@/utils/request'
  import { getAction } from '@api/manage'

  export default {
    name: 'DesignFormIndexToolsModal',
    data() {
      return {
        model: null,
        loading: false,
        visible: false,
        activeKey: '1',
        timeout: 600000,

        labelCol: { span: 6 },
        wrapperCol: { span: 14 },

        widgetInfo: [],

        tab1: {
          action: formData => axios({
            url: '/desform/tools/index/formatData',
            method: 'put',
            data: formData,
            timeout: this.timeout
          }),
          form: {
            widgetType: 'input',
            action: undefined,
            model: undefined
          },
          rules: {
            widgetType: [{ required: true, message: '请选择组件类型' }],
            action: [{ required: true, message: '请选择操作' }]
          },
          widgetTypes: [
            { label: '单行文本', value: 'input' },
            { label: '日期选择器', value: 'date' }
          ],
          actions: {
            'input': [
              { label: '将数值转为字符串', value: 'num2str' },
              { label: '将字符串转为数字', value: 'str2num' }
            ],
            'date': [
              { label: '去除时间部分', value: 'remove_time' },
              { label: '增加时间部分', value: 'add_time' }
            ]
          },
          tips: {
            'input': {
              // number to string
              'num2str': '',
              // string to number
              'str2num': '数据中不能包含非数字的字符，否者将会拒绝执行该操作！'
            },
            'date': {
              'remove_time': '例如：处理前 2020-06-01 15:38:23；处理后 2020-06-01',
              'add_time': '例如：处理前 2020-06-01；处理后 2020-06-01 00:00:00'
            }
          }
        },
        tab2: {
          action: formData => axios({
            url: '/desform/tools/index/changeModel',
            method: 'put',
            data: formData,
            timeout: this.timeout
          }),
          form: {
            oldKey: '',
            newKey: undefined
          },
          rules: {
            oldKey: [
              { required: true, message: '请输入旧model' },
              {
                validator: (rule, value, callback) => {
                  // let filter = this.widgetInfo.filter(i => i.model === value)
                  // if (filter.length > 0) {
                  //   callback('不能和现有的model相重复')
                  // } else {
                  callback()
                  // }
                }
              }
            ],
            newKey: [
              { required: true, message: '请选择新model' },
              {
                validator: (rule, value, callback) => {
                  if (this.tab2.form.oldKey === value) {
                    callback('新model不能和旧model相同')
                  } else {
                    callback()
                  }
                }
              }
            ]
          }
        },
        url: {
          // 【接口】获取某个表单的所有组件的基本信息，返回一个数组，数组的每项包含：type、 key、 name、 model
          getWidgetInfoLite: '/desform/tools/getWidgetInfoLite'
        }

      }
    },
    computed: {
      form1ActionOptions() {
        return this.tab1.actions[this.tab1.form.widgetType]
      },
      form1CurrentTip() {
        let { widgetType, action } = this.tab1.form
        return (this.tab1.tips[widgetType] || {})[action]
      },
      form1ActionWidgetOptions() {
        if (this.widgetInfo.length > 0) {
          return this.packageWidgetOptions(this.widgetInfo, this.tab1.form.widgetType)
        }
        return []
      },

      form2NewKeyOptions() {
        if (this.widgetInfo.length > 0) {
          return this.packageWidgetOptions(this.widgetInfo)
        }
        return []
      }
    },
    methods: {

      open(record) {
        this.model = Object.assign({}, record)
        this.visible = true
        this.queryWidgetInfoLite()
      },

      close(ok) {
        this.visible = false
        this.$refs.form1.resetFields()
        this.$refs.form2.resetFields()
        if (ok) {
          this.$emit('ok')
        }
      },

      handleForm1WidgetTypeChange() {
        let { form } = this.tab1
        form.action = undefined
        form.model = undefined
      },

      async queryWidgetInfoLite() {
        let { desformCode } = this.model
        this.loading = true
        let { success, message, result } = await getAction(this.url.getWidgetInfoLite, {
          desformCode: desformCode
        }).finally(() => this.loading = false)
        if (success) {
          this.widgetInfo = result
        } else {
          this.$error({ content: message })
        }
      },

      packageWidgetOptions(widgetInfo, type) {
        return widgetInfo.filter(item => {
          if (type) {
            return item.type === type
          }
          return true
        }).map(item => {
          return {
            label: `${item.model}（${item.name}）`,
            value: item.model
          }
        })
      },

      async handleOk() {
        let formData = await this.getFormData()
        if (formData) {
          let { values, tab, form } = formData
          this.loading = true
          let { success, message } = await tab.action({
            desformCode: this.model.desformCode,
            ...values
          }).finally(() => this.loading = false)
          if (success) {
            this.$confirm({
              content: message,
              okText: '继续操作',
              cancelText: '关闭',
              icon: () => (<a-icon type="check-circle" style="color: #52c41a;"/>),
              onOk: () => form.resetFields(),
              onCancel: () => this.close(true)
            })
          } else {
            this.$error({ content: message })
          }
        }
      },

      /** 验证form表单同时获取数据 */
      async getFormData() {
        try {
          let form = this.$refs['form' + this.activeKey]
          // 验证表单，如果验证失败就会跑出异常，然后就会被catch到
          await form.validate()
          let tab = this['tab' + this.activeKey]
          let values = Object.assign({}, tab.form)
          return { values, tab, form }
        } catch (e) {
          // 捕捉到异常，校验失败，返回null
          return null
        }
      }

    }
  }
</script>

<style scoped>

</style>
