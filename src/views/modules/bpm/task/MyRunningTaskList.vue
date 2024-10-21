<template>
  <div>

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">

          <!--<a-col :md="6" :sm="12">-->
          <!--  <a-form-item label="流程编号">-->
          <!--    <a-input placeholder="请输入流程编号" v-model="queryParam.processDefinitionId"></a-input>-->
          <!--  </a-form-item>-->
          <!--</a-col>-->
          <a-col :md="6" :sm="12">
            <a-form-item label="业务标题">
              <a-input placeholder="请输入业务标题" v-model="queryParam.bpmBizTitle"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="流程名称">
              <a-input placeholder="请输入流程名称" v-model="queryParam.processDefinitionName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="12">
            <a-form-item label="任务发起人">
              <a-input-search placeholder="选择任务发起人" readOnly @search="handleSelect" v-model="model.userName">
                <a-button slot="enterButton" icon="search">选择</a-button>
              </a-input-search>
            </a-form-item>
          </a-col>

          <a-col :md="4" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <!-- table区域-begin -->
    <div>

      <a-table
        :scroll="{x: 1500}"
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange">

        <span slot="action" slot-scope="text, record">
          <template v-if="record.taskAssigneeId&&record.taskAssigneeId!=''">
            <a @click="handleProcess(record)">
              办理
            </a>
            <a-divider type="vertical" />
            <a-dropdown>
              <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
              <a-menu slot="overlay">
                <a-menu-item>
                  <a-popconfirm title="确定要委托给别人处理吗?" @confirm="() => selectEntruster(record)">
                    <a>委托</a>
                  </a-popconfirm>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
            <!--<a @click="selectEntruster(record)">委托</a>-->
          </template>
          <template v-else>
            <a @click="handleClaim(record)" >
              签收
            </a>
          </template>

        </span>
        <!-- 字符串超长截取省略号显示-->
        <span slot="bpmBizTitle" slot-scope="text, record">
          <a-icon
            title="催办提醒"
            v-if="record.taskUrge"
            theme="twoTone"
            twoToneColor="#eb2f96"
            @click="taskNotify(record)"
            type="notification"/>
          <j-ellipsis :value="text" :length="100"/>
        </span>
        <span slot="processDefinitionId" slot-scope="text, record">
          <j-ellipsis :value="text" :length="18"/>
        </span>
        <span slot="processDefinitionName" slot-scope="text, record">
          <j-ellipsis :value="text" :length="15"/>
        </span>

      </a-table>
    </div>
    <!-- 弹出框 -->
    <task-deal-modal ref="taskDealModal" :path="path" :formData="formData" @ok="handleOk"></task-deal-modal>
    <select-entruster-modal ref="selectEntrusterModal" @selectFinished="handleEntruster"></select-entruster-modal>
    <task-notify-me-modal ref="taskNotifyMeModal"></task-notify-me-modal>
    <select-single-user-modal ref="selectSingleUserModal" @selectFinished="selectUserOK"></select-single-user-modal>
  </div>
</template>

<script>
import { getAction, putAction } from '@/api/manage'
import TaskDealModal from './TaskDealModal';
import SelectEntrusterModal from './form/SelectEntrusterModal';
import JEllipsis from '@/components/jeecg/JEllipsis'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { BpmNodeInfoMixin } from '@/views/modules/bpm/mixins/BpmNodeInfoMixin'
import TaskNotifyMeModal from '../../extbpm/process/TaskNotifyMeModal.vue';
import SelectSingleUserModal from './form/SelectSingleUserModal.vue';
import { MenuUtil } from '@comp/yoko/utils/MenuUtil'

export default {
  name: 'MyRunningTaskList',
  mixins: [JeecgListMixin, BpmNodeInfoMixin],
  components: {
    SelectSingleUserModal,
    TaskNotifyMeModal,
    SelectEntrusterModal,
    TaskDealModal,
    JEllipsis
  },
  data () {
    return {
      description: '我的任务',
      // 查询条件
      queryParam: {},
      model: {
        userName: ''
      },
      // 表头
      columns: [
        {
          title: '序号',
          width: 60,
          dataIndex: '',
          key: 'rowIndex',
          align: 'center',
          customRender: function(t, r, index) {
            return parseInt(index) + 1
          }
        }, {
          title: '业务标题',
          align: 'center',
          dataIndex: 'bpmBizTitle',
          scopedSlots: { customRender: 'bpmBizTitle' }
        }, {
          title: '流程名称',
          align: 'center',
          width: 300,
          dataIndex: 'processDefinitionName',
          scopedSlots: { customRender: 'processDefinitionName' }
        }, {
          title: '发起人',
          width: 120,
          align: 'center',
          dataIndex: 'processApplyUserName'
        }, {
          title: '开始时间',
          align: 'center',
          width: 150,
          dataIndex: 'taskBeginTime'
        }, {
          title: '当前环节',
          align: 'center',
          width: 150,
          dataIndex: 'taskName'
        },
        // {
        //   title: '流程编号',
        //   align: 'center',
        //   dataIndex: 'processDefinitionId',
        //   scopedSlots: { customRender: 'processDefinitionId' }
        // }, {
        //   title: '任务ID',
        //   align: 'center',
        //   dataIndex: 'taskId'
        // }, {
        //   title: '流程实例',
        //   width:100,
        //   align: 'center',
        //   dataIndex: 'processInstanceId'
        // },
        {
          title: '操作',
          align: 'center',
          dataIndex: 'action',
          fixed: 'right',
          width: 150,
          scopedSlots: { customRender: 'action' }
        }
      ],
      path: 'modules/bpm/task/form/FormLoading',
      formData: {},
      url: {
        list: '/workflow/common/myTaskList/v2', // '/act/task/list',
        claim: '/act/task/claim',
        taskEntrust: '/act/task/taskEntrust'
      },
      taskId: ''
    }
  },
  methods: {
    loadData(arg) {
      if (!this.url.list) {
        this.$message.error('请设置url.list属性!')
        return
      }
      // 加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1
      }
      var params = this.getQueryParams() // 查询条件
      this.loading = true
      getAction(this.url.list, params).then(res => {
        if (res.success) {
          // update-begin---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
          this.dataSource = res.result.records || res.result
          if (res.result.total) {
            this.ipagination.total = res.result.total
          } else {
            this.ipagination.total = 0
          }
          // 更新菜单代办
          new MenuUtil().updateTodoNum(this.ipagination.total)
          // update-end---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
        }
        if (res.code === 510) {
          this.$message.warning(res.message)
        }
        this.loading = false
      })
    },
    searchReset() {
      this.queryParam = {};
      this.model.userName = '';
      this.loadData(1);
    },
    selectUserOK: function(data) {
      this.model.userName = data.realname;
      this.queryParam.userName = data.username;
    },
    handleSelect: function() {
      this.$refs.selectSingleUserModal.select();
    },
    handleProcess(record) {
      this.$refs.taskDealModal.activeKey = '1'
      this.getProcessNodeInfo(record);
    },
    handleClaim(record) {
      var that = this;
      var params = { taskId: record.id };// 查询条件
      this.$confirm({
        okText: '确定',
        cancelText: '取消',
        title: '确认签收吗',
        content: '是否签收该任务?',
        onOk: function() {
          putAction(that.url.claim, params).then((res) => {
            if (res.success) {
              that.$message.success(res.message);
              that.loadData();
            } else {
              that.$message.warning(res.message);
              that.loadData();
            }
          })
        }
      });
    },
    handleOk() {
      this.loadData();
    },
    selectEntruster(record) {
      this.taskId = record.id;
      this.$refs.selectEntrusterModal.select(record);
      this.$refs.selectEntrusterModal.title = '选择委托人';
    },
    handleEntruster(data) {
      var that = this;
      var params = {
        taskId: this.taskId,
        taskAssignee: data.username
      };// 查询条件
      console.log('委托', params)
      putAction(that.url.taskEntrust, params).then((res) => {
        if (res.success) {
          that.$message.success(res.message);
          that.loadData();
        } else {
          that.$message.warning(res.message);
          that.loadData();
        }
      })
    },
    // 催办
    taskNotify(record) {
      this.$refs.taskNotifyMeModal.notify(record);
      this.$refs.taskNotifyMeModal.title = '催办提醒';
    }
  }
}
</script>
<style lang="less" scoped>
  /** Button按钮间距 */
  .ant-btn {
    margin-left: 3px
  }
</style>
