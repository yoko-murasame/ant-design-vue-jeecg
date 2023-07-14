<template>
  <div class="double-check-ty">
    <!--<div class="table-operator">
      <a-button type="primary" icon="dashboard" ghost @click="allselect">全部选中</a-button>
      <a-button type="primary" icon="close" ghost @click="unselect">取消选中</a-button>
    </div>-->
    <a-table
      bordered
      rowKey="code"
      :loading="loading"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="false">

      <template slot="switch" slot-scope="text,record">
        <a-switch size="small" :checked="record.status === 1" @click="(flag)=>handleUpdateStatus(flag,record.code)"/>
      </template>

      <template slot="list" slot-scope="text, record">
        <a-checkbox :checked="record.listShow" @change="(e)=>updateCheck(e, record.code, 1)" :disabled="record.status === 0">
          可见
        </a-checkbox>
      </template>

      <template slot="form" slot-scope="text, record">
        <a-checkbox :checked="record.formShow" @change="(e)=>updateCheck(e, record.code, 2)" :disabled="record.status === 0">
          可见
        </a-checkbox>
        <a-checkbox :checked="record.formEditable" @change="(e)=>updateCheck(e, record.code, 3)" :disabled="record.status === 0">
          可编辑
        </a-checkbox>
      </template>

    </a-table>
  </div>
</template>

<script>

  import { mapMutations } from 'vuex'
  import { getAction, postAction, putAction } from '@/api/manage'
  export default {
    name: 'AuthColumnConfig',
    props: {
      headId: {
        type: String,
        default: '',
        required: true
      }
    },
    watch: {
      headId: {
        immediate: true,
        handler() {
          this.cgformId = this.headId.split('?')[0]
          this.loadColumns();
        }
      }
    },
    data() {
      return {
        description: '字段权限管理页面',
        cgformId: '',
        loading: false,
        dataSource: [],
        columns: [
          { title: '启用', key: 'rowIndex', width: 80, align: 'center', scopedSlots: { customRender: 'switch' } },
          { title: '字段名称', dataIndex: 'code', width: 200 },
          { title: '字段描述', dataIndex: 'title', width: 200 },
          { title: '列表控制', key: 'list', scopedSlots: { customRender: 'list' }, width: 120 },
          { title: '表单控制', key: 'form', scopedSlots: { customRender: 'form' }, width: 180 }
        ],
        url: '/online/cgform/api/authColumn'
      }
    },
    methods: {
      ...mapMutations({
        storeFields: 'SET_AUTHFIELDS'
      }),

      loadColumns() {
        const exclude = ['id']
        getAction(`${this.url}/${this.cgformId}`).then(res => {
          console.log('loadColumns', res)
          // form list ban hide
          if (res.success) {
            let arr = []
            let fields = []
            res.result.map(item => {
              if (exclude.indexOf(item.code) < 0) {
                if (item.isShowForm == 1 || item.isShowList == 1) {
                  arr.push(item)
                }
                fields.push({
                  text: item.title,
                  value: item.code
                })
              }
            })
            this.dataSource = arr
            this.storeAllFields(fields)
          } else {
            this.dataSource = []
            this.$message.warning(res.message)
          }
        })
      },
      handleUpdateStatus(flag, code) {
        console.log(code, flag)
        let param = {
          cgformId: this.cgformId,
          code: code,
          status: flag ? 1 : 0
        }
        putAction(`${this.url}`, param).then(res => {
          console.log('handleUpdateStatus', res)
          if (res.success) {
            this.dataSource.map(item => {
              if (item.code == code) {
                if (!(item.formEditable || item.formShow || item.listShow)) {
                  item.formEditable = true
                  item.formShow = true
                  item.listShow = true
                }
                item.status = Math.abs(item.status - 1)
              }
            })
          }
        })
      },
      updateCheck(event, code, switchFlag) {
        let checked = event.target.checked
        let param = {
          cgformId: this.cgformId,
          code: code,
          switchFlag: switchFlag,
          listShow: checked,
          formShow: checked,
          formEditable: checked
        }
        postAction(`${this.url}`, param).then(res => {
          console.log('updateCheck', res)
          if (res.success) {
            this.dataSource.map(item => {
              if (item.code == code) {
                if (switchFlag == 1) {
                  item.listShow = checked
                } else if (switchFlag == 2) {
                  item.formShow = checked
                } else if (switchFlag == 3) {
                  item.formEditable = checked
                }
              }
            })
          } else {
            this.$message.warn(res.message)
          }
        })
      },

      allselect() {
        this.dataSource.map(item => {
          if (item.disabled === false) {
            item.page = 8
            item.control = 8
          }
        })
      },
      unselect() {
        this.dataSource.map(item => {
          if (item.disabled === false) {
            item.page = 0
            item.control = 0
          }
        })
      },
      storeAllFields(fields) {
        this.storeFields(fields)
      }

    }
  }
</script>

<style >
.double-check-ty .ant-checkbox + span{
  padding-left:2px;
}
</style>
