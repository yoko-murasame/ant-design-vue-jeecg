<template>
  <a-modal
    :title="modalTitle"
    :visible="visible"
    :maskClosable="false"
    :confirmLoading="loading"
    :width="800"
    :bodyStyle="{padding:'40px'}"
    @ok="handleOk"
    @cancel="()=>close(false)">

    <a-spin :spinning="loading">
      <a-form :form="form">

        <a-form-item
          label="表单名称"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol">

          <a-input
            placeholder="请输入表单名称"
            v-decorator="[ 'desformName', rules.desformName]"/>
        </a-form-item>

        <a-form-item label="表单编码" :labelCol="labelCol" :wrapperCol="wrapperCol">

          <a-input
            placeholder="请输入表单编码"
            :disabled="isEditing"
            v-decorator="[ 'desformCode', rules.desformCode]"
            @blur="handleDesformCodeBlur"
          />
        </a-form-item>

        <!--   <a-form-item label="表单图标" :labelCol="labelCol" :wrapperCol="wrapperCol">

          <a-input placeholder="点击选择表单图标" v-decorator="[ 'desformIcon']" :readOnly="true">
            <a-icon slot="addonAfter" type="setting" @click="iconChooseVisible=true"/>
          </a-input>

          <icons @choose="handleIconChoose" @close="iconChooseVisible=false" :iconChooseVisible="iconChooseVisible"></icons>

        </a-form-item>-->

        <a-form-item v-if="isCopyView" label="复制方式" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group v-model="copyMethod" button-style="solid">
            <a-radio-button :value="1">完全复制</a-radio-button>
            <a-tooltip title="只有对接了Online表单才能选择模板重新生成" v-bind="copyTypeTooltipProps">
              <a-radio-button :value="2" :disabled="!isDockingCgform">选择模板重新生成</a-radio-button>
            </a-tooltip>
          </a-radio-group>
        </a-form-item>

        <a-form-item v-if="!isEditing && !isCopying && !isCopyView" label="Online表单" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-switch checkedChildren="开启" unCheckedChildren="关闭" v-model="cgformSwitch"/>
          <span style="position: relative;left: 8px;top: 2px;">开启后将自动根据选择的Online表单生成</span>
        </a-form-item>

        <template v-if="cgformSwitch || copyMethod === 2">
          <a-form-item v-if="isAdding" label="选择表单" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-select
              showSearch
              :filterOption="filterCgformOption"
              :options="cgformOptions"
              placeholder="请选择Online表单"
              :getPopupContainer="node => node.parentNode"
              v-decorator="[ 'cgformCode', rules.cgformCode]"/>
          </a-form-item>

          <a-form-item label="表单模板" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-select
              :options="templetOptions"
              placeholder="请选择表单模板"
              :getPopupContainer="node => node.parentNode"
              v-model="templetValue"
              @change="(v,t)=>templetJson = t.data.props.templetJson"/>
          </a-form-item>
        </template>

        <a-form-item v-if="showSetMobileView" label="设为移动视图" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-checkbox-group v-decorator="['izMobileView']">
            <a-checkbox :value="1"/>
          </a-checkbox-group>
          <span>（注：只能有一个移动视图）</span>
        </a-form-item>

      </a-form>
    </a-spin>

    <template slot="footer">
      <a-spin :spinning="loading">
        <span slot="indicator"/>
        <a-row>
          <a-col :span="12" style="text-align: left; line-height: 32px;">
            <a-checkbox v-model="addedAutoOpenDesign" v-if="isAdding">添加后自动打开设计</a-checkbox>
          </a-col>
          <a-col :span="12">
            <a-button @click="()=>close(false)">取消</a-button>
            <a-button type="primary" @click="handleOk">确定</a-button>

          </a-col>
        </a-row>
      </a-spin>
    </template>

  </a-modal>
</template>

<script>
  import Icons from '../../../../system/modules/icon/Icons'

  import { duplicateCheck } from '@/api/api'
  import _desformUtil from '../util/desformUtil'
  import { getAction, httpAction } from '@/api/manage'
  import * as $DFConstant from '../util/DesformConstant'
  import ARadioButton from 'ant-design-vue/es/radio/RadioButton'
  import ARadioGroup from 'ant-design-vue/es/radio/Group'

  const noUseTemplet = '_______no_use_templet_______'
  export default {
    name: 'AddDesignFormModal',
    components: { ARadioGroup, ARadioButton, Icons },
    data() {
      return {
        form: this.$form.createForm(this),
        model: {},
        visible: false,
        currentAction: 'add',
        loading: false,
        templetOptions: [{ label: '请选择模板', value: noUseTemplet, templetJson: null }],
        noUseTemplet,
        templetJson: null,
        templetValue: noUseTemplet,
        // 是否使用Online表单自动生成模板
        cgformSwitch: false,
        cgformValue: noUseTemplet,
        cgformOptions: [],
        allTables: {},
        // 复制方式：1 完全复制；2 选择模板重新生成
        copyMethod: 1,
        rules: {
          cgformCode: { rules: [{ required: true, message: '请选择Online表单!' }] },
          desformName: { rules: [{ required: true, message: '请输入表单名称!' }] },
          desformCode: {
            rules: [
              { required: true, message: '请输入表单编码!' },
              { validator: this.validateDesformCode }
            ]
          }
        },
        labelCol: {
          xs: { span: 24 },
          sm: { span: 4 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 18 }
        },
        iconChooseVisible: false,
        // 添加后自动打开设计
        addedAutoOpenDesign: true,
        url: {
          add: '/desform/add',
          edit: '/desform/edit',
          cgform: {
            headList: '/online/cgform/head/list',
            // 通过 headId 查询字段
            fieldListByHeadId: '/online/cgform/field/listByHeadId',
            fieldListByHeadCode: '/online/cgform/field/listByHeadCode'
          },
          templet: '/desform/templet/packageOptions'
        },
        // 调用 this.$message.loading 返回的方法
        messageLoading: null
      }
    },
    computed: {
      isAdding() {
        return (this.currentAction === 'add')
      },
      isEditing() {
        return (this.currentAction === 'edit')
      },
      isCopying() {
        return (this.currentAction === 'copy')
      },
      isCopyView() {
        return (this.currentAction === 'copy-view')
      },
      modalTitle() {
        return this.isEditing ? '编辑表单' : (this.isCopying ? '复制表单' : this.isCopyView ? '复制视图' : '新增表单')
      },
      showSetMobileView() {
        let { desformType } = this.model
        // 当前为新增，且
        if (!desformType) {
          return false
        }
        if (this.isCopyView) {
          return true
        }
        return desformType !== $DFConstant.DESFORM_TYPE_MV
      },
      // 是否对接了Online表单
      isDockingCgform() {
        return !!this.model.cgformCode
      },
      copyTypeTooltipProps() {
        let props = {
          autoAdjustOverflow: true
        }
        if (this.isDockingCgform) {
          props['visible'] = false
        }
        return props
      }
    },
    created() {
    },
    methods: {

      /** 检验 desformCode */
      validateDesformCode(rule, value, callback) {
        let pattern = /^[a-z|A-Z][a-z|A-Z\d_-]{0,}$/
        if (!pattern.test(value)) {
          callback('编码必须以字母开头，可包含数字、下划线、横杠')
        } else {
          duplicateCheck({
            tableName: 'design_form',
            fieldName: 'desform_code',
            fieldVal: value,
            dataId: (this.model || {}).id
          }).then((res) => {
            res.success ? callback() : callback(res.message)
          })
        }
      },

      open(action = 'add', record) {
        this.requestTemplet()
        this.copyMethod = 1
        this.currentAction = action
        if (this.isEditing || this.isCopying || this.isCopyView) {
          this.model = record
          this.$nextTick(() => {
            let after = this.isCopying ? '_copy' : this.isCopyView ? '_view' : ''
            let izMobileView = this.model['izMobileView']
            this.form.setFieldsValue({
              desformName: this.model['desformName'] + after,
              desformCode: this.model['desformCode'] + after,
              desformIcon: this.model['desformIcon'],
              izMobileView: izMobileView === 1 ? [1] : []
            })
          })
        } else {
          this.model = {}
        }
        this.visible = true
      },
      close(ok) {
        this.visible = false
        if (ok) this.$emit('ok')
        setTimeout(() => {
          this.form.resetFields()
          this.templetJson = null
          this.cgformSwitch = false
          this.templetValue = this.noUseTemplet
        }, 100)
      },

      /** 选择图标 */
      handleIconChoose(value) {
        this.iconChooseVisible = false
        this.form.setFieldsValue({ desformIcon: value })
      },

      handleOk() {
        this.form.validateFields((error, values) => {
          if (!error) {
            let url = this.url.add; let method = 'POST'
            let params = Object.assign({}, values)
            let izMobileView = params['izMobileView'] || []
            params['izMobileView'] = izMobileView && izMobileView.length > 0 ? izMobileView[0] : 0
            if (this.isEditing) {
              url = this.url.edit
              method = 'PUT'
              params['id'] = this.model.id
            } else if (this.isCopying) {
              // 复制表单去除 Online对接
              if (this.isDockingCgform) {
                let desformJSON = JSON.parse(this.model['desformDesignJson'])
                delete params['cgformCode']
                delete desformJSON.config.onlineForm
                params['desformDesignJson'] = JSON.stringify(desformJSON)
              } else {
                params['desformDesignJson'] = this.model['desformDesignJson']
              }
            } else if (this.isCopyView) {
              params['parentId'] = this.model['id']
              params['parentCode'] = this.model['desformCode']
              params['desformType'] = $DFConstant.DESFORM_TYPE_SV
              // 判定复制方式（1 完全复制；2 选择模板重新生成）
              if (this.copyMethod === 1) {
                // update--begin--autor:scott-----date:20201230------for：LOWCOD-1165 表单设计器勾选设为移动视图后，设计的时候没有默认勾选上-----
                let desformJSON = JSON.parse(this.model['desformDesignJson'])
                // JT-263复制移动视图，默认不是移动效果
                if (izMobileView == '1') {
                  desformJSON.config.designMobileView = true
                }
                params['desformDesignJson'] = JSON.stringify(desformJSON)
                // update--end--autor:scott-----date:20200109------for：LOWCOD-1165 表单设计器勾选设为移动视图后，设计的时候没有默认勾选上------
              } else if (this.isDockingCgform) {
                params['cgformCode'] = this.model.cgformCode
              } else {
                this.$message.warn('没有对接Online表单，拒绝执行该操作')
                return
              }
              // return;
            } else if (this.templetJson != null) {
              params['desformDesignJson'] = this.templetJson
            }

            // 查询cgform的field
            let cgformCode = params['cgformCode']
            this.generateDesformJSONByCgform(cgformCode).then(desformJSON => {
              if (desformJSON != null) {
                // update--begin--autor:scott-----date:20201230------for：LOWCOD-1165 表单设计器勾选设为移动视图后，设计的时候没有默认勾选上------
                // JT-263复制移动视图，默认不是移动效果
                if (izMobileView == '1') {
                  desformJSON.config.designMobileView = true
                }
                // update--end--autor:scott-----date:20201230------for：LOWCOD-1165 表单设计器勾选设为移动视图后，设计的时候没有默认勾选上-----
                params['desformDesignJson'] = JSON.stringify(desformJSON)
              }
              this.requestChange(url, params, method)
            }).catch(e => {
              console.error(e)
              this.hideLoading('error', '操作失败：' + e.message)
            })
          }
        })
      },

      /** 关闭加载框方法 */
      hideLoading(type, content) {
        this.loading = false
        // 关掉 this.$message.loading
        if (typeof this.messageLoading === 'function') {
          this.messageLoading()
          this.messageLoading = null
        }
        // 弹出新的 message
        if (type) {
          this.$message[type](content)
        }
      },

      /**
       * 通过Online表单和模板生成表单设计器JSON
       *
       * @param cgformCode Online表单Code
       */
      async generateDesformJSONByCgform(cgformCode) {
        if (cgformCode && cgformCode !== this.noUseTemplet) {
          this.loading = true

          // 调用该方法可关闭加载
          this.messageLoading = this.$message.loading('正在通过Online表单生成中')

          // 包含所有要生成在页面中的表，index0一定是主表，往后都是附表
          let onlineForms = [this.allTables[cgformCode]]
          // 包含所有要查询的cgform，和 onlineForms 一一对应
          let allp = [getAction(this.url.cgform.fieldListByHeadCode, { headCode: cgformCode })]
          // 判断是否包含子表
          let subTables = (onlineForms[0]['subTableStr'] || '').split(',')
          if (subTables[0]) {
            onlineForms = onlineForms.concat(subTables.map(code => {
              allp.push(getAction(this.url.cgform.fieldListByHeadCode, {
                headCode: code
              }))
              return this.allTables[code]
            }))
          }
          try {
            // 查询所有的Online表单（包括主表和子表）
            let results = await Promise.all(allp)
            // 取出主表
            let main = results[0]
            // 根据 online表单 生成 表单设计器JSON
            if (main.success) {
              // Online表单字段配置信息
              let onlineFields = results.map(i => i.result)
              // 通过工具类生成
              let desformJSON = _desformUtil.generateFormBaseCgform(null, onlineForms, onlineFields, this.templetJson)
              // 将online表单保存至config
              desformJSON.config.onlineForm = cgformCode

              return desformJSON
            } else {
              this.hideLoading('error', '生成失败: ' + main.message)
            }
          } catch (e) {
            console.error(e)
            this.hideLoading('error', '生成失败!')
          }
        }
        return null
      },

      /** 请求修改 */
      requestChange(url, params, method) {
        this.loading = true
        httpAction(url, params, method).then(res => {
          if (res.success) {
            this.$message.success('操作成功！')
            this.close(true)
            if (this.isAdding) {
              this.$emit('added', {
                desformCode: params.desformCode,
                addedAutoOpenDesign: this.addedAutoOpenDesign
              })
            }
          } else {
            this.$error({ title: '保存失败', content: res.message })
          }
        }).finally(() => {
          this.hideLoading()
        })
      },

      /** 请求查询模板 */
      requestTemplet() {
        this.loading = true

        Promise.all([
          getAction(this.url.cgform.headList, { pageNo: 1, pageSize: 9999 }),
          getAction(this.url.templet, { returnJson: true })
        ]).then((results) => {
          let [cgforms, templets] = results

          if (cgforms.success) {
            let cgformOptions = []
            let allTables = {}
            cgforms.result.records.forEach(item => {
              allTables[item.tableName] = item

              let { tableType, copyType } = item
              // 不显示附表
              if (tableType.toString() === '3') {
                return
              }
              // 不显示视图
              if (copyType.toString() === '1') {
                return
              }
              cgformOptions.push({ label: item['tableTxt'] + `（${item['tableName']}）`, value: item['tableName'] })
            })

            cgformOptions.unshift({ label: '请选择表单', value: this.noUseTemplet })
            this.cgformOptions = cgformOptions
            this.allTables = allTables
          } else {
            this.$notification['warning']({ message: '模板查询失败', description: templets.message })
          }

          if (templets.success) {
            templets.result.unshift({ label: '请选择模板', value: this.noUseTemplet, templetJson: null })
            this.templetOptions = templets.result
          } else {
            this.$notification['warning']({ message: '模板查询失败', description: templets.message })
          }
        }).finally(() => {
          this.loading = false
        })

        // getAction(this.url.templet, {
        //   returnJson: true
        // }).then(res => {
        //
        // }).finally(() => {
        //   this.loading = false
        // })
      },

      filterCgformOption(input, option) {
        return option.componentOptions.children[0].text.indexOf(input) >= 0
      },

      // desformCode 失去焦点事件
      handleDesformCodeBlur(event) {
        const { target: { value: desformCode } } = event
        if (typeof desformCode === 'string' && /[A-Z]/.test(desformCode)) {
          this.$message.warn('不支持大写字母')
          this.form.setFieldsValue({ desformCode: desformCode.toLowerCase() })
        }
      }

    }
  }
</script>

<style scoped></style>
