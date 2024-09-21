<template>
  <a-card :bordered="false">

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button
        @click="batchDel"
        v-if="selectedRowKeys.length > 0"
        ghost
        type="primary"
        icon="delete">批量删除
      </a-button>
    </div>

    <!-- table区域-begin -->
    <div>

      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i>已选择&nbsp;<a style="font-weight: 600">{{
          selectedRowKeys.length
        }}</a>项&nbsp;&nbsp;
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        :columns="columns"
        :scroll="{x: 1500}"
        size="middle"
        :pagination="false"
        :rowKey=" record => record.id"
        :dataSource="dataSource"
        :loading="loading"
        :expandedRowKeys="expandedRowKeys"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @expandedRowsChange="handleExpandedRowsChange">

        <span slot="action" slot-scope="text, record">
          <a v-if="record.type == 'mvt'" @click="handleField(record)">字段调整</a>

          <a-divider type="vertical" v-if="record.type == 'mvt'"/>

          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical"/>

          <a-dropdown>
            <a class="ant-dropdown-link">
              更多 <a-icon type="down"/>
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a href="javascript:;" @click="handleDetail(record)">详情</a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;" @click="handleAddSub(record)">添加下级</a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;" @click="handleFile(record)">图标管理</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定复制吗?" @confirm="() => handleCopy(record.id)">
                  <a>复制</a>
                </a-popconfirm>
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
    <!-- table区域-end -->

    <resource-layer-model ref="modalForm" @ok="modalFormOk"></resource-layer-model>

    <field-layer-model ref="fieldForm"></field-layer-model>
    <resource-file-model ref="fileForm"></resource-file-model>
  </a-card>
</template>

<script>
import ResourceLayerModel from './modules/ResourceLayerModel'
import FieldLayerModel from './modules/FieldLayerModel'
import ResourceFileModel from './modules/ResourceFileModel'
import { getResourceLayerTree } from '@/api/business'
import { CityListMixin } from '@/mixins/CityListMixin'
import JEllipsis from '@/components/jeecg/JEllipsis'

const columns = [
  {
    title: '菜单编号',
    dataIndex: 'code',
    key: 'code'
  }, {
    title: '菜单名称',
    dataIndex: 'name',
    key: 'name'
  }, {
    title: '数据类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '菜单排序',
    dataIndex: 'sort',
    key: 'sort'
  },
  {
    title: '操作',
    dataIndex: 'action',
    fixed: 'right',
    scopedSlots: { customRender: 'action' },
    align: 'center',
    width: 300
  }
]

export default {
  name: 'ResourceLayerList',
  mixins: [CityListMixin],
  components: {
    ResourceFileModel,
    FieldLayerModel,
    ResourceLayerModel,
    JEllipsis
  },
  data() {
    return {
      description: '这是资源图层列表',
      // 表头
      columns: columns,
      loading: false,
      // 展开的行，受控属性
      expandedRowKeys: [],
      url: {
        list: '/business/resourceLayer/list',
        delete: '/business/resourceLayer/remove',
        deleteBatch: '/business/resourceLayer/remove',
        copy: '/business/resourceLayer/copy'
      }
    }
  },
  methods: {
    loadData() {
      this.dataSource = []
      getResourceLayerTree().then((res) => {
        if (res.success) {
          console.log(res.data)
          this.dataSource = res.data
        }
      })
    },
    handleAddSub(record) {
      this.$refs.modalForm.title = '添加子菜单'
      this.$refs.modalForm.disableSubmit = false
      this.$refs.modalForm.edit({ status: '1', permsType: '1', route: true, 'parentId': record.id, menuType: 1 })
    },
    handleExpandedRowsChange(expandedRows) {
      this.expandedRowKeys = expandedRows
    },
    handleField(record) {
      this.$refs.fieldForm.edit(record)
      this.$refs.fieldForm.title = '字段修改排序'
    },
    handleFile(record) {
      this.$refs.fileForm.edit(record)
      this.$refs.fileForm.title = '资源文件'
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>
