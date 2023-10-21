<style type="text/css" scoped></style>
<style lang="less" scoped ></style>

<template>
  <div>
    <a-modal
      :title="modalTitle"
      :width="modalWidth"
      :bodyStyle="{'minHeight':'560px'}"
      :visible="modalVisible"
      :destroyOnClose="true"
      @ok="handleModalOk"
      :confirmLoading="modalConfirmLoading"
      @cancel="handleModalCancel" >
      <!-- :centered="true" -->
      <a-table
        ref="table"
        bordered
        size="middle"
        :rowKey="(record,index)=>index"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="false"
        :loading="loading"
        @change="handleTableChange" >
        <template slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </template>
        <template slot="version" slot-scope="text, record, index">
          V{{ text }}
        </template>
        <template slot="name" slot-scope="text, record, index">
          <div style="cursor: pointer" @click="goToDetail(record)" title="点击查看">{{ text }}</div>
        </template>
        <template slot="action" slot-scope="text, record">
          <a @click="handleRecoverVersion(record.id)">恢复至本版本</a>
          <a-divider type="vertical"/>
          <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
            <a>删除</a>
          </a-popconfirm>
          <a-divider type="vertical"/>
          <a :href="downloadCompleteUrl+record.id" target="_blank" >下载</a>
        </template>
      </a-table>
    </a-modal>

    <!-- <bimface-detail ref="bimfaceDetail" ></bimface-detail> -->

  </div>
</template>

<script>
import { mapActions } from 'vuex'
import Vue from 'vue'
import { PROJECT_ID } from '@/store/mutation-types'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { putAction, postAction, getAction, deleteAction } from '@/api/manage'
// import BimfaceDetail from '../BimfaceDetail.vue'

const columns = [
  // {
  //   title: '序号',
  //   scopedSlots: { customRender: 'serial' },
  //   width: '80px',
  //   align: 'center'
  // },
  {
    title: '版本',
    dataIndex: 'version',
    width: '80px',
    align: 'center',
    scopedSlots: { customRender: 'version' }
    // width: '22%'
  },
  {
    title: '名称',
    dataIndex: 'name',
    width: '180px',
    align: 'center',
    scopedSlots: { customRender: 'name' }
    // width: '22%'
  },
  {
    title: '上传人',
    dataIndex: 'uploadBy',
    width: '100px',
    align: 'center'
    // scopedSlots: { customRender: 'count' },
  },
  {
    title: '上传时间',
    dataIndex: 'createTime',
    width: '150px',
    align: 'center'
    // scopedSlots: { customRender: 'count' },
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
    align: 'center',
    width: 150
  }
]
export default {
  name: 'HistoryList',
  mixins: [JeecgListMixin],
  components: {
    // BimfaceDetail
  },
  props: {

  },
  data () {
    return {
      // 表头
      columns, // 总计划表头

      modalTitle: '操作',
      modalWidth: 900,
      modalVisible: false,
      modalConfirmLoading: false,
      modalSpinning: false,

      url: {
        list: '/technical/file/history?fileId='
      },
      downLoadUrl: '/technical/file/download/',
      backNeedRefresh: false,
      fileId: ''
    }
  },
  computed: {
    projectId: function() {
      return Vue.ls.get(PROJECT_ID)
    },
    downloadCompleteUrl: function() {
      return window._CONFIG['domianURL'] + this.downLoadUrl
    }
  },
  mounted () {},
  methods: {
    ...mapActions([ 'loadContactPersonListSimple' ]),
    show(id) { // 显示弹窗 暴露给父组件调用
      console.log('show')
      this.modalVisible = true
      this.fileId = id
      this.backNeedRefresh = false
      this.loadData()
    },
    loadData(arg) {
      if (!this.modalVisible) {
        return
      }
      if (!this.url.list || !this.fileId) {
        this.$message.error('请设置url.list属性!')
        return
      }
      // 加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1
      }
      var params = {}
      // var params = this.getQueryParams(); //查询条件
      // params.projectId = this.projectId
      this.loading = true
      getAction(this.url.list + this.fileId, params).then((res) => {
        if (res.success) {
          this.dataSource = res.result
        } else {
          this.$notification.error({
            message: '出错提示',
            description: res.message
          })
        }
        this.loading = false
      })
    },
    handleModalCancel () {
      this.modalVisible = false
      this.modalConfirmLoading = false
      this.selectedRowKeys = []
      this.selectedRows = []
      this.dataSource = []
      this.fileId = ''
      if (this.backNeedRefresh) {
        this.backNeedRefresh = false
        this.$emit('ok')
      }
    },
    handleModalOk (e) {
      e.preventDefault()
      let that = this
      // this.$emit('ok',this.selectedRowKeys,this.selectedRows)
      this.handleModalCancel()
    },
    handleDelete: function(id) {
      var that = this
      deleteAction('/technical/file/' + id).then((res) => {
        if (res.success) {
          that.backNeedRefresh = true
          that.$message.success(res.message)
          that.loadData()
        } else {
          that.$message.warning(res.message)
        }
      })
    },
    handleRecoverVersion(id) {
      var that = this
      getAction('/technical/file/reVersion?fileId=' + id).then((res) => {
        if (res.success) {
          that.backNeedRefresh = true
          that.$message.success(res.message)
          // that.loadData();
        } else {
          that.$message.warning(res.message)
        }
      })
    },
    goToDetail(item) {
      if (item.bimfaceFile && item.bimfaceFile.fileId) {
        // this.$router.push({name:'construction-drawing-detail',query: {id:item.bimfaceFile.fileId}})
        /* let routeUrl = this.$router.resolve({
          name:'construction-drawing-detail',
          query: {id:item.bimfaceFile.fileId}
        });
        window.open(routeUrl.href, '_blank'); */
        this.$refs.bimfaceDetail.show(item.bimfaceFile.fileId)
      }
      else {
        if (item.type === 'DOCUMENT' || item.type === 'PICTURE') {
          item.ossFile.url && window.open(item.ossFile.url)
          return
        }
        console.log(item);
        this.$notification.warning({
          message: '提示',
          description: '当前模型/图纸转化失败'
        })
      }
    }

  }
}
</script>
