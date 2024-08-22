<template>
  <!--style="width: calc(100% - 100px); height: calc(100% - 55px);"-->
  <!-- 弹出框 -->
  <!--<a-modal-->
  <!--  :title="title"-->
  <!--  :visible="visible"-->
  <!--  width="80%"-->
  <!--  destroyOnClose-->
  <!--  :class="'jeecg-online-modal'"-->
  <!--  :bodyStyle="bodyStyle"-->
  <!--  :maskClosable="false"-->
  <!--  style="top: 0px;"-->
  <!--  :footer="null"-->
  <!--  @cancel="handleModalCancel">-->
  <j-modal
    :title="title"
    :visible="visible"
    width="80%"
    destroyOnClose
    :class="'jeecg-online-modal'"
    :bodyStyle="bodyStyle"
    :maskClosable="false"
    :footer="null"
    @cancel="handleModalCancel"
    switchFullscreen>
    <a-tabs v-model="activeKey" tabPosition="left">

      <a-tab-pane key="1">
        <span slot="tab">
          <a-icon type="file-text"/>
          <span>业务信息</span>
        </span>
        <div class="component_div" v-if="!pageLoading">
          <!--如果是kform表单设计器类型的走设计器-->
          <!--:onlineTableId="formData.tableName"-->
          <desform-view
            v-if="formData.formType === FORM_TYPE_DESIGNFORM"
            class="desform-view"
            :mode="mode"
            :desformCode="formData.tableName"
            :dataId="formData.dataId"
            :online-table-id="formData.cgformId"
            height="100vh"
            :innerDialog="true"
            @reload="handleReload"
            :isOnline="isOnline"
            ref="realForm"
          />
          <!--online和编码类型的走组件-->
          <dynamic-link v-if="[FORM_TYPE_ONLINE, FORM_TYPE_CODE].includes(formData.formType)" ref="realForm" :path="path" :formData="formData"></dynamic-link>

          <template v-if="!isComp">
            <!--旧版本url版本的表单设计器以iframe形式加载-->
            <iframe :src="iframeUrl" frameborder="0" width="100%" :height="height" scrolling="auto"></iframe>
          </template>
        </div>
      </a-tab-pane>

      <a-tab-pane key="2">
        <span slot="tab">
          <a-icon type="user"/>
          <span>任务处理</span>
        </span>
        <task-module :save-form="preSaveForm" :formData="formData" @complete="completeProcess"></task-module>
      </a-tab-pane>

      <a-tab-pane key="3">
        <span slot="tab">
          <a-icon type="sliders"/>
          <span>流程图</span>
        </span>
        <process-module :formData="formData"></process-module>
      </a-tab-pane>

    </a-tabs>
  </j-modal>

  <!--</a-modal>-->
</template>

<script>

import { getAction } from '@/api/manage'
import DesformView from '@/components/online/desform/DesformView.vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { isURL } from '@/utils/validate'
import Vue from 'vue'
import DynamicLink from './form/DynamicLink.vue'
import ProcessModule from './form/ProcessModule'
import TaskModule from './form/TaskModule'

// 表单类型-online
export const FORM_TYPE_ONLINE = '1'
// 表单类型-设计器
export const FORM_TYPE_DESIGNFORM = '2'
// 表单类型-编码
export const FORM_TYPE_CODE = '3'
export default {
  name: 'TaskDealModal',
  components: {
    DynamicLink,
    TaskModule,
    ProcessModule,
    DesformView
  },
  // eslint-disable-next-line vue/require-prop-types
  props: ['path', 'formData'],
  computed: {
    // kForm表单的展示形式
    mode() {
      return (this.formData && this.formData.disabled) ? 'detail' : 'edit'
    },
    // 是否为组件
    isComp: function () {
      console.log('isComp组件名称：', this.path)
      var TOKEN = Vue.ls.get(ACCESS_TOKEN)
      var DOMAIN_URL = window._CONFIG['domianURL']
      var TASKID = this.formData.taskDefKey
      // eslint-disable-next-line no-eval
      var URL = (this.path || '').replace(/{{([^}}]+)?}}/g, (s1, s2) => eval(s2)) // URL支持{{ window.xxx }}占位符变量
      console.log('isComp组件名称：', URL, this.path, this.formData)
      // 判断是否是旧的设计器表单（以 {{DOMAIN_URL}}/desform/ 开头）
      if (isURL(URL)) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.iframeUrl = URL
        return false
      }
      return true
    }
  },
  data() {
    return {
      activeKey: '1',
      // loading: false,
      // title: '流程',
      // visible: false,
      bodyStyle: {
        padding: '0',
        height: (window.innerHeight - 80) + 'px',
        // 'overflow-y': 'hidden'
        'overflow-y': 'auto'
      },
      height: (window.innerHeight - 120) + 'px',
      iframeUrl: '',
      // mode: 'edit',
      // mode: 'detail',
      title: '操作',
      visible: false,
      bodyOverflow: null,
      bgColor: 'rgba(0,0,0,0.6)',
      isOnline: false,
      url: {
        getKFormMetaData: '/desform/queryByCode',
        getFormData: '/online/cgform/api/form/table_name'
      },
      pageLoading: false,
      cgformId: '',
      FORM_TYPE_ONLINE,
      FORM_TYPE_DESIGNFORM,
      FORM_TYPE_CODE
    }
  },
  created() {
  },
  methods: {
    /**
     * 预处理表单，进行自动提交
     */
    preSaveForm() {
      return new Promise(async (resolve, reject) => {
        if (this.formData.disabled) {
          resolve()
          return
        }
        const func = (this.formData.formType === FORM_TYPE_DESIGNFORM ? this.$refs.realForm : this.$refs.realForm.$refs.realForm).saveFormBeforeBpmSubmit
        if (func) {
          try {
            await func(this.formData.formType)
            resolve()
          } catch (e) {
            this.$message.error('表单未完成！')
            this.activeKey = '1'
            reject(e)
          }
        } else {
          reject('编码表单Form请引入组件：BindBpmFormMixin')
        }
      })
    },
    // 关闭模态框
    handleModalCancel() {
      this.visible = false
    },
    deal(record) {
      this.visible = true
    },
    completeProcess() {
      this.visible = false
      this.$emit('ok')
    },
    handleReload(data) {
      this.$emit('reload', { target: this })
    },
    /**
     * kForm表单设计器加载表单数据
     * @returns {Promise<unknown>}
     */
    loadFormJson() {
      console.log('--TaskDealModal--loadFormJson--加载表单类型：', this.formData.formType, this.formData)
      return new Promise((resolve) => {
        if (!this.formData || this.formData.formType !== FORM_TYPE_DESIGNFORM) {
          this.pageLoading = false
          resolve()
          return
        }
        // 加载kForm表单设计器
        const params = { desformCode: this.formData.tableName }
        getAction(this.url.getKFormMetaData, params).then(res => {
          this.formDataJson = JSON.parse(res.result.desformDesignJson)
          this.formData.cgformId = res.result.cgformId
          this.pageLoading = false
          console.log('--TaskDealModal--loadFormJson--加载kForm表单设计器：', res)
          resolve()
        })
      })
    },
    // /**
    //  * 旧版本表单设计器加载逻辑
    //  * @deprecated
    //  * @returns {Promise<unknown>}
    //  */
    // loadFormData() {
    //   return new Promise((resolve, reject) => {
    //     if (!this.formData || !this.formData.tableName) {
    //       this.pageLoading = false
    //       console.warn('--TaskDealModal--loadFormData--表单数据为空！')
    //       resolve()
    //       return
    //     }
    //     // 获取表单数据
    //     getAction(`${this.url.getFormData}/${this.formData.tableName}/${this.formData.tableName.dataId}`).then(res => {
    //       console.log('获取表单数据', res.result)
    //       this.$refs.kfb.setData(res.result)
    //       resolve()
    //     })
    //   })
    // },
    init() {
      if (this.formData && Object.keys(this.formData).length) {
        this.pageLoading = true
        this.$nextTick(async () => {
          await this.loadFormJson()
          // await this.loadFormData()
        })
      }
    }
  },
  watch: {
    // 初始化
    formData() {
      this.init()
    }
  }
}
</script>

<style lang="less" scoped>
//样式微调
/deep/ .ant-tabs .ant-tabs-left-content {
  padding: 0 24px !important;
}

.ant-tabs-left-content {
  padding-top: 10px !important;
}

.component_div {
  margin-top: 5px;
  margin-bottom: 5px;
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
/deep/ .ant-tabs .ant-tabs-left-content,
.ant-tabs .ant-tabs-right-content {
  height: 90vh;
  overflow-y: auto;
}
</style>
