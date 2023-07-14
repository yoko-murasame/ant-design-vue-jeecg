<template>
  <div>
    <a-table
      rowKey="id"
      size="small"
      :bordered="true"
      :loading="loading"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="pagination"
      :rowSelection="{selectedRowKeys: selectedRowKeys, type: 'radio', onChange: onSelectChange}"
      :customRow="clickThenCheck"
      style="height: 100%;"
      @change="handleTableChange"/>
  </div>
</template>

<script>
  import { getAction } from '@/api/manage'

  export default {
    name: 'LsUser',
    data() {
      return {
        loading: false,
        columns: [
          { title: '用户账号', align: 'center', dataIndex: 'username' },
          { title: '真实姓名', align: 'center', dataIndex: 'realname' }
        ],
        dataSource: [],
        pagination: {
          current: 1,
          pageSize: 10,
          pageSizeOptions: ['10', '20', '30'],
          showTotal: (total, range) => {
            return range[0] + '-' + range[1] + ' 共' + total + '条'
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0
        },
        selectedRowKeys: [],
        rowSelection: {
          type: 'radio',
          selectedRowKeys: this.selectedRowKeys,
          onChange: (keys, rows) => this.onSelectChange(keys, rows)
        },
        url: '/sys/user/list'
      }
    },
    created() {
      console.log('online 权限 查看用户信息')
      this.loadData(1)
    },
    methods: {
      onSelectChange(keys, rows) {
        console.log(rows)
        this.selectionRows = rows
        this.selectedRowKeys = keys
      },
      clickThenCheck(record) {
        return {
          on: {
            click: () => {
              console.log(12)
              this.onSelectChange(record.id.split(','), [record]);
            }
          }
        };
      },
      handleTableChange(pagination) {
        this.pagination = pagination
        this.loadData()
      },
      loadData(arg) {
        // 加载数据 若传入参数1则加载第一页的内容
        if (arg === 1) {
          this.pagination.current = 1;
        }
        let params = {
          pageSize: this.pagination.pageSize,
          pageNo: this.pagination.current
        }
        this.loading = true;
        getAction(this.url, params).then((res) => {
          console.log(res)
          if (res.success) {
            this.dataSource = res.result.records;
            this.pagination.total = res.result.total;
          }
          if (res.code === 510) {
            this.$message.warning(res.message)
          }
          this.loading = false;
        })
      }

    }

  }
</script>

<style scoped>

</style>
