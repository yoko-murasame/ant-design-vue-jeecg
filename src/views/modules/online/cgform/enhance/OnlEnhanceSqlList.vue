<template>
  <a-modal
    title="SQL增强"
    :width="modalWidth"
    :style="modalStyle"
    :visible="visible"
    @cancel="handleCancel"
    cancelText="关闭">

    <template slot="footer">
      <a-button key="back" @click="handleCancel">关闭</a-button>
      <div v-if="aiTestMode" style="display: inline-block;float:left">
        <a-button @click="genEnhanceSqlData(code, tableName)">生成测试数据</a-button>
      </div>
    </template>

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator" style=" margin-bottom: 18px;">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>

      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div :style="table_area_style">
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="false"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange">

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />

          <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
            <a>删除</a>
          </a-popconfirm>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <onl-enhance-sql-modal ref="modalForm" :code="code" :btnList="btnList" @ok="modalFormOk"></onl-enhance-sql-modal>
  </a-modal>
</template>

<script>
  import OnlEnhanceSqlModal from './OnlEnhanceSqlModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import { getAction } from '@/api/manage'
  import { AiTestOnlineMixin } from '@/views/modules/aitest/onlinetest.mixins'
  import { online_default_button } from '@/views/modules/online/cgform/util/TableUtils'

  export default {
    name: 'OnlEnhanceSqlList',
    mixins: [JeecgListMixin, AiTestOnlineMixin],
    components: {
      OnlEnhanceSqlModal
    },
    data () {
      return {
        modalWidth: '100%',
        modalStyle: {
          'top': 0,
          'padding': 0,
          'height': (window.innerHeight - 5) + 'px',
          'overflow-y': 'auto'
        },
        table_area_style: {
          'height': (window.innerHeight - 210) + 'px'
        },
        visible: false,
        description: 'SQL增强管理页面',
        code: '',
        url: {
          list: '/online/cgform/head/enhanceSql',
          delete: '/online/cgform/head/enhanceSql',
          deleteBatch: '/online/cgform/head/deletebatchEnhanceSql'
        },
        isorter: {
          column: 'orderNum',
          order: 'asc'
        },
        btnList: [],
        disableMixinCreated: true,
        tableName: '',
        // 表头
        columns: [
          {
            title: '页面按钮',
            align: 'center',
            dataIndex: 'buttonCode',
            customRender: (text) => {
              return this.renderButtonText(text)
            }
          },
          {
            title: '增强SQL',
            align: 'center',
            dataIndex: 'cgbSql',
            ellipsis: true
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: { customRender: 'action' }
          }]
      }
    },
    methods: {
      renderButtonText(text) {
        let str = ''
        for (let item of online_default_button) {
          if (item.code === text) {
            str = item.title
            break;
          }
        }
        if (!str) {
          for (let item of this.btnList) {
            if (item.buttonCode === text) {
              str = item.buttonName
              break;
            }
          }
        }
        return str
      },
      loadBtnList() {
        if (!this.code) {
          this.btnList = []
          return
        }
        let url = `/online/cgform/head/enhanceButton/${this.code}`
        getAction(url).then((res) => {
          if (res.success) {
            if (!res.result || res.result.length == 0) {
              this.btnList = []
            } else {
              // 按钮过滤 java增强只看action按钮
              this.btnList = res.result.filter(item => item.optType == 'action')
            }
          }
          // 先加载按钮 再加载数据
          this.loadData(1)
        })
      },
      loadData() {
        if (!this.code) {
          return
        }
        let path = `${this.url.list}/${this.code}`
        getAction(path).then((res) => {
          if (res.success) {
            this.dataSource = res.result
          }
        })
      },
      handleCancel() {
        this.visible = false
        this.code = ''
      },
      show(row) {
        this.code = row.id
        this.tableName = row.tableName
        this.visible = true
        this.loadBtnList()
      }
    }
  }
</script>
<style lang="less" scoped>
  // 兼容1.6.2版本的antdv全屏
  /deep/ .ant-modal {
    top: 0;
    padding: 0;
  }
</style>
