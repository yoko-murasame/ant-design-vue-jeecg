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

  // 定义online列表页面的所有按钮、modal弹窗按钮
  export const fixedButton = [
    // 默认开放行为
    { code: 'add', title: '新增', status: 0, alias: '新增' },
    { code: 'update', title: '编辑', status: 0, alias: '编辑' },
    { code: 'delete', title: '删除', status: 0, alias: '删除' },
    { code: 'batch_delete', title: '批量删除', status: 0, alias: '批量删除' },
    { code: 'export', title: '导出', status: 0, alias: '导出' },
    { code: 'import', title: '导入', status: 0, alias: '导入' },
    { code: 'detail', title: '详情', status: 0, alias: '详情' },
    { code: 'super_query', title: '高级查询', status: 0, alias: '高级查询' },
    { code: 'bpm', title: '提交流程', status: 0, alias: '提交流程' },
    { code: 'bind_bpm_show_my_task', title: '流程-筛选我的待办', status: 0, alias: '我的待办' },
    { code: 'bpm_track', title: '流程-审批进度', status: 0, alias: '审批进度' },
    { code: 'bpm_handle', title: '流程-办理', status: 0, alias: '办理' },
    { code: 'bpm_entrusted', title: '流程-委托', status: 0, alias: '委托' },
    // 流程按钮控制，默认关闭
    { code: 'bpm_admin_edit', title: '流程-管理员编辑', status: 1, alias: '管理员编辑' },
    { code: 'bpm_admin_delete', title: '流程-管理员删除', status: 1, alias: '管理员删除' },
    { code: 'bpm_finish', title: '流程-完成流程', status: 1, alias: '完成流程' },
    { code: 'bpm_callback', title: '流程-取回流程', status: 1, alias: '取回流程' },
    // 表单按钮控制，默认开放
    { code: 'modal_footer', title: '弹窗-整个底部', status: 0, alias: '弹窗footer' },
    { code: 'modal_save', title: '弹窗-保存按钮', status: 0, alias: '保存' },
    { code: 'modal_submit', title: '弹窗-提交流程按钮', status: 0, alias: '保存并提交流程' },
    { code: 'modal_cancel', title: '弹窗-取消按钮', status: 0, alias: '取消' },
    // 列表搜索和重置
    { code: 'list_search', title: '列表-搜索按钮', status: 0, alias: '查询' },
    { code: 'list_reset', title: '列表-重置按钮', status: 0, alias: '重置' },
    { code: 'list_multi_select', title: '列表-多选清空', status: 0, alias: '清空' },
    { code: 'list_column_setting', title: '列表-自定义列(别名用于设置icon)', status: 0, alias: 'setting' }
  ]

  // 获取默认初始化的按钮显隐对象
  export const getDefaultButtonSwitch = () => {
    return fixedButton.reduce((prev, next) => {
      prev[next.code] = true
      return prev
    }, {})
  }

  // 获取默认初始化的按钮显隐对象
  export const getDefaultButtonAlias = () => {
    return fixedButton.reduce((prev, next) => {
      prev[next.code] = next.alias
      return prev
    }, {})
  }

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
          this.loadButtons()
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
      handleUpdateStatus(flag, rd) {
        if (flag) {
          this.enableAuthButton(rd, 1)
        } else {
          this.stopAuthButton(rd.id)
        }
      },
      enableAuthButton(rd, status = 0) {
        let param = {
          code: rd.code,
          page: rd.page,
          cgformId: this.cgformId,
          type: this.pageType,
          control: 5,
          status: status || rd.status,
          alias: rd.alias
        }
        if (rd.id) {
          param['id'] = rd.id
        }
        console.log('enableAuthButton', param)
        postAction(`${this.url}`, param).then(res => {
          if (res.success) {
            this.dataSource.map(item => {
              if (item.code === rd.code) {
                item['status'] = res.result.status ? res.result.status - 0 : 0
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
              if (item.id === id) {
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
