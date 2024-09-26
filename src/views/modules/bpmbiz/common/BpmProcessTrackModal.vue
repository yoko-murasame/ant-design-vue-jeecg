<template>
  <!--style="width: calc(100% - 100px); height: calc(100% - 55px);"-->
  <!-- 弹出框 -->
  <!--<a-modal-->
  <!--  :title="title"-->
  <!--  :visible="visible"-->
  <!--  width="80%"-->
  <!--  style="top: 20px;"-->
  <!--  destroyOnClose-->
  <!--  :bodyStyle="bodyStyle"-->
  <!--  :footer="null"-->
  <!--  @cancel="handleModalCancel">-->
  <j-modal
    :title="title"
    :visible="visible"
    width="80%"
    destroyOnClose
    :bodyStyle="bodyStyle"
    :footer="null"
    @cancel="handleModalCancel"
    switchFullscreen
  >
    <a-spin :spinning="confirmLoading">
      <a-tabs defaultActiveKey="1" tabPosition="left">
        <a-tab-pane key="1">
          <span slot="tab">
            <a-icon type="sliders"/>
            <span>流程跟踪</span>
          </span>
          <biz-process-module :formData="formData"></biz-process-module>
        </a-tab-pane>
        <a-tab-pane key="2">
          <span slot="tab">
            <a-icon type="file-text"/>
            <span>{{ title || '审批记录' }}</span>
          </span>
          <br>
          <br>
          <biz-his-task-module :formData="formData"></biz-his-task-module>
          <br>
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </j-modal>
  <!--</a-modal>-->
</template>

<script>

import { getAction } from '@/api/manage'
import BizProcessModule from '../BizProcessModule.vue'
import BizHisTaskModule from './BizHisTaskModule.vue'
import BizTaskModule from './BizTaskModule.vue'
import BizTaskRejectModule from './BizTaskRejectModule.vue'

export default {
  name: 'BpmProcessTrackModal',
  components: {
    BizProcessModule,
    BizHisTaskModule,
    BizTaskRejectModule,
    BizTaskModule
  },
  data() {
    return {
      loading: false,
      title: '审批记录',
      visible: false,
      confirmLoading: false,
      bodyStyle: {
        marginTop: '0',
        padding: '0',
        height: (window.innerHeight - 80) + 'px',
        // 'overflow-y': 'hidden'
        'overflow-y': 'auto'
      },
      iframeUrl: '',
      opt: '',
      formData: {},
      url: {
        getBizHisProcessNodeInfo: '/workflow/common/getBizHisProcessNodeInfo'
      }
    }
  },
  created() {
  },
  methods: {
    // 关闭模态框
    handleModalCancel() {
      this.visible = false
    },
    handleTrack(params) {
      getAction(this.url.getBizHisProcessNodeInfo, params).then((res) => {
        if (res.success) {
          console.log('获取流程节点信息', res);
          var data = {
            dataId: res.result.dataId,
            procInsId: res.result.procInsId,
            tableName: res.result.tableName,
            vars: res.result.records
          }
          this.formData = data;
          console.log('------获取流程节点信息', this.formData);
          this.path = res.result.formUrl;
          console.log('获取流程节点信息', this.path);
          this.visible = true;
        } else {
          this.$message.error(res.message)
        }
      })
    },
    completeProcess() {
      this.visible = false;
      this.$emit('ok');
    }

  }

}
</script>

<style  lang="less" scoped>
  .ant-tabs-left-content{
    padding-top: 10px !important;
  }
  // 兼容1.6.2版本的antdv全屏
  /deep/ .ant-modal {
    top: 1vh;
    padding: 0;
  }
  /**
   * 固定左侧办理按钮，右侧内容框滚动
   * 1.bodyStyle -> 'overflow-y': 'hidden' todo oa的内置窗口会有高度固定成窗口问题，导致无法滚动，属性改为 'auto' 后正常
   * 2.配置下面样式
   */
  /deep/ .ant-tabs .ant-tabs-left-content, .ant-tabs .ant-tabs-right-content {
    height: 90vh;
    overflow-y: auto;
  }
</style>
