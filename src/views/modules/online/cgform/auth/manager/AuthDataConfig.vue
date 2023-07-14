/* eslint-disable */
<template>
  <div>
    <div class="table-operator">
      <a-button type="primary" icon="plus" ghost @click="handleAdd">新增</a-button>
    </div>

    <a-table
      bordered
      rowKey="id"
      :loading="loading"
      :columns="columns"
      :dataSource="dataSource">

      <template slot="ellipsis" slot-scope="text">
        <ellipsis :length="13">{{ text }}</ellipsis>
      </template>

      <template slot="description" slot-scope="text,record">
        {{ getDescription(record) }}
      </template>

      <template slot="switch" slot-scope="text,record">
        <a-switch size="small" :checked="record.status === 1" @click="(e)=>handleUpdateStatus(e, record.id)"/>
      </template>

      <template v-slot:action="text,record">
        <a @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical"/>
        <a-popconfirm title="确定删除吗？" placement="left" @confirm="handleDelete(record.id)">
          <a>删除</a>
        </a-popconfirm>
      </template>
    </a-table>

    <j-modal
      :title="title"
      :visible.sync="visible"
      :width="800"
      :okClose="false"
      :maskClosable="false"
      :confirmLoading="confirmLoading"
      @ok="handleModalOk">
      <a-form :form="form">
        <a-form-item label="规则名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="请输入规则名称" v-decorator="['ruleName', validatorRules.ruleName]"/>
        </a-form-item>

        <a-form-item v-show="showRuleColumn" label="规则字段" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-search-select-tag placeholder="请选择规则字段" v-decorator="['ruleColumn']" :dictOptions="fieldOptions"></j-search-select-tag>
        </a-form-item>

        <a-form-item label="条件规则" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-dict-select-tag
            @change="handleChangeRuleOperator"
            v-decorator="['ruleOperator', validatorRules.ruleOperator]"
            placeholder="请选择条件规则"
            dictCode="rule_conditions"
            triggerChange>
          </j-dict-select-tag>
        </a-form-item>

        <a-form-item label="规则值" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="请输入规则值" v-decorator="['ruleValue', validatorRules.ruleValue]"/>
        </a-form-item>

        <a-form-item label="状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group buttonStyle="solid" v-decorator="['status',{initialValue:1}]">
            <a-radio-button :value="1">有效</a-radio-button>
            <a-radio-button :value="0">无效</a-radio-button>
          </a-radio-group>
        </a-form-item>

      </a-form>
    </j-modal>
  </div>
</template>

<script>
  import Vue from 'vue'
  import { mapGetters } from 'vuex'
  import Ellipsis from '@/components/Ellipsis'
  import { getAction, postAction, putAction, deleteAction } from '@/api/manage'
  import pick from 'lodash.pick'
  const mockdata = [{
    ruleName: '名称等于admin',
    ruleColumn: 'name',
    ruleOperator: '=',
    ruleValue: 'admin',
    status: 1,
    id: '1'
  }, {
    ruleName: '年龄大于等于18',
    ruleColumn: 'age',
    ruleOperator: '>=',
    ruleValue: '18',
    status: 0,
    id: '2'
  }]
  const USE_SQL_RULES = 'USE_SQL_RULES'

  export default {
    name: 'AuthDataConfig',
    components: { Ellipsis },

    props: {
      cgformId: {
        type: String,
        default: '',
        required: true
      }
    },
    watch: {
      cgformId: {
        immediate: true,
        handler() {
          this.loadAuthData();
        }
      }
    },
    data() {
      return {
        loading: false,
        dataSource: mockdata,
        url: '/online/cgform/api/authData',
        columnList: [],
        columns: [
          { title: '启用', key: 'rowIndex', width: 80, align: 'center', scopedSlots: { customRender: 'switch' } },
          { title: '规则名称', dataIndex: 'ruleName', width: '130', align: 'center', scopedSlots: { customRender: 'ellipsis' } },
          /* { title: '规则字段',dataIndex: 'ruleColumn',width: '19%', align: 'center',scopedSlots: { customRender: 'ellipsis' }},
          { title: '规则条件',dataIndex: 'ruleOperator',width: '18%',align: 'center',scopedSlots: { customRender: 'ellipsis' }},
          { title: '规则值',dataIndex: 'ruleValue', width: '18%', align: 'center',scopedSlots: { customRender: 'ellipsis' }}, */
          { title: '规则描述', key: 'description', align: 'center', scopedSlots: { customRender: 'description' } },
          { title: '操作', key: 'action', width: 130, align: 'center', scopedSlots: { customRender: 'action' } }
        ],
        ruleOptions: [
          { value: 'gt', title: '大于' },
          { value: 'lt', title: '小于' },
          { value: 'eq', title: '等于' },
          { value: 'ne', title: '不等于' },
          { value: 'ge', title: '大于等于' },
          { value: 'le', title: '小于等于' },
          { value: 'left_like', title: '左模糊' },
          { value: 'right_like', title: '右模糊' },
          { value: 'like', title: '全模糊' },
          { value: 'like', title: '全模糊' }
        ],

        title: '',
        visible: false,
        confirmLoading: false,
        form: this.$form.createForm(this),
        labelCol: { sm: { span: 4 }, xs: { span: 24 } },
        wrapperCol: { sm: { span: 18 }, xs: { span: 24 } },
        validatorRules: {
          ruleName: { rules: [{ required: true, message: '请输入规则名称！' }] },
          ruleColumn: { rules: [{ required: true, message: '请选择规则字段！' }] },
          ruleOperator: { rules: [{ required: true, message: '请选择条件规则！' }] },
          ruleValue: { rules: [{ required: true, message: '请输入规则值！' }] }
        },
        model: {},
        showRuleColumn: true

      }
    },
    computed: {
      ...mapGetters({
        fieldOptions: 'onlAuthFields'
      })
    },
    methods: {
      getDescription(record) {
        if (record.ruleOperator == USE_SQL_RULES) {
          return '自定义SQL:' + record.ruleValue
        } else {
          return record.ruleColumn + '  ' + record.ruleOperator + '  ' + record.ruleValue
        }
      },
      loadAuthData() {
        getAction(`${this.url}/${this.cgformId}`).then(res => {
          console.log('loadAuthData', res)
          if (res.success) {
            this.dataSource = res.result
          } else {
            this.dataSource = []
            this.$message.warning(res.message)
          }
        })
      },
      handleUpdateStatus(e, id) {
        this.loading = true
        this.dataSource.map(item => {
          if (item.id == id) {
            item.status = Math.abs(item.status - 1)
            putAction(this.url, item).then(res => {
              console.log('saveAuthData', res)
              if (!res.success) {
                this.$message.warning(res.message)
              }
            }).finally(() => {
              this.loading = false
            })
          }
        })
      },
      handleEdit(record) {
        this.visible = true
        this.title = '编辑'
        this.model = Object.assign({}, record)
        this.form.resetFields()
        this.initRuleOperator()
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model, 'ruleName', 'ruleColumn', 'ruleOperator', 'ruleValue', 'status'))
        })
      },
      handleAdd() {
        this.visible = true
        this.title = '新增'
        this.model = {}
        this.form.resetFields()
      },
      handleModalOk() {
        // 触发表单验证
        const that = this;
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true;
            let formData = Object.assign(this.model, values)
            if (formData['ruleOperator'] == USE_SQL_RULES) {
              formData['ruleColumn'] = ''
            }
            formData['cgformId'] = this.cgformId
            console.log('请求参数', formData)
            if (this.title == '新增') {
              this.saveAuthData(formData)
            } else {
              this.editAuthData(formData)
            }
          }
        })
      },
      saveAuthData(formData) {
        postAction(this.url, formData).then(res => {
          console.log('saveAuthData', res)
          if (res.success) {
            this.visible = false
            this.loadAuthData()
            this.$message.success(res.message)
          } else {
            this.$message.warning(res.message)
          }
        }).finally(() => {
          this.confirmLoading = false
        })
      },
      editAuthData(formData) {
        putAction(this.url, formData).then(res => {
          console.log('saveAuthData', res)
          if (res.success) {
            this.visible = false
            this.loadAuthData()
            this.$message.success(res.message)
          } else {
            this.$message.warning(res.message)
          }
        }).finally(() => {
          this.confirmLoading = false
        })
      },
      handleDelete(id) {
        deleteAction(`${this.url}/${id}`).then(res => {
          if (res.success) {
            this.$message.success(res.message)
            this.loadAuthData()
          } else {
            this.$message.warning(res.message)
          }
        })
      },
      handleChangeRuleOperator(val) {
        if (val == USE_SQL_RULES) {
          this.form.setFieldsValue({
            ruleColumn: ''
          })
          this.showRuleColumn = false
        } else {
          this.showRuleColumn = true
        }
      },
      initRuleOperator() {
        if (this.model.ruleOperator && this.model.ruleOperator == USE_SQL_RULES) {
          this.showRuleColumn = false
        } else {
          this.showRuleColumn = true
        }
      }

    }
  }
</script>
