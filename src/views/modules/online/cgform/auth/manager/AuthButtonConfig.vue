<template>
  <div>
    <a-table
      bordered
      rowKey="code"
      :loading="loading"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="false">

      <template slot="switch" slot-scope="text,record">
        <a-switch size="small" :checked="record.status === 1" @click="(flag)=>handleUpdateStatus(flag, record)"/>
      </template>

      <template slot="control">
        可见
      </template>

      <template slot="alias" slot-scope="text, record">
        <!--可编辑控件-->
        <editable-cell v-model="record.alias" @ok="enableAuthButton(record)">
          {{ record.alias }}
        </editable-cell>
      </template>

    </a-table>
  </div>
</template>

<script>
  import { getAction, postAction, putAction } from '@/api/manage'

  export const fixedButton = [
    { code: 'add', title: '新增', status: 0 },
    { code: 'update', title: '编辑', status: 0 },
    { code: 'delete', title: '删除', status: 0 },
    { code: 'batch_delete', title: '批量删除', status: 0 },
    { code: 'export', title: '导出', status: 0 },
    { code: 'import', title: '导入', status: 0 },
    { code: 'super_query', title: '高级查询', status: 0 },
    { code: 'bpm', title: '提交流程', status: 0 },
    { code: 'bind_bpm_show_my_task', title: '流程-筛选我的代办', status: 0 },
    { code: 'bpm_track', title: '流程-审批进度', status: 0 },
    { code: 'bpm_handle', title: '流程-办理', status: 0 },
    { code: 'bpm_entrusted', title: '流程-委托', status: 0 },
    { code: 'bpm_admin_edit', title: '流程-管理员编辑', status: 1 },
    { code: 'bpm_admin_delete', title: '流程-管理员删除', status: 1 },
    { code: 'bpm_finish', title: '流程-完成流程', status: 1 },
    { code: 'bpm_callback', title: '流程-取回流程', status: 1 },
    { code: 'modal_footer', title: '弹窗-整个底部', status: 0 },
    { code: 'modal_save', title: '弹窗-保存按钮', status: 0 },
    { code: 'modal_submit', title: '弹窗-提交流程按钮', status: 0 },
    { code: 'modal_cancel', title: '弹窗-取消按钮', status: 0 }
  ]
  export default {
    name: 'AuthButtonConfig',
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
          this.loadButtons();
        }
      }
    },
    data() {
      return {
        description: '按钮权限管理页面',
        cgformId: '',
        loading: false,
        dataSource: [],
        pageType: 2,
        pageControlList: 3,
        pageControlForm: 5,
        url: '/online/cgform/api/authButton',
        columns: [
          {
            title: '启用',
            key: 'rowIndex',
            width: 80,
            align: 'center',
            scopedSlots: { customRender: 'switch' }
          },
          {
            title: '名称',
            dataIndex: 'title',
            align: 'center'
          },
          {
            title: '编码',
            dataIndex: 'code',
            align: 'center'
          },
          { title: '权限控制', key: 'control', scopedSlots: { customRender: 'control' }, width: 180 },
          { title: '按钮别名', key: 'alias', scopedSlots: { customRender: 'alias' }, width: 180 }
        ]
      }
    },
    methods: {
      // 变更按钮别名
      handleAliasChange(e) {
        console.log('handleAliasChange', e)
      },
      handleUpdateStatus(flag, rd) {
        if (flag == true) {
          this.enableAuthButton(rd)
        } else {
          this.stopAuthButton(rd.id)
        }
      },
      enableAuthButton(rd) {
        let param = {
          code: rd.code,
          page: rd.page,
          cgformId: this.cgformId,
          type: this.pageType,
          control: 5,
          status: 1,
          alias: rd.alias
        }
        if (rd.id) {
          param['id'] = rd.id
        }
        console.log('enableAuthButton', param)
        postAction(`${this.url}`, param).then(res => {
          if (res.success) {
            this.dataSource.map(item => {
              if (item.code == rd.code) {
                item['status'] = 1
                item['id'] = res.result.id
              }
            })
          }
        })
      },

      stopAuthButton(id) {
        putAction(`${this.url}/${id}`).then(res => {
          if (res.success) {
            this.dataSource.map(item => {
              if (item.id == id) {
                item.status = 0
              }
            })
          }
        })
      },

      // 请求自定义按钮信息
      loadButtons() {
        getAction(`${this.url}/${this.cgformId}`).then(res => {
          console.log('loadButtons', res)
          if (res.success) {
            let { buttonList, authList } = res.result
            let arr = []
            this.initFixedButton(authList, arr)
            this.initCustomButton(authList, buttonList, arr)
            this.dataSource = arr
          } else {
            this.dataSource = []
            this.$message.warning(res.message)
          }
        })
      },
      initFixedButton(authList, arr) {
        let temparr = JSON.parse(JSON.stringify(fixedButton))
        for (let a of temparr) {
          a.status = 0
          let auth = authList.filter(i => {
            return i.code === a.code
          })
          a['page'] = this.pageControlList
          if (auth && auth.length > 0) {
            let temp = { ...a }
            arr.push(Object.assign({}, temp, auth[0]))
          } else {
            arr.push(a)
          }
        }
      },
      initCustomButton(authList, buttonList, arr) {
        for (let b of buttonList) {
          let auth = authList.filter(i => {
            return i.code === b.buttonCode
          })
          let obj = {
            code: b.buttonCode,
            title: b.buttonName,
            status: 0,
            page: b.buttonStyle === 'form' ? this.pageControlForm : this.pageControlList
          }
          if (auth && auth.length > 0) {
            arr.push(Object.assign(obj, auth[0]))
          } else {
            arr.push(obj)
          }
        }
      }

    }

  }
</script>

<style scoped>

</style>
