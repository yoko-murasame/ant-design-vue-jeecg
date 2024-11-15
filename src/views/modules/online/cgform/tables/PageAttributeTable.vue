<template>

  <j-editable-table
    ref="editableTable"
    :loading="loading"
    :columns="columns"
    :dataSource="dataSource"
    :rowNumber="true"
    :maxHeight="-1"
    :disabledRows="{ dbFieldName:'id'}">
    <template v-slot:fieldExtendJson="props">
      <!--<a-button @click="onCLick(props)">test</a-button>-->
      <a-tooltip>
        <template v-slot:title>
          <div>
            <div><a href="https://www.kancloud.cn/zhangdaiscott/jeecg-boot/2044137" target="_blank">扩展参数配置</a></div>
            <div>1. 限制文件上传数量(默认online表单): {"uploadnum":1}</div>
            <div>2. <strong>限制大文本在列表页面的展示长度(online列表): {"showLength":20}</strong></div>
            <div>3. 设置popup是否支持多选(默认online表单): {"popupMulti":false}</div>
            <div>4. 设置部门组件 存储字段和展示字段(默认online表单): {"store": "orgCode"} 存储字段变更为部门编码</div>
            <div>5. 设置用户组件 存储字段和展示字段(默认online表单): {"store":"id", "text":"username"} 存储字段变更为用户ID,展示字段变更为用户账号</div>
            <div>6. 设置部门/用户组件 是否多选(默认online表单): {"multiSelect":false}</div>
            <div>7. <strong>设置 查询排序规则(online列表): {"orderRule": "asc"} 正序asc、倒序desc</strong></div>
            <div>8. 设置 校验提示的文本信息(默认online表单): {"validateError": "这是自定义的提示信息"} 正序asc、倒序desc</div>
          </div>
        </template>
        <a-input v-bind="props.buildProps()" :value="props.value" @input="e => onSetValue(props.rowId, {'fieldExtendJson': e.target.value})"></a-input>
      </a-tooltip>
    </template>
  </j-editable-table>

</template>

<script>

import { FormTypes } from '@/utils/JEditableTableUtil'
import { syncAllTable } from '../util/TableUtils'

const commonPageOptions = [
    { title: '文本框', value: 'text' },
    { title: '密码', value: 'password' },
    { title: '下拉框', value: 'list' },
    { title: '单选框', value: 'radio' },
    { title: '多选框', value: 'checkbox' },
    { title: '开关', value: 'switch' },
    { title: '日期(yyyy-MM-dd)', value: 'date' },
    { title: '日期（yyyy-MM-dd HH:mm:ss）', value: 'datetime' },
    { title: '时间（HH:mm:ss）', value: 'time' },
    { title: '文件', value: 'file' },
    { title: '图片', value: 'image' },
    { title: '多行文本', value: 'textarea' },
    { title: '下拉多选框', value: 'list_multi' },
    { title: '下拉搜索框', value: 'sel_search' },
    { title: 'Popup弹框', value: 'popup' },
    { title: '分类字典树', value: 'cat_tree' },
    { title: '部门选择', value: 'sel_depart' },
    { title: '用户选择', value: 'sel_user' },
    { title: '富文本', value: 'umeditor' },
    { title: 'MarkDown', value: 'markdown' },
    { title: '省市区组件', value: 'pca' },
    { title: '联动组件', value: 'link_down' },
    { title: '自定义树控件', value: 'sel_tree' }

  ];
  const subTablePageOptions = [
    { title: '文本框', value: 'text' },
    { title: '单选框', value: 'radio' },
    { title: '开关', value: 'switch' },
    { title: '日期(yyyy-MM-dd)', value: 'date' },
    { title: '日期（yyyy-MM-dd HH:mm:ss）', value: 'datetime' },
    { title: '文件', value: 'file' },
    { title: '图片', value: 'image' },
    { title: '下拉框', value: 'list' },
    { title: '下拉多选框', value: 'list_multi' },
    { title: '下拉搜索框', value: 'sel_search' },
    { title: 'popup弹出框', value: 'popup' },
    { title: '部门选择', value: 'sel_depart' },
    { title: '用户选择', value: 'sel_user' }
  ];

  export default {
    name: 'PageAttributeTable',
    components: {
    },
    inject: ['getAllTable'],
    data() {
      return {
        loading: false,
        dataSource: [],
        columns: [
          {
            title: '字段名称', // 只读
            key: 'dbFieldName',
            // width: '9%',
            width: '100px',
            type: FormTypes.input,
            defaultValue: '',
            placeholder: '',
            props: { 'disabled': true },
            tooltip: '字段名称(数据库字段名)'
          },
          {
            title: '字段备注', // 只读
            key: 'dbFieldTxt',
            // width: '9%',
            width: '100px',
            type: FormTypes.input,
            defaultValue: '',
            placeholder: '',
            props: { 'disabled': true },
            tooltip: '字段备注(数据库字段备注)'
          },
          {
            title: '表单显示',
            key: 'isShowForm',
            // width: '3%',
            width: '40px',
            type: FormTypes.checkbox,
            customValue: ['1', '0'],
            defaultChecked: true,
            tooltip: '是否表单显示(如果字段配置为否，则新增、编辑时将忽略该字段)'
          },
          {
            title: '列表显示', // 多选框、默认true
            key: 'isShowList',
            // width: '3%',
            width: '40px',
            type: FormTypes.checkbox,
            customValue: ['1', '0'],
            defaultChecked: true,
            tooltip: '是否列表显示(如果字段配置为否，则列表页面、Excel导出时将忽略该字段)'
          },
          {
            title: '是否排序',
            key: 'sortFlag',
            width: '40px',
            type: FormTypes.checkbox,
            customValue: ['1', '0'],
            defaultChecked: false,
            tooltip: '是否排序(多个字段将按照顺序从上到下依次排序，可在“扩展参数”中{"orderRule": "asc|desc"}指定顺序)'
          },
          {
            title: '是否只读',
            key: 'isReadOnly',
            // width: '3%',
            width: '40px',
            type: FormTypes.checkbox,
            customValue: ['1', '0'],
            defaultChecked: false,
            tooltip: '是否只读(仅在默认的online表单中生效，KForm设计器表单无效)'
          },
          {
            title: '控件类型',
            key: 'fieldShowType',
            // width: '16%',
            width: '170px',
            type: FormTypes.select,
            options: commonPageOptions,
            defaultValue: 'text',
            placeholder: '请选择${title}',
            validateRules: [
              { required: true, message: '请选择${title}' },
              {
                handler: (type, value, row, column, callback, target) => {
                  if (type !== 'blur') {
                    this.getAllTable().then(tables => {
                      let [table1] = tables
                      // 获取到 table1（数据库属性） 中的数据
                      let dbType = table1.$refs.editableTable.getValuesSync({
                        validate: false,
                        rowIds: [row.id]
                      }).values[0].dbType
                      // 当控件类型类型为时间时，数据库类型必须是String类型
                      if (value === 'time' && dbType !== 'string') {
                        callback(false, '当控件类型类型为时间时,数据库属性里的字段类型必须是String！')
                      }
                      // 当控件类型类型为日期时，数据库类型必须是Date类型
                      else if ((value === 'date' || value === 'datetime') && (dbType !== 'Date' && dbType !== 'Datetime')) {
                        callback(false, '当控件类型类型为日期时，数据库属性里的字段类型必须是Date！')
                      } else {
                        callback(true)
                      }
                    }).catch(error => {
                      console.error(error)
                      callback(false, '校验出错')
                    })
                  } else {
                    callback()
                  }
                },
                message: '${title}校验失败'
              }
            ],
            tooltip: '控件类型'
          },
          {
            title: '控件长度', // 数值
            key: 'fieldLength',
            // width: '9%',
            width: '100px',
            type: FormTypes.inputNumber,
            defaultValue: '120',
            placeholder: '请输入${title}',
            validateRules: [{ required: true, message: '${title}不能为空' }],
            tooltip: '控件长度(默认的online表单中针对一对多子表作用较大，可自定义设置长度，适应行编辑页面效果；KForm设计器表单无效)'
          },
          {
            title: '是否查询',
            key: 'isQuery',
            // width: '5%',
            width: '60px',
            type: FormTypes.checkbox,
            customValue: ['1', '0'],
            defaultChecked: false,
            tooltip: '是否查询(控制列表页的查询项)'
          },
          {
            title: '查询类型',
            key: 'queryMode',
            // width: '10%',
            width: '110px',
            type: FormTypes.select,
            options: [
              { title: '普通查询', value: 'single' },
              { title: '范围查询', value: 'group' }

            ],
            defaultValue: 'single',
            placeholder: '请选择${title}',
            validateRules: [{ required: true, message: '请选择${title}' }],
            tooltip: '查询类型(数值、日期类型时生效)'
          },
          {
            title: '控件默认值',
            key: 'fieldDefaultValue',
            // width: '15%',
            width: '180px',
            type: FormTypes.input,
            defaultValue: '',
            tooltip: '控件默认值'
          },
          {
            title: '扩展参数',
            key: 'fieldExtendJson',
            // width: '15%',
            width: '160px',
            type: FormTypes.slot,
            slotName: 'fieldExtendJson',
            placeholder: `{"orderRule": "asc|desc", "showLength": "10"}\n详见:https://www.kancloud.cn/zhangdaiscott/jeecg-boot/2044137`,
            defaultValue: ''
          },
          {
            title: '自定义转换器',
            key: 'converter',
            // width: '15%',
            width: '160px',
            type: FormTypes.input,
            defaultValue: '',
            tooltip: '自定义转换器'
          },
          {
            title: '自定义scopedSlots',
            key: 'scopedSlots',
            // width: '15%',
            width: '160px',
            type: FormTypes.input,
            defaultValue: '',
            tooltip: '自定义scopedSlots(online列表组件处于卡片模式时，将添加该自定义名插槽)'
          },
          {
            title: 'slot渲染Vue代码',
            key: 'scopedSlotsRenderCode',
            // width: '15%',
            width: '160px',
            type: FormTypes.input_pop,
            defaultValue: '',
            tooltip: 'slot渲染Vue代码(需在“自定义scopedSlots”中先定义任意插槽名称，然后在此输入Vue代码)'
          }
        ]
      }
    },
    methods: {

      onSetValue(rowKey, values) {
        console.log(rowKey, values)
        this.$refs.editableTable.setValues([{
          rowKey: rowKey,
          values: values
        }])
      },

      onCLick(props, record) {
        console.log(props, record)
      },

      /** 同步列表 */
      async syncTable(table1) {
        await syncAllTable(this, table1)
      },

      /** 同步控件类型 */
      syncFieldShowType(row) {
        let table = this.$refs.editableTable
        table.setValues([{
          rowKey: row.id,
          values: { 'fieldShowType': 'date' }
        }])
      },
      changePageType(flag) {
        for (let col of this.columns) {
          if (col.key == 'fieldShowType') {
            col.options = !flag ? commonPageOptions : subTablePageOptions
            break;
          }
        }
       // !flag//正常
      },
      enableQuery(id) {
        this.$refs.editableTable.setValues([{
          rowKey: id,
          values: { 'isQuery': '1' }
        }]);
      }

    }
  }
</script>

<style scoped>

</style>
