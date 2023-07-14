<template>
  <j-modal
    :title="title"
    width="1200px"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :destroyOnClose="true"
    :maskClosable="false"
    cancelText="关闭"
    style="top: 40px;"
    fullscreen
    switchFullscreen
    @ok="handleOk"
    @cancel="handleCancel">

    <a-spin :spinning="confirmLoading">
      <a-form :form="form" layout="inline">
        <a-list>
          <!-- 编码、名称、数据源 -->
          <a-list-item>
            <a-row :gutter="gutter" style="width: 100%;">
              <a-col :span="7">
                <a-form-item
                  style="width: 100%"
                  :labelCol="threeCol.label"
                  :wrapperCol="threeCol.wrapper"
                  label="编码"
                >
                  <a-input placeholder="请输入编码" v-decorator="['code', validatorRules.code ]"/>
                </a-form-item>
              </a-col>

              <a-col :span="8">
                <a-form-item
                  style="width: 100%"
                  :labelCol="threeCol.label"
                  :wrapperCol="threeCol.wrapper"
                  label="名称"
                >
                  <a-input placeholder="请输入名称" v-decorator="['name', validatorRules.name ]"/>
                </a-form-item>

              </a-col>
              <a-col :span="8">
                <a-form-item
                  style="width: 100%"
                  :labelCol="threeCol.label"
                  :wrapperCol="threeCol.wrapper"
                  label="数据源"
                >
                  <a-select
                    style="width: 100%;"
                    placeholder="请选择数据源"
                    :options="dbSourceOptions"
                    :getPopupContainer="node => node.parentNode"
                    v-decorator="['dbSource', validatorRules.dbSource]"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-list-item>
          <!-- 查询SQL -->
          <a-list-item>
            <a-row :gutter="gutter" style="width: 100%;">
              <a-col :span="21">
                <a-form-item
                  style="width: 100%"
                  :labelCol="oneCol.label"
                  :wrapperCol="oneCol.wrapper"
                  label="报表SQL">

                  <!-- 代码编辑器 -->
                  <j-code-editor
                    ref="cgrSql"
                    language="sql"
                    :fullScreen="true"
                    :lineNumbers="false"
                    placeholder="请输入查询SQL"
                    style="min-height: 120px;"
                    @input="handleInputCgrSql"/>

                  <a-textarea :hidden="true" v-decorator="['cgrSql', validatorRules.cgrSql ]"/>
                </a-form-item>
              </a-col>
              <a-col :span="3">
                <a-popover title="使用指南" trigger="hover" style="margin: 0 10px 0 6px;">
                  <template slot="content">
                    您可以键入“”作为一个参数，这里abc是参数的名称。例如：<br>
                    select * from table where id = ${abc}。<br>
                    select * from table where id like concat('%',${abc},'%')。(mysql模糊查询)<br>
                    select * from table where id like '%'||${abc}||'%'。(oracle模糊查询)<br>
                    select * from table where id like '%'+${abc}+'%'。(sqlserver模糊查询)<br>
                    <span style="color: red;">注：参数只支持动态报表，popup暂不支持</span>
                  </template>
                  <a-icon type="question-circle"/>
                </a-popover>
                <a-button type="primary" @click="handleSQLAnalyze">SQL解析</a-button>
              </a-col>
            </a-row>
          </a-list-item>
          <!-- 描述 -->
          <a-list-item style="display: none">
            <a-row :gutter="gutter" style="width: 100%;;">
              <a-col :span="24">
                <a-form-item
                  style="width: 100%"
                  :labelCol="oneCol.label"
                  :wrapperCol="oneCol.wrapper"
                  label="描述">
                  <a-textarea placeholder="请输入描述" v-decorator="['content']"/>
                </a-form-item>
              </a-col>
            </a-row>
          </a-list-item>
          <!-- 返回值字段、返回文本字段、返回类型 -->
          <!-- 展示不展示以下内容 -->
          <a-list-item v-if="false">
            <a-row :gutter="gutter" style="width: 100%;">
              <a-col :span="24/3">
                <a-form-item
                  style="width: 100%"
                  :labelCol="threeCol.label"
                  :wrapperCol="threeCol.wrapper"
                  label="返回值字段"
                >
                  <a-input placeholder="请输入返回值字段" v-decorator="['returnValField', {}]"/>
                </a-form-item>
              </a-col>
              <a-col :span="24/3">
                <a-form-item
                  style="width: 100%"
                  :labelCol="threeCol.label"
                  :wrapperCol="threeCol.wrapper"
                  label="返回文本字段"
                >
                  <a-input placeholder="请输入返回文本字段" v-decorator="['returnTxtField', {}]"/>
                </a-form-item>
              </a-col>
              <a-col :span="24/3">
                <a-form-item
                  style="width: 100%"
                  :labelCol="threeCol.label"
                  :wrapperCol="threeCol.wrapper"
                  label="返回类型"
                >
                  <a-select
                    v-decorator="[ 'returnType', {}]"
                    width="100%"
                    style="width:100%"
                    placeholder="请选择返回类型"
                  >
                    <a-select-option value="1">单选</a-select-option>
                    <a-select-option value="2">多选</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-list-item>
        </a-list>
      </a-form>

      <a-tabs v-model="activeKey" @change="handleChangeTab">
        <!-- 动态报表配置明细 -->
        <a-tab-pane tab="动态报表配置明细" :forceRender="true" key="1">
          <config-detail-table ref="table1" :loading="confirmLoading" :dataSource="tab1.dataSource"/>
        </a-tab-pane>
        <!-- 报表参数 -->
        <a-tab-pane tab="报表参数" :forceRender="true" key="2">
          <report-params-table ref="table2" :loading="confirmLoading" :dataSource="tab2.dataSource"/>
        </a-tab-pane>

      </a-tabs>

    </a-spin>
  </j-modal>
</template>

<script>
  import { validateTables, VALIDATE_FAILED } from '@/components/jeecg/JVxeTable/utils/vxeUtils'

  import { duplicateCheck } from '@/api/api'
  import { getAction, httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import ConfigDetailTable from '@views/modules/online/cgreport/tables/ConfigDetailTable'
  import ReportParamsTable from '@views/modules/online/cgreport/tables/ReportParamsTable'

  export default {
    name: 'OnlCgreportHeadModal',
    components: {
      ReportParamsTable,
      ConfigDetailTable
    },
    data() {
      return {
        title: '操作',
        visible: false,
        model: {},
        reportSql: '',
        gutter: 0,
        oneCol: {
          label: { span: 3 },
          wrapper: { span: 24 - 3 }
        },
        threeCol: {
          label: { span: 6 },
          wrapper: { span: 24 - 6 }
        },
        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules: {
          code: {
            rules: [
              { required: true, message: '请输入编码!' },
              { validator: this.validateCode }
            ]
          },
          name: { rules: [{ required: true, message: '请输入报表名称!' }] },
          cgrSql: { rules: [{ required: true, message: '请输入查询SQL!' }] },
          dbSource: {}
        },
        url: {
          add: '/online/cgreport/head/add',
          edit: '/online/cgreport/head/editAll',
          sql: '/online/cgreport/head/parseSql',
          param: {
            listByHeadId: '/online/cgreport/param/listByHeadId'
          },
          item: {
            listByHeadId: '/online/cgreport/item/listByHeadId'
          }
        },
        activeKey: '1',
        tab1: {
          dataSource: []
        },
        tab2: {
          dataSource: []
        },
        dbSourceOptions: []
      }
    },
    created() {
      this.queryDataSourceOptions()
    },
    methods: {
      add() {
        this.edit({})
      },
      edit(record) {
        this.form.resetFields()
        this.model = Object.assign({}, record)
        this.visible = true
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,
            'code',
            'name',
            'cgrSql',
            'returnValField',
            'returnTxtField',
            'returnType',
            'dbSource',
            'content'
          ))
        })
        this.reportSql = this.model.cgrSql
        this.$nextTick(() => {
          this.$refs.cgrSql.setCodeContent(this.model.cgrSql || '')
        })

        // 查询出param
        if (record.id) {
          this.requestData(record.id)
        }
      },
      /** 关闭窗口，并初始化所有的表 */
      close() {
        this.visible = false
        // 初始化
        if (this.$refs.table1) {
          this.tab1.dataSource = []
          this.tab2.dataSource = []
        }
        this.activeKey = '1'
        this.$emit('close')
      },

      /** 点击确定按钮，提交数据 */
      handleOk() {
        this.validateFields()
      },
      /** 点击关闭按钮 */
      handleCancel() {
        this.close()
      },

      /** 根据headId查询item和param */
      requestData(headId) {
        this.requestTabData(this.url.item.listByHeadId, headId, this.tab1)
        this.requestTabData(this.url.param.listByHeadId, headId, this.tab2)
      },
      /** 查询某个tab的数据 */
      requestTabData(url, headId, tab) {
        this.confirmLoading = true
        getAction(url, { headId }).then(res => {
          tab.dataSource = res.result || []
        }).finally(() => {
          this.confirmLoading = false
        })
      },

      /** SQL解析 */
      handleSQLAnalyze() {
        this.confirmLoading = true

        // --- [ fix warning；by:sunjianlei；date:2019-03-24；for: Warning: `getFieldDecorator` will override `value`, so please don't set `value and v-model` directly and use `setFieldsValue` to set it. ]
        // var param = { 'sql': this.reportSql }
        // let param = { 'sql': reportSql }
        // --- [ fix warning；by:sunjianlei；date:2019-03-24；for: Warning: `getFieldDecorator` will override `value`, so please don't set `value and v-model` directly and use `setFieldsValue` to set it. ]

        this.form.validateFields(['cgrSql', 'dbSource'], (errors, values) => {
          if (!errors) {
            let params = { sql: values['cgrSql'], dbKey: values['dbSource'] }
            getAction(this.url.sql, params).then(res => {
              if (res.success) {
                this.$message.success('解析成功')
                // update-begin-author:lvdandan date:20201203 for: JT-75 在线开发-》online报表配置
                // 过滤sqlServer __row_number__ 字段
                let newFields = res.result.fields.filter(item => item.fieldName != '__row_number__')
                // update-end-author:lvdandan date:20201203 for: JT-75 在线开发-》online报表配置
// update-begin-author:taoyan date:20190514 for:报表编辑页面 点击解析 保存 再编辑，字段莫名重了，改后台也行,这里就在前端处理了
                this.tab1.dataSource = getTabData(this.tab1.dataSource, newFields || [], 'fieldName')
                this.tab2.dataSource = getTabData(this.tab2.dataSource, res.result.params || [], 'paramName')
// update-end-author:taoyan date:20190514 for:报表编辑页面 点击解析 保存 再编辑，字段莫名重了，改后台也行,这里就在前端处理了
                this.$refs.table1.$refs.table.scrollTo(null, 0)
                this.$refs.table2.$refs.table.scrollTo(null, 0)
              } else {
                this.$message.error(res.message)
              }
            }).finally(() => {
              this.confirmLoading = false
            })
          }
        })
      },

      /** 切换tab选项卡的时候重置table的滚动条状态 */
      handleChangeTab(key) {
        this.$refs[`table${key}`].$refs.table.scrollTo(null, 0)
      },

      /** 触发表单验证 */
      validateFields() {
        let dataMap = {}
        new Promise((resolve, reject) => {
          // 触发表单验证
          this.form.validateFields((err, values) => {
            err ? reject(VALIDATE_FAILED) : resolve(values)
          })
        }).then(values => {
          dataMap.head = Object.assign(this.model, values)
          return this.validateTableFields()
        }).then(tableDataMap => {
          Object.assign(dataMap, tableDataMap)
          let formData = this.classifyIntoFormData(dataMap)
          return this.requestAddOrEdit(formData)
        })
      },

      /** 发起请求新增或修改的请求 */
      requestAddOrEdit(formData) {
        // 判断是add还是edit
        let method = 'post'; let url = this.url.add
        if (this.model.id) {
          method = 'put'
          url = this.url.edit
        }
        // 发起请求
        this.confirmLoading = true
        httpAction(url, formData, method).then((res) => {
          if (res.success) {
            this.$message.success(res.message)
            this.$emit('ok')
            this.close()
          } else {
            this.$message.warning(res.message)
          }
        }).finally(() => {
          this.confirmLoading = false
        })
      },

      /** 将数据整理成后台能识别的formData */
      classifyIntoFormData(dataMap) {
        let formData = pick(dataMap, 'head')

        formData.items = dataMap.table1.tableData
        formData.deleteItemIds = dataMap.table1.deleteData.map(i => i.id).join(',')

        formData.params = dataMap.table2.tableData
        formData.deleteParamIds = dataMap.table2.deleteData.map(i => i.id).join(',')

        return formData
      },

      validateCode(rule, value, callback) {
        let pattern = /^[a-z|A-Z][a-z|A-Z|\d|_|-]{0,}$/
        if (!pattern.test(value)) {
          callback('编码必须以字母开头，可包含数字、下划线、横杠')
        } else {
          var params = {
            tableName: 'onl_cgreport_head',
            fieldName: 'code',
            fieldVal: value,
            dataId: this.model.id
          }
          duplicateCheck(params).then((res) => {
            if (res.success) {
              callback()
            } else {
              callback(res.message)
            }
          })
        }
      },

      /** 验证并获取所有表的数据 */
      validateTableFields() {
        return new Promise((resolve, reject) => {
          let cases = []
          cases.push(this.$refs.table1.$refs.table)
          cases.push(this.$refs.table2.$refs.table)
          validateTables(cases).then((tablesData) => {
            let dataMap = {}
            tablesData.forEach((item, index) => dataMap[`table${index + 1}`] = item)
            resolve(dataMap)
          }).catch((e = {}) => {
            reject(e)
          })
        })
      },
      handleInputCgrSql(value) {
        this.form.setFieldsValue({ cgrSql: value })
      },

      /** 字段名转换大小写 */
      fieldNameConvertCase(convertCase, name, props) {
        let { target } = props
        let fn = `to${convertCase}Case`

        this.$confirm({
          title: '转换字段名',
          content: `确定要将所有的字段名都转换为${name}吗？`,
          onOk() {
            // console.log('fieldNameConvertCase: ', 'aBcD'[fn]())
            let { values } = target.getValuesSync({ validate: false })
            let newValues = values.map(item => {
              return {
                rowKey: item.id,
                values: {
                  'fieldName': item['fieldName'][fn]()
                }
              }
            })
            target.setValues(newValues)
          }
        })
      },
      queryDataSourceOptions() {
        getAction('/sys/dataSource/options').then(res => {
          if (res.success) {
            this.dbSourceOptions = res.result || []
            this.dbSourceOptions.unshift({ label: '请选择', value: '' })
          } else {
            this.dbSourceOptions = [{ label: '加载失败', value: undefined }]
          }
        })
      }

    }
  }

  /**
   * 获取tab的table的datasource
   * @param old_arr 原datasource
   * @param new_arr 从数据库查询出来的datasource
   * @param columnName 字段列
   */
  function getTabData(old_arr, new_arr, columnName) {
    if (old_arr.length > 0) {
      let need = []; let field_arr = []; let max_order = 1
      for (let t of new_arr) {
        for (let o of old_arr) {
          if (o[columnName] == t[columnName]) {
            need.push(o)
            field_arr.push(t[columnName])
            if (o.orderNum > max_order) {
              max_order = o.orderNum
            }
            break
          }
        }
      }
      for (let t of new_arr) {
        if (field_arr.indexOf(t[columnName]) < 0) {
          t.orderNum = ++max_order
          need.push(t)
        }
      }
      return need
    } else {
      let max_order = 0
      for (let t of new_arr) {
        if (!t.orderNum) {
          t.orderNum = ++max_order
        }
      }
      return new_arr
    }
  }
</script>

<style scoped>

</style>
