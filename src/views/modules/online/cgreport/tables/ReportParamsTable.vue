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

  // 报表参数
  export default {
    name: 'ReportParamsTable',
    props: {
      loading: Boolean,
      dataSource: Array
    },
    data() {
      return {
        columns: [
          {
            width: '23%',
            title: '参数',
            key: 'paramName',
            type: JVXETypes.input,
            defaultValue: '',
            placeholder: '请输入${title}',
            validateRules: [{ required: true, message: '${title}不能为空' }]
          },
          {
            width: '23%',
            title: '参数文本',
            key: 'paramTxt',
            type: JVXETypes.input,
            defaultValue: '',
            placeholder: '请输入${title}',
            validateRules: [{ required: true, message: '${title}不能为空' }]
          },
          {
            width: '23%',
            title: '默认值',
            key: 'paramValue',
            type: JVXETypes.input,
            defaultValue: '',
            placeholder: '请输入${title}'
          }
        ]
      }
    }
  }
</script>

<style scoped>

</style>
