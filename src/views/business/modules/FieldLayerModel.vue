<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :maskClosable="false"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭">
    <a-spin :spinning="confirmLoading">
      <j-editable-table
        ref="editableTable"
        :loading="confirmLoading"
        :dragSort="true"
        dragSortKey="sort"
        :columns="columns"
        :dataSource="dataSource"
        :rowNumber="true"/>
    </a-spin>
  </a-modal>
</template>

<script>
import { FormTypes } from '@/utils/JEditableTableUtil'
import { getFieldList,submitField } from '@/api/business'

export default {
  name: 'FieldLayerModel',
  data() {
    return {
      title: '操作',
      visible: false,
      model: {},
      confirmLoading: false,
      dataSource: [],
      columns: [
        {
          title: '字段名称', // 只读
          key: 'name',
          width: '200px',
          type: FormTypes.input,
          props: { 'disabled': true }
        }, {
          title: '字段备注',
          key: 'caption',
          width: '300px',
          type: FormTypes.input,
          props: { 'disabled': true }
        }, {
          title: '是否显示',
          key: 'status',
          width: '100px',
          type: FormTypes.checkbox,
          customValue: ['1', '0'],
          defaultChecked: false
        }, {
          title: '排序',
          key: 'sort',
          isOrder: true, //  是否是排序字段，如果是排序字段，那么新增的默认值永远是最大值+1
          type: FormTypes.hidden,
          defaultValue: 0
        }
      ]
    }
  },
  computed: {},
  created() {

  },
  methods: {
    init(record) {
      var params = {
        layerId: record.id,
      }
      getFieldList(params).then((res) => {
        if (res.success) {
          // console.log(res.data)
          this.dataSource = res.data
          this.confirmLoading = false
        }
      })
    },
    edit(record) {
      this.confirmLoading = true
      this.model = Object.assign({}, record)
      this.visible = true
      this.init(record)
    },
    handleOk() {
      const that = this
      this.$refs.editableTable.getValues((error, values) => {
        // console.log('values:', values)
        that.confirmLoading = true

        submitField(values).then((res) => {
          if(res.success){
            that.$message.success(res.msg)
            that.$emit('ok')
          } else {
            that.$message.warning(res.msg)
          }
        }).finally(() => {
          that.confirmLoading = false
          that.close()
        })
      }, false)
    },
    handleCancel() {
      this.close()
    },
    close() {
      this.$emit('close')
      this.visible = false
    },
  }
}
</script>