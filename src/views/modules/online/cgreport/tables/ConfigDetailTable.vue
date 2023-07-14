<template>
  <j-vxe-table
    ref="table"
    toolbar
    row-number
    row-selection
    drag-sort
    drag-sort-key="orderNum"
    :keep-source="false"
    height="auto"
    :max-height="492"
    :loading="loading"
    :columns="columns"
    :dataSource="dataSource"
  />
</template>

<script>
  import { JVXETypes } from '@comp/jeecg/JVxeTable/jvxeTypes'

  // Online报表，配置明细
  export default {
    name: 'ConfigDetailTable',
    props: {
      loading: Boolean,
      dataSource: Array
    },
    data() {
      return {
        columns: [
          {
            title: '字段名',
            width: '150px',
            key: 'fieldName',
            type: JVXETypes.input,
            defaultValue: '',
            placeholder: '请输入${title}',
            validateRules: [{ required: true, message: '${title}不能为空' }]
          },
          {
            title: '字段文本',
            width: '200px',
            key: 'fieldTxt',
            type: JVXETypes.input,
            placeholder: '请输入${title}',
            defaultValue: '',
            validateRules: [{ required: true, message: '${title}不能为空' }]
          },
          {
            title: '类型',
            width: '150px',
            key: 'fieldType',
            type: JVXETypes.select,
            options: [ // 下拉选项
              { title: '数值类型', value: 'Integer' },
              { title: '字符类型', value: 'String' },
              { title: '日期类型', value: 'Date' },
              { title: '时间类型', value: 'Datetime' },
              { title: '长整型', value: 'Long' }
            ],
            defaultValue: 'String',
            placeholder: '请选择${title}',
            validateRules: [{ required: true, message: '${title}不能为空' }]
          },
          {
            title: '是否显示',
            width: '100px',
            key: 'isShow',
            type: JVXETypes.checkbox,
            customValue: [1, 0], // true ,false
            defaultChecked: true
          },
          {
            title: '字段href',
            minWidth: '200px',
            key: 'fieldHref',
            type: JVXETypes.input,
            defaultValue: '',
            placeholder: '请输入${title}'
          },
          {
            title: '查询模式',
            width: '150px',
            key: 'searchMode',
            type: JVXETypes.select,
            options: [
              { title: '单条件查询', value: 'single' },
              { title: '范围查询', value: 'group' }
            ],
            defaultValue: '',
            placeholder: '请选择${title}'
          },
          {
            title: '取值表达式',
            width: '160px',
            key: 'replaceVal',
            type: JVXETypes.input,
            defaultValue: '',
            placeholder: '请输入${title}'
          },
          {
            title: '字典code',
            width: '200px',
            key: 'dictCode',
            type: JVXETypes.input,
            defaultValue: '',
            placeholder: '请输入${title}'
          },
          {
            title: '分组标题',
            width: '200px',
            key: 'groupTitle',
            type: JVXETypes.input,
            defaultValue: '',
            placeholder: '请输入${title}'
          },
          {
            title: '是否查询',
            width: '100px',
            key: 'isSearch',
            type: JVXETypes.checkbox,
            customValue: ['1', '0'],
            defaultChecked: false
          },
          {
            title: '合计',
            width: '100px',
            key: 'isTotal',
            type: JVXETypes.checkbox,
            customValue: ['1', '0'],
            defaultChecked: false
          }
        ]
      }
    }
  }
</script>

<style scoped>

</style>
