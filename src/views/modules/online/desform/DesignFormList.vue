<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="表单名称">
              <a-input placeholder="请输入表单名称" v-model="queryParam.desformName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="表单编码">
              <a-input placeholder="请输入表单编码" v-model="queryParam.desformCode"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAddDesign" type="primary" icon="plus">新增</a-button>
      <!--<a-button type="primary" icon="download" @click="handleExportXls('表单设计')">导出</a-button>-->
      <!--<a-upload-->
      <!--name="file"-->
      <!--:showUploadList="false"-->
      <!--:multiple="false"-->
      <!--:headers="tokenHeader"-->
      <!--:action="importExcelUrl"-->
      <!--@change="handleImportExcel">-->

      <!--<a-button type="primary" icon="import">导入</a-button>-->
      <!--</a-upload>-->

      <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="handleRedoIndex">快速重置索引</a-menu-item>
          <a-menu-item key="2" @click="handleRedoIndexForce">强制重置索引</a-menu-item>
        </a-menu>
        <a-button type="primary" icon="redo" style="margin-left: 8px">重置索引</a-button>
      </a-dropdown>

      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="handleBatchDel">
            <a-icon type="delete"/>
            删除
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作
          <a-icon type="down"/>
        </a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i>
        <span>已选择</span>
        <a style="font-weight: 600">
          {{ selectedRowKeys.length }}
        </a>
        <span>项</span>
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <j-tree-table
        :url="url.list"
        :topValue="null"
        :queryParams="tableQueryParams"
        :immediateRequest="false"

        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange"
        @requestBefore="loading=$event.first"
        @requestFinally="loading=false"
        @requestSuccess="handleRequestSuccess"
      >

        <template v-slot:action="props">
          <a @click="handleEdit(props.record)">编辑</a>
          <a-divider type="vertical"/>
          <a @click="handleDesignForm(props.record)">
            <a-icon type="setting"/>
            设计表单</a>
          <a-divider type="vertical"/>
          <a @click="handleTest(props.record)">表单数据</a>
          <a-divider type="vertical"/>
          <a @click="handleGetPath(props.record)">配置地址</a>
          <a-divider type="vertical"/>
          <a-dropdown>
            <a class="ant-dropdown-link">更多
              <a-icon type="down"/>
            </a>
            <a-menu slot="overlay">
              <a-menu-item @click="handleOpenAuthModal(props.record)">
                权限控制
              </a-menu-item>
              <a-menu-item @click="handleOpenAuthBatchModal('role','角色',props.record)">
                角色授权
              </a-menu-item>
              <a-menu-item @click="handleOpenRoute(props.record)">
                路由配置
              </a-menu-item>
              <a-menu-item v-if="props.record.desformType===1" @click="handleCopyView(props.record)">
                复制视图
              </a-menu-item>
              <a-menu-item v-if="props.record.desformType===1" @click="handleCopyForm(props.record)">
                复制表单
              </a-menu-item>
              <a-menu-item @click="handleIndexTools(props.record)">
                索引工具
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDeleteBefore(props.record)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </template>

      </j-tree-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <add-design-form-modal ref="modalForm" @ok="modalFormOk" @added="handleFormAdded" />
    <design-form-modal ref="designFormModal" @ok="modalFormOk"/>

    <!-- 配置地址区域 -->
    <design-form-address-modal
      :configAddress="configAddress"
      :configListAddress="configListAddress"
      :configFormAddress="configFormAddress"
      :configRearFormAddress="configRearFormAddress"
    />

    <!-- 权限控制 -->
    <design-form-auth-modal ref="authModal"/>

    <!-- 【角色】批量授权 -->
    <auth-batch-modal ref="roleAuthBatchModal" authScopeType="role"/>
    <!--Todo 开发部门、用户授权-->

    <!-- 路由配置 -->
    <design-form-route-drawer ref="routeModal" />

    <design-form-index-tools-modal ref="indexTools"/>

    <redo-index-modal ref="redoIndex"/>

  </a-card>
</template>

<script>
  import JTreeTable from '@/components/jeecg/JTreeTable'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import DesignFormModal from './modules/DesignFormModal'
  import AddDesignFormModal from './modules/AddDesignFormModal'
  import AuthBatchModal from './modules/auth/batch/AuthBatchModal'
  import DesignFormAddressModal from './modules/DesignFormAddressModal'
  import DesignFormAuthModal from './modules/DesignFormAuthModal'
  import DesignFormRouteDrawer from './modules/DesignFormRouteDrawer'
  import DesignFormIndexToolsModal from './modules/DesignFormIndexToolsModal'
  import RedoIndexModal from './modules/RedoIndexModal.vue'

  export default {
    name: 'DesignFormList',
    mixins: [JeecgListMixin],
    components: {
      RedoIndexModal,
      JTreeTable,
      AuthBatchModal,
      DesignFormModal,
      AddDesignFormModal,
      DesignFormAddressModal,
      DesignFormAuthModal,
      DesignFormRouteDrawer,
      DesignFormIndexToolsModal
    },
    data() {
      return {
        description: '表单设计管理页面',
        // 表格查询条件
        tableQueryParams: {},
        // 表头
        columns: [
          // {
          //   title: '#',
          //   dataIndex: '',
          //   key: 'rowIndex',
          //   width: 60,
          //   align: 'center',
          //   customRender: function(t, r, index) {
          //     return parseInt(index) + 1
          //   }
          // },
          {
            title: '表单名称',
            align: 'left',
            width: 420,
            dataIndex: 'desformName'
          },
          {
            title: '表单编码',
            align: 'center',
            width: 240,
            dataIndex: 'desformCode'
          },
          // {
          //   title: '表单图标',
          //   align: 'center',
          //   width: 240,
          //   dataIndex: 'desformIcon'
          // },
          {
            title: '移动视图',
            align: 'center',
            width: 240,
            dataIndex: 'izMobileView_dictText',
            // 只显示“是”
            customRender: (text) => text === '是' ? text : ''
          },
          // {
          //   title: '表单设计JSON',
          //   align: 'center',
          //   dataIndex: 'desformDesignJson'
          // },
          {
            title: '操作',
            key: 'action',
            width: 360,
            align: 'center',
            scopedSlots: { customRender: 'action' }
          }
        ],
        // 请求参数
        url: {
          list: '/desform/list',
          delete: '/desform/delete',
          deleteBatch: '/desform/deleteBatch',
          exportXlsUrl: 'desform/exportXls',
          importExcelUrl: 'desform/importExcel'
        },
        configAddress: {
          code: null,
          visible: false
        },
        // 新增的表单设计器code
        addedDesformCode: null
      }
    },
    computed: {
      importExcelUrl: function () {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
      },
      configListAddress() {
        return `/online/desform/list/${this.configAddress.code}`
      },
      configFormAddress() {
        return `/online/desform/view/${this.configAddress.code}`
      },
      configRearFormAddress() {
        let before = `${window._CONFIG['domianURL']}/desform/`
        let after = `/${this.configAddress.code}`

        return {
          add: `${before}add${after}`,
          edit: `${before}edit${after}/{dataId}`,
          detail: `${before}detail${after}/{dataId}`
        }
      }

    },
    created() {
      this.$nextTick(() => this.loadData())
    },
    methods: {

      initDictConfig() {
      },

      loadData(pageNum) {
        if (pageNum === 1) {
          this.ipagination.current = 1
        }
        let params = this.getQueryParams()
        params.field += ',parentId'
        this.tableQueryParams = params
        console.log('loadData: ---list:', this.tableQueryParams)
      },

      handleAddDesign() {
        this.$refs.modalForm.open('add')
      },

      handleDesignForm(record) {
        this.$refs.designFormModal.open(record)
      },

      handleTest(record) {
        this.configAddress.code = record.desformCode
        this.$router.push({ path: this.configListAddress })
      },

      handleGetPath(record) {
        this.configAddress.code = record.desformCode
        this.configAddress.visible = true
      },

      handleEdit(record) {
        this.$refs.modalForm.open('edit', record)
      },

      /** 打开权限控制窗口 */
      handleOpenAuthModal(record) {
        this.$refs.authModal.open(record)
      },

      /** 打开批量授权窗口 */
      handleOpenAuthBatchModal(type, title, record) {
        let ref = this.$refs[`${type}AuthBatchModal`]
        if (ref && typeof ref.open === 'function') {
          ref.open(record)
        }
      },

      /** 打开路由配置窗口 */
      handleOpenRoute(record) {
        this.$refs.routeModal.open(record)
      },

      /** 复制表单 */
      handleCopyForm(record) {
        this.$refs.modalForm.open('copy', record)
      },

      /** 复制视图 */
      handleCopyView(record) {
        this.$refs.modalForm.open('copy-view', record)
      },

      /** 索引工具 */
      handleIndexTools(record) {
        this.$refs.indexTools.open(record)
      },

      /** 数据加载成功的回调事件 */
      handleRequestSuccess(event) {
        if (event.first) {
          this.dataSource = event.dataSource
          this.ipagination.total = event.res.result.total
        }
        if (this.addedDesformCode != null) {
          let filterList = event.dataSource.filter(data => data.desformCode === this.addedDesformCode)
          if (filterList.length > 0) {
            this.handleDesignForm(filterList[0])
          } else {
            this.$warning({
              title: '无法打开设计页面',
              content: (<span>无法找到新增的表单“{this.addedDesformCode}”，可能是设置了查询条件导致查询不到该条数据导致的，请手动打开设计页面。</span>)
            })
          }
          this.addedDesformCode = null
        }
      },

      handleDeleteBefore(record) {
        if (record.children) {
          this.$error({ content: '请删除完所有的子视图以后再删除主视图！' })
        } else {
          this.handleDelete(record.id)
        }
        console.log('handleDeleteBefore: ', record)
      },

      handleBatchDel() {
        const getRecord = (id, data) => {
          for (let d of data) {
            if (d.id === id) {
              return d
            }
            if (d.children) {
              return getRecord(id, d.children)
            }
          }
        }

        // 判断是否有包含子视图的表单，如果有就去掉选择
        let removeSelectKeys = []
        this.selectedRowKeys.forEach((rowKey, rowIndex) => {
          let record = getRecord(rowKey, this.dataSource)
          if (record && record.children) {
            removeSelectKeys.push(rowIndex)
          }
        })
        removeSelectKeys.reverse()

        for (let idx of removeSelectKeys) {
          this.selectedRowKeys.splice(idx, 1)
        }

        if (this.selectedRowKeys.length === 0) {
          this.$error({ content: '请删除完所有的子视图以后再删除主视图！' })
        } else {
          this.batchDel()
        }
      },

      // 快速重置索引
      handleRedoIndex() {
        this.openRedoIndexModal(0)
      },

      // 强制重置索引
      handleRedoIndexForce() {
        this.openRedoIndexModal(1)
      },

      // 打开重置索引窗口
      openRedoIndexModal(i) {
        let selections = ''
        if (this.selectedRowKeys && this.selectedRowKeys.length > 0) {
          selections = this.selectedRowKeys.join(',')
        }
        this.$refs.redoIndex.open(i, selections)
      },

      /** 新增后触发的事件 */
      handleFormAdded({ desformCode, addedAutoOpenDesign }) {
        if (addedAutoOpenDesign) {
          this.addedDesformCode = desformCode
        }
      }

    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>
