<template>
  <div>
    <!-- 步骤条 -->
    <a-spin :spinning="loading">
      <a-card>
        <a-steps progressDot :current="stepIndex" style="padding: 10px" size="default">
          <template v-if="resultObj.bpmLogListCount >3">
            <a-step>
              <template slot="title">
                <div class="task-title">...</div>
              </template>
            </a-step>
          </template>
          <template v-for="(item,index) in resultObj.bpmLogStepList">
            <a-step id="step">
              <template slot="title">
                <div class="task-title">{{ item.taskName }}</div>
              </template>
              <template slot="description">
                <div class="task-user aglin-style"><a-icon type="user" /> {{ item.opUserName }}</div>
                <div class="task-date aglin-style" style="white-space:normal"><a-icon type="history" /> <span> <j-ellipsis :value="item.opTime" :length="10"></j-ellipsis></span></div>
              </template>
            </a-step>
          </template>
          <template v-if="resultObj.currTaskName&&resultObj.currTaskName!=''">
            <a-step >
              <template slot="title">
                <div class="task-title">{{ resultObj.currTaskName }}</div>
              </template>
              <template slot="description">
                <div class="task-user aglin-style"><a-icon type="user" />{{ resultObj.currTaskNameAssignee }}</div>
                <div class="task-date aglin-style"> <span style="color: #ff6d75;"><a-icon type="history" /> <j-ellipsis :value="resultObj.currTaskNameStartTime"></j-ellipsis></span></div>
              </template>
            </a-step>
            <a-step>
              <template slot="title">
                <div class="task-title">...</div>
              </template>
            </a-step>
          <!--<a-step>
            <template slot="title">
              <div class="task-title"></div>
            </template>
          </a-step>-->
          </template>

        </a-steps>
      </a-card>
      <!-- 意见 -->
      <a-card title="审批历史" :bodyStyle="{padding:'0 20px'}" size="default" style="margin-top:20px">
        <a-list itemLayout="vertical">
          <template v-for="(item,index) in bpmLogList">
            <a-list-item >
              <a-list-item-meta :description="item.remarks">
                <a slot="title">{{ item.opUserName }}<span style="color: #ff6d75;">[{{ item.taskName }}]</span> {{ item.opTime }}</a>
                <a-avatar slot="avatar" :size="36" icon="user" style="background-color: #51cbff;"></a-avatar>
              </a-list-item-meta>
              <template v-for="(file,index) in item.bpmFiles">
                <div class="ant-upload-list ant-upload-list-text">
                  <div class="ant-upload-list-item ant-upload-list-item-done">
                    <div class="ant-upload-list-item-info">
                      <span>
                        <a-icon type="paper-clip" />
                        <a target="_blank" rel="noopener noreferrer" :title="file.fileName" :href="getFileDownloadUrl(file.filePath)" class="ant-upload-list-item-name">{{ file.fileName }}</a>
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </a-list-item>
          </template>
        </a-list>
      </a-card>
    </a-spin>
  </div>
</template>

<script>
import { getAction, getFileAccessHttpUrl } from '@/api/manage'
import JEllipsis from '@/components/jeecg/JEllipsis.vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import Vue from 'vue'

export default {
  components: { JEllipsis },
  name: 'BizHisTaskModule',
  props: ['formData'],
  data() {
    return {
      url: {
        // getHisProcessTaskTransInfo: '/act/task/getHisProcessTaskTransInfo',
        getHisProcessTaskTransInfo: '/workflow/common/getHisProcessTaskTransInfo'
      },
      headers: {},
      resultObj: {},
      checkedNext: false,
      transition: [],
      hqUserSelectList: [],
      ccUserSelectList: [],
      model: {
        taskId: '',
        nextnode: '',
        nextCodeCount: '',
        reason: '',
        processModel: 1,
        rejectModelNode: '',
        nextUserName: '',
        nextUserId: '',
        ccUserIds: '',
        ccUserRealNames: ''
      },
      bodyStyle: {
        padding: '10px'
      },
      checkedCc: false,
      loading: false
    }
  },
  computed: {
    bpmLogList() {
      return (this.resultObj.bpmLogList || []).reverse()
    },
    stepIndex: function () {
      if (this.resultObj.bpmLogListCount > 3) {
        return this.resultObj.bpmLogStepListCount + 1;
      }
      return this.resultObj.bpmLogStepListCount;
    }
  },
  methods: {
    getFileDownloadUrl: function (path) {
      return getFileAccessHttpUrl(path)
    },
    handleChange() {
    },
    getHisProcessTaskTransInfo(formData) {
      var params = { procInstId: formData.procInsId };// 查询条件
      this.loading = true;
      getAction(this.url.getHisProcessTaskTransInfo, params).then((res) => {
        if (res.success) {
          console.log('流程流转信息', res);
          this.resultObj = res.result;
        }
        this.loading = false;
      })
    }
  },
  created() {
    const token = Vue.ls.get(ACCESS_TOKEN);
    this.headers = { 'X-Access-Token': token };
    console.log('任务办理组件数据：', this.formData);
    this.getHisProcessTaskTransInfo(this.formData);
  }
}
</script>

<style scoped>
  .task-info {
    margin: 20px 0;
  }

  .task-title {
    font-weight: bold;
  }

  .task-date {
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ant-steps-item-description {
    max-width: 200px !important;
  }

  /** Button按钮间距 */
  .ant-btn {
    margin-left: 3px
  }

  /** 审批记录中办理人和办理时间排版 */
  .aglin-style {
    text-align:left;
    margin-left: 35px
  }
</style>
