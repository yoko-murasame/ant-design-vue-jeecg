<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :maskClosable="false"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <a-spin :spinning="confirmLoading">
      <j-editable-table
        ref="editableTable"
        :loading="confirmLoading"
        :columns="columns"
        :dataSource="dataSource"
        :rowSelection="true"
        :actionButton="true"
        :rowNumber="true"
      />
    </a-spin>
  </a-modal>
</template>
<script>
import { FormTypes, validateTables } from '@/utils/JEditableTableUtil'
import { getFileList, submitFile, deleteFile } from '@/api/business'

export default {
  name: 'ResourceFileModel',
  data() {
    return {
      title: '操作',
      visible: false,
      model: {},
      confirmLoading: false,
      dataSource: [],
      record: '',
      // myOptions:[
      //   {"title":"菜单图标","value":"菜单图标"},
      //   {"title":"图例图标","value":"图例图标"},
      //   {"title":"点位图标","value":"点位图标"}
      // ],
      columns: [
        {
          title: '文件名',
          key: 'fileName',
          width: '200px',
          type: FormTypes.input
        },
        {
          title: '文件类型',
          key: 'fileType',
          width: '200px',
          type: FormTypes.select,
          options: [
            { title: '菜单图标', value: '菜单图标' },
            { title: '图例图标', value: '图例图标' },
            { title: '点位图标', value: '点位图标' },
            { title: '背景图片', value: '背景图片' },
            { title: '数据图片', value: '数据图片' }
          ]
        },
        {
          title: '文件',
          key: 'filePath',
          width: '300px',
          type: FormTypes.image,
          responseName: 'message',
          token: true
        }
      ]
    }
  },
  computed: {},
  created() {},
  methods: {
    init(record) {
      this.record = record
      var params = {
        tableId: record.id
      }
      getFileList(params).then(res => {
        if (res.success) {
          this.dataSource = res.data
          this.confirmLoading = false
        }
      })
    },
    edit(record) {
      this.confirmLoading = true
      // this.model = Object.assign({}, record)
      this.visible = true
      this.init(record)
    },
    handleOk() {
      const that = this
      this.$refs.editableTable.getValues((error, values) => {
        let deleteIds = this.$refs.editableTable.getDeleteIds()
        if (deleteIds.length > 0) {
          that.confirmLoading = true
          var params = {
            ids: deleteIds
          }
          deleteFile(params)
            .then(res => {
              if (res.success) {
                that.$message.success(res.msg)
                that.$emit('ok')
              } else {
                that.$message.warning(res.msg)
              }
            })
            .finally(() => {
              that.confirmLoading = false
              that.close()
            })
        }
        if (values.length > 0) {
          that.confirmLoading = true

          for (let item in values) {
            if (values[item].id.length > 19) {
              values[item].id = null
            }
            values[item].tableId = this.record.id
          }
          submitFile(values)
            .then(res => {
              if (res.success) {
                that.$message.success(res.msg)
                that.$emit('ok')
              } else {
                that.$message.warning(res.msg)
              }
            })
            .finally(() => {
              that.confirmLoading = false
              that.close()
            })
        }
      }, false)
    },
    handleCancel() {
      this.close()
    },
    close() {
      this.$emit('close')
      this.visible = false
    }
  }
}
</script>
