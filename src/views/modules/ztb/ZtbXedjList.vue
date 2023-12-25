<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="5" :lg="5" :md="5" :sm="24">
            <a-form-item label="项目名称">
              <a-input placeholder="请输入项目名称" v-model="queryParam.gcxmmc"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="4" :lg="4" :md="4" :sm="24">
            <a-form-item label="发包方式">
              <j-dict-select-tag
                v-model="queryParam.fbfs"
                dict-code="ztb_xedj_fbfs"
                type="select"
                placeholder="请选择项目类型"/>
            </a-form-item>
          </a-col>
          <a-col :xl="4" :lg="4" :md="4" :sm="4">
            <a-form-item label="施工单位">
              <a-input placeholder="请输入施工单位" v-model="queryParam.sgdw"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="3" :md="3" :sm="4">
            <a-form-item label="超期筛选">
              <j-dict-select-tag
                allowClear
                v-model="queryParam.overdue"
                :trigger-change="true"
                :options="[{value: '1', text: '是', title: '是'}, {value: '0', text: '否', title: '否'}]"
                type="select"
                placeholder="超期筛选" />
            </a-form-item>
          </a-col>
          <a-col :xl="4" :lg="4" :md="4" :sm="4">
            <a-form-item label="填写阶段">
              <j-dict-select-tag
                allowClear
                v-model="queryParam.currentState"
                :trigger-change="true"
                dict-code="ztb_xedj_state"
                type="select"
                placeholder="填写阶段" />
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
          </template>
          <a-col :xl="4" :lg="4" :md="4" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <!--<a @click="handleToggleSearch" style="margin-left: 8px">-->
              <!--  {{ toggleSearchStatus ? '收起' : '展开' }}-->
              <!--  <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>-->
              <!--</a>-->
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('招投标-小额登记')">导出</a-button>
      <a-upload
        name="file"
        :showUploadList="false"
        :multiple="false"
        :headers="tokenHeader"
        :action="importExcelUrl"
        @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <!-- 高级查询区域 -->
      <!--<j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>-->
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        :scroll="{x:true}"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        class="j-table-force-nowrap"
        @change="handleTableChange">

        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="overdueSlot" slot-scope="text, record">
          <a-tooltip v-if="record.overdue === '1'">
            <template v-if="record.currentState === '2'" slot="title">
              {{ '已超过“实际开工时间”半年，请填写“工程过程登记”！' }}
            </template>
            <template v-if="record.currentState === '3'" slot="title">
              {{ '已超过“验收时间”3个月，请上传“结算材料”！' }}
            </template>
            <span style="color: #d71345">{{ text }}</span>
          </a-tooltip>
          <div v-else>{{ text }}</div>
        </template>
        <template slot="percentSlot" slot-scope="text">
          <div>{{ (text || '') ? `${text.split('@@@').reduce((p,c) => p + ' ' + c + '%', '')}` : '' }}</div>
        </template>
        <template slot="imgSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
          <img v-else :src="getImgView(text)" height="25px" alt="" style="max-width:80px;font-size: 12px;font-style: italic;"/>
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
          <a-button
            v-else
            :ghost="true"
            type="primary"
            icon="download"
            size="small"
            @click="downloadFile(text)">
            下载
          </a-button>
        </template>

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handleDetail(record)">详情</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>

    <ztb-xedj-modal
      ref="modalForm"
      :temporarily-save="true"
      :formal-save="true"
      @ok="modalFormOk"></ztb-xedj-modal>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import ZtbXedjModal from './modules/ZtbXedjModal'

export default {
  name: 'ZtbXedjList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    ZtbXedjModal
  },
  data () {
    const that = this
    return {
      isorter: {
        column: 'overdue,createTime',
        order: 'desc,desc'
      },
      description: '招投标-小额登记管理页面',
      // 表头
      columns: [
        {
          title: '序号',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            // return parseInt(index) + 1;
            return (that.ipagination.current - 1) * that.ipagination.pageSize + parseInt(index) + 1
          }
        },
        {
          title: '工程项目名称',
          align: 'center',
          dataIndex: 'gcxmmc'
        },
        {
          title: '工程合同金额(万元)',
          align: 'center',
          dataIndex: 'gchtje'
        },
        {
          title: '工程项目负责人',
          align: 'center',
          dataIndex: 'gcxmfzr'
        },
        {
          title: '发包方式',
          align: 'center',
          dataIndex: 'fbfs_dictText'
        },
        {
          title: '施工单位',
          align: 'center',
          dataIndex: 'sgdw'
        },
        {
          title: '实际开工时间',
          align: 'center',
          dataIndex: 'sjkgsj',
          customRender: function (text) {
            return !text ? '' : (text.length > 10 ? text.substr(0, 10) : text)
          }
        },
        // {
        //   title: '工程内容',
        //   align: 'center',
        //   dataIndex: 'gcnr'
        // },
        {
          title: '合同完成进度',
          align: 'center',
          dataIndex: 'htwcjd',
          scopedSlots: { customRender: 'percentSlot' }
        },
        {
          title: '目前形象进度',
          align: 'center',
          dataIndex: 'mqxxjd',
          scopedSlots: { customRender: 'percentSlot' }
        },
        // {
        //   title: '目前现场照片',
        //   align: 'center',
        //   dataIndex: 'mqxczp'
        // },
        // {
        //   title: '项目存在问题',
        //   align: 'center',
        //   dataIndex: 'xmczwt'
        // },
        {
          title: '工程额支付进度',
          align: 'center',
          dataIndex: 'gcezfjd',
          scopedSlots: { customRender: 'percentSlot' }
        },
        {
          title: '验收时间',
          align: 'center',
          dataIndex: 'yssj',
          customRender: function (text) {
            return !text ? '' : (text.length > 10 ? text.substr(0, 10) : text)
          }
        },
        // {
        //   title: '完工验收材料',
        //   align: 'center',
        //   dataIndex: 'wgyscl'
        // },
        // {
        //   title: '完工照片',
        //   align: 'center',
        //   dataIndex: 'wgzp'
        // },
        // {
        //   title: '结算资料',
        //   align: 'center',
        //   dataIndex: 'jszl'
        // },
        // {
        //   title: '其他附件',
        //   align: 'center',
        //   dataIndex: 'qtfj'
        // },
        {
          title: '填写阶段',
          align: 'center',
          dataIndex: 'currentState_dictText',
          scopedSlots: { customRender: 'overdueSlot' }
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 147,
          scopedSlots: { customRender: 'action' }
        }
      ],
      url: {
        list: '/ztb/ztbXedj/list',
        delete: '/ztb/ztbXedj/delete',
        deleteBatch: '/ztb/ztbXedj/deleteBatch',
        exportXlsUrl: '/ztb/ztbXedj/exportXls',
        importExcelUrl: 'ztb/ztbXedj/importExcel'

      },
      dictOptions: {},
      superFieldList: []
    }
  },
  created() {
    this.getSuperFieldList();
  },
  computed: {
    importExcelUrl: function() {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    }
  },
  methods: {
    initDictConfig() {
    },
    getSuperFieldList() {
      let fieldList = [];
      fieldList.push({ type: 'string', value: 'gcxmmc', text: '工程项目名称', dictCode: '' })
      fieldList.push({ type: 'BigDecimal', value: 'gchtje', text: '工程合同金额', dictCode: '' })
      fieldList.push({ type: 'string', value: 'gcxmfzr', text: '工程项目负责人', dictCode: '' })
      fieldList.push({ type: 'string', value: 'fbfs', text: '发包方式', dictCode: '' })
      fieldList.push({ type: 'string', value: 'sgdw', text: '施工单位', dictCode: '' })
      fieldList.push({ type: 'date', value: 'sjkgsj', text: '实际开工时间' })
      fieldList.push({ type: 'string', value: 'gcnr', text: '工程内容', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'htwcjd', text: '合同完成进度', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'mqxxjd', text: '目前形象进度', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'mqxczp', text: '目前现场照片', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'xmczwt', text: '项目存在问题', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'gcezfjd', text: '工程额支付进度', dictCode: '' })
      fieldList.push({ type: 'date', value: 'yssj', text: '验收时间' })
      fieldList.push({ type: 'Text', value: 'wgyscl', text: '完工验收材料', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'wgzp', text: '完工照片', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'jszl', text: '结算资料', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'qtfj', text: '其他附件', dictCode: '' })
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>
