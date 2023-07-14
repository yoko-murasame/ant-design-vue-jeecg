<template>
  <a-card :bordered="false" style="height: 100%">

    <div class="table-page-search-wrapper j-jl-cgreport-query">
      <a-form layout="inline">
        <a-row :gutter="24" v-if="queryInfo && queryInfo.length>0">
          <template v-for="(item,index) in queryInfo">
            <template v-if=" item.hidden==='1' ">
              <a-col
                v-if="item.view.indexOf('Date')>=0 || item.view.indexOf('date')>=0"
                :xl="6"
                :lg="7"
                :md="8"
                :sm="24"
                :key=" 'query'+index "
                v-show="toggleSearchStatus">
                <onl-cgreport-query-form-item :queryParam="queryParam" :item="item" :dictOptions="dictOptions"></onl-cgreport-query-form-item>
              </a-col>
              <a-col
                v-else
                :xl="6"
                :lg="7"
                :md="8"
                :sm="24"
                :key=" 'query'+index "
                v-show="toggleSearchStatus">
                <onl-cgreport-query-form-item :queryParam="queryParam" :item="item" :dictOptions="dictOptions"></onl-cgreport-query-form-item>
              </a-col>
            </template>
            <template v-else>
              <a-col
                v-if="item.view.indexOf('Date')>=0 || item.view.indexOf('date')>=0"
                :xl="6"
                :lg="7"
                :md="8"
                :sm="24"
                :key=" 'query'+index ">
                <onl-cgreport-query-form-item :queryParam="queryParam" :item="item" :dictOptions="dictOptions"></onl-cgreport-query-form-item>
              </a-col>
              <a-col
                v-else
                :xl="6"
                :lg="7"
                :md="8"
                :sm="24"
                :key=" 'query'+index ">
                <onl-cgreport-query-form-item :queryParam="queryParam" :item="item" :dictOptions="dictOptions"></onl-cgreport-query-form-item>
              </a-col>
            </template>
          </template>

          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchByQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="table-operator" style="margin-bottom: 10px">
      <a-button type="primary" icon="plus" @click="exportExcel">导出</a-button>
    </div>

    <a-table
      ref="table"
      size="middle"
      bordered
      rowKey="id"
      :columns="table.columns"
      :dataSource="table.dataSource"
      :pagination="table.pagination"
      :loading="table.loading"
      :rowSelection="{ selectedRowKeys: table.selectedRowKeys, onChange: handleChangeInTableSelect}"
      @change="handleChangeInTable"
      style="min-height: 300px"
      class="j-table-force-nowrap"
    >

      <!-- 支持链接href跳转 -->
      <template
        v-for="field of fieldHrefSlots"
        :slot="field.slotName"
        slot-scope="text, record"
      >
        <a @click="handleClickFieldHref(field,record)">{{ text }}</a>
      </template>

    </a-table>

    <!-- 跳转Href的动态组件方式 -->
    <a-modal v-bind="hrefComponent.model" v-on="hrefComponent.on">
      <component :is="hrefComponent.is" v-bind="hrefComponent.params"/>
    </a-modal>

  </a-card>
</template>

<script>
  import { HrefJump } from '@/mixins/OnlAutoListMixin'
  import { getAction, downFile } from '@/api/manage'
  import OnlCgreportQueryFormItem from './OnlCgreportQueryFormItem.vue';
  import { filterObj } from '@/utils/util';

  export default {
    name: 'OnlCgreportAutoList',
    mixins: [HrefJump],
    components: {
      OnlCgreportQueryFormItem
    },
    data() {
      return {
        // 查询参数
        queryInfo: [],
        // 查询参数，多个页面的查询参数用 code 作为键来区分
        queryParamsMap: {},
        selfParam: {
        },
        sorter: {
          column: '',
          order: 'desc'
        },
        dictOptions: {},
        toggleSearchStatus: false, // 高级搜索 展开/关闭
        reportCode: '',
        description: '在线报表功能测试页面',
        url: {
          getColumnsAndData: '/online/cgreport/api/getColumnsAndData/',
          getQueryInfo: '/online/cgreport/api/getQueryInfo/',
          getParamsInfo: '/online/cgreport/api/getParamsInfo/'
        },
        table: {
          // 是否有合计列，默认为""，在第一次获取到数据之后会设计为ture或者false
          isTotal: '',
          realPageSize: 10,
          loading: true,
          // 表头
          columns: [],
          // 数据集
          dataSource: [],
          // 选择器
          selectedRowKeys: [],
          selectionRows: [],
          // scroll: { x: false },
          // 分页参数
          pagination: {
            current: 1,
            pageSize: 10,
            pageSizeOptions: ['10', '20', '30'],
            // showTotal: (total, range) => {
            //   return range[0] + '-' + range[1] + ' 共' + total + '条'
            // },
            showTotal: (total, range) => this.onShowTotal(total, range),
            showQuickJumper: true,
            showSizeChanger: true,
            total: 0,
            onShowSizeChange: (current, pageSize) => {
              this.onSizeChange(current, pageSize);
            }
          }
        },
        cgreportHeadName: ''
      }
    },
    mounted() {
      this.initParamsInfo()
      this.initQueryInfo();
    },
    watch: {
      '$route'() {
        // 刷新参数放到这里去触发，就可以刷新相同界面了
        this.initParamsInfo()
        this.initQueryInfo()
      },
      'table.isTotal'() {
        this.loadData(1);
      }
    },
    computed: {
      queryParam: {
        get() {
          return this.queryParamsMap[this.reportCode]
        },
        set(newVal) {
          this.$set(this.queryParamsMap, this.reportCode, newVal)
        }
      }
    },
    methods: {
      initParamsInfo() {
        if (!this.$route.params.code) {
          return false
        }
        // 获取报表ID
        this.reportCode = this.$route.params.code;
        if (!this.queryParam) {
          this.queryParam = {}
        }
        // update--begin--autor:lvdandan-----date:20201124------for：LOWCOD-1088 【BUG】两个online报表之间跳转。排序后排序条件未清空造成报错 #1822
        // 初始化时清空排序字段
        this.sorter.column = null
        this.sorter.order = null
        // update--end--autor:lvdandan-----date:20201124------for：LOWCOD-1088 【BUG】两个online报表之间跳转。排序后排序条件未清空造成报错 #1822

        // update-begin-author:taoyan date:20201215 for:排序 bug
        if (this.$route.query.column) {
          this.sorter.column = this.$route.query.column
        }
        if (this.$route.query.order) {
          this.sorter.order = this.$route.query.order
        }
        // update-end-author:taoyan date:20201215 for:排序 bug

        this.selfParam = {}
        getAction(`${this.url.getParamsInfo}${this.reportCode}`).then((res) => {
          if (res.success) {
            if (res.result && res.result.length > 0) {
              for (let i of res.result) {
                this.selfParam['self_' + i.paramName] = (!this.$route.query[i.paramName]) ? '' : this.$route.query[i.paramName]
              }
            }
          } else {
            this.$message.warning(res.message)
          }
          this.loadData()
        })
      },
      initQueryInfo() {
        if (!this.reportCode) {
          return false
        }
        getAction(`${this.url.getQueryInfo}${this.reportCode}`).then((res) => {
          console.log('获取查询条件', res);
          if (res.success) {
            this.queryInfo = res.result
          } else {
            this.$message.warning(res.message)
          }
        })
      },
      loadData(arg) {
        if (!this.reportCode) {
          return false
        }
        if (arg == 1) {
          this.table.pagination.current = 1
        }
        let params = this.getQueryParams();// 查询条件
        console.log(params)

        // 获取报表ID
        console.log(' 动态报表 reportCode ： ' + this.reportCode);
        this.table.loading = true

        getAction(`${this.url.getColumnsAndData}${this.reportCode}`, params).then(res => {
          if (res.success) {
            let { data, columns, cgreportHeadName, dictOptions, fieldHrefSlots, isGroupTitle } = res.result
            // href 跳转
            const fieldHrefSlotKeysMap = {}
            fieldHrefSlots.forEach(item => fieldHrefSlotKeysMap[item.slotName] = item)
            // let columnWidth = 230
            this.dictOptions = dictOptions
            let isTotals = []
            columns.forEach(column => {
              // column.width = columnWidth
              // 处理列中的 href 跳转和 dict 字典，使两者可以兼容存在
              this.handleColumnHrefAndDict(column, fieldHrefSlotKeysMap)
              // 判断是否计算总数
              if (column.isTotal === '1') isTotals.push(column.dataIndex)
            })
            // this.table.scroll.x = columns.length * columnWidth
            this.table.columns = [...columns]
            this.cgreportHeadName = cgreportHeadName
            this.fieldHrefSlots = fieldHrefSlots
            if (data) {
              this.table.pagination.total = Number(data.total)
              this.table.dataSource = data.records
              // update--begin--autor:lvdandan-----date:20200930------for：LOWCOD-871【online】online报表合计功能
              // 判断是否为第一次获取数据，如果是的话，则需要重新设置pageSize
              if (this.table.isTotal == '') {
                if (isTotals.length > 0) {
                  this.table.isTotal = true
                  // 有合计字段时，每次最多查询原pageSize-1条记录，另外需要第一次时将查询的10条中删除最后一条
                  // 删除最后一条数据 如果第一次得到的数据长度等于pageSize的话，则删除最后一条
                  if (this.table.dataSource.length == this.table.pagination.pageSize) {
                    let remove_data = this.table.dataSource.pop()
                  }
                  this.table.realPageSize = this.table.pagination.pageSize - 1
                } else {
                  this.table.isTotal = false
                }
              }
              // 需要添加合计字段
              if (this.table.isTotal) {
                let totalRow = { }
                isTotals.forEach(column => {
                  let count = 0
                  this.table.dataSource.forEach(row => {
                    // update--begin--autor:lvdandan-----date:20201211------for：统计去除null及空数据
                    if (row[column] != null && row[column] != '') {
                      count += parseFloat(row[column])
                    }
                    // update--end--autor:lvdandan-----date:20201211------for：统计去除null及空数据
                  })
                  totalRow[column] = isNaN(count) ? '包含非数字内容' : count.toFixed(2)
                })
                this.table.dataSource.push(totalRow)
                this.table.pagination.total = Number(data.total) + Number(Math.floor(data.total / this.table.realPageSize))
              }
              // update--end--autor:lvdandan-----date:20200930------for：LOWCOD-871【online】online报表合计功能

              // update--begin--autor:lvdandan-----date:20201112------for：LOWCOD-355【优化】online报表支持多表头配置
              // columns重新组装，使其表头可合并
              if (isGroupTitle === true) {
                let newColumns = []
                for (let item of this.table.columns) {
                  // 判断字段是否需要合并表头
                  if (item.groupTitle) {
                    let clIndex = newColumns.findIndex(im => im.title === item.groupTitle)
                    if (clIndex !== -1) {
                      // 表头已存在直接push children
                      newColumns[clIndex].children.push(item)
                    } else {
                      // 表头不存在组装表头信息
                      let clGroup = {}; let child = []
                      child.push(item)
                      clGroup.title = item.groupTitle
                      clGroup.align = 'center'
                      clGroup.children = child
                      newColumns.push(clGroup)
                    }
                  } else {
                    newColumns.push(item)
                  }
                }
                this.table.columns = newColumns
              }
              // update--end--autor:lvdandan-----date:20201112------for：LOWCOD-355【优化】online报表支持多表头配置
            } else {
              this.table.pagination.total = 0
              this.table.dataSource = []
            }
          } else {
            this.$message.warn('查询失败：' + res.message)
          }
        }).catch((e) => {
          console.error(e)
          this.$message.error('查询失败')
        }).finally(() => {
          this.table.loading = false
        })
      },
      getQueryParams() {
        let param = Object.assign({}, this.queryParam, this.sorter, this.selfParam);
        param.pageNo = this.table.pagination.current;
        //  实际查询时不使用table组件的pageSize，而使用自定义的realPageSize,realPageSize会在第一次获取到数据后变化
        param.pageSize = this.table.realPageSize
        return filterObj(param);
      },
      searchByQuery() {
        this.loadData(1);
      },
      searchReset() {
        this.queryParam = {}
        this.loadData(1);
      },
      handleToggleSearch() {
        this.toggleSearchStatus = !this.toggleSearchStatus;
      },
      exportExcel() {
        let fileName = this.cgreportHeadName
        let selfParam = {}
        for (let queryName in this.$route.query) {
          if (this.$route.query.hasOwnProperty(queryName)) {
            let value = this.$route.query[queryName]
            selfParam['self_' + queryName] = value || ''
          }
        }
        downFile(`/online/cgreport/api/exportXls/${this.reportCode}`, Object.assign(selfParam, this.queryParam)).then((data) => {
          if (!data) {
            this.$message.warning('文件下载失败')
            return
          }
          if (typeof window.navigator.msSaveBlob !== 'undefined') {
            window.navigator.msSaveBlob(new Blob([data]), fileName + '.xls')
          } else {
            let url = window.URL.createObjectURL(new Blob([data]))
            let link = document.createElement('a')
            link.style.display = 'none'
            link.href = url
            link.setAttribute('download', fileName + '.xls')
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link); // 下载完成移除元素
            window.URL.revokeObjectURL(url); // 释放掉blob对象
          }
        })
      },
      handleChangeInTableSelect(selectedRowKeys, selectionRows) {
        this.table.selectedRowKeys = selectedRowKeys
        this.table.selectionRows = selectionRows
      },
      handleChangeInTable(pagination, filters, sorter) {
        // 分页、排序、筛选变化时触发
        if (Object.keys(sorter).length > 0) {
          this.sorter.column = sorter.field
          this.sorter.order = sorter.order == 'ascend' ? 'asc' : 'desc'
        }
        this.table.pagination = pagination
        this.loadData()
      },
      onSizeChange(current, size) {
        this.table.isTotal = '';
        this.table.pagination.pageSize = size;
        if (this.table.isTotal) {
          this.table.realPageSize = size - 1;
        } else {
          this.table.realPageSize = size
        }
        this.table.pagination.current = 1;
      },
      onShowTotal(total, range) {
        // 重新根据是否有合计计算每页显示的数据
        let start = (this.table.pagination.current - 1) * this.table.realPageSize + 1
        let end = start + (this.table.isTotal ? this.table.dataSource.length - 1 : this.table.dataSource.length) - 1
        return start + '-' + end + ' 共' + total + '条'
      }

    }
  }
</script>
<style scoped>
  .div {
    display: flex;
    align-items: center;
    height: 500px
  }
</style>
<style lang="less">
  @import '~@/assets/less/TableExpand.less';
</style>
