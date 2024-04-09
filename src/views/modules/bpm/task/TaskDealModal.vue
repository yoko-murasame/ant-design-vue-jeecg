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
  <j-modal :title="title" :visible="visible" width="80%" destroyOnClose :class="'jeecg-online-modal'"
    :bodyStyle="bodyStyle" :maskClosable="false" :footer="null" @cancel="handleModalCancel" switchFullscreen>
    <a-tabs v-model="activeKey" tabPosition="left">

      <a-tab-pane key="1">
        <span slot="tab">
          <a-icon type="file-text" />
          <span>业务信息</span>
        </span>
        <div class="component_div">
          <!-- <template v-if="isComp">
            <dynamic-link ref="formModal" :path="path" :formData="formData"></dynamic-link>
          </template>
          <template v-else>
            <iframe :src="iframeUrl" frameborder="0" width="100%" :height="height" scrolling="auto"></iframe> -->
          <!--:onlineTableId="formData.tableName"-->
            <desform-view class="desform-view" :mode="mode" :desformCode="formData.tableName" :dataId="formData.dataId"
              :onlineTableId="formData.cgformId" height="100vh" :innerDialog="true" @reload="handleReload" :isOnline="isOnline"
              ref="desform" />
          <!-- </template> -->
        </div>
      </a-tab-pane>

      <a-tab-pane key="2">
        <span slot="tab">
          <a-icon type="user" />
          <span>任务处理</span>
        </span>
        <task-module :save-form="preSaveForm" :formData="formData" @complete="completeProcess"></task-module>
      </a-tab-pane>

      <a-tab-pane key="3">
        <span slot="tab">
          <a-icon type="sliders" />
          <span>流程图</span>
        </span>
        <process-module :formData="formData"></process-module>
      </a-tab-pane>

    </a-tabs>
  </j-modal>

  <!--</a-modal>-->
</template>

<script>

import { ACCESS_TOKEN } from '@/store/mutation-types'
import { isURL } from '@/utils/validate'
import Vue from 'vue'
import DynamicLink from './form/DynamicLink.vue'
import ProcessModule from './form/ProcessModule'
import TaskModule from './form/TaskModule'
import DesformView from '@/components/online/desform/DesformView.vue'
import { httpAction, getAction } from '@/api/manage'

export default {
  name: 'TaskDealModal',
  components: {
    DynamicLink,
    TaskModule,
    ProcessModule,
    DesformView
  },
  props: ['path', 'formData'],
  computed: {
    isComp: function () {
      console.log('isComp组件名称：', this.path);
      var TOKEN = Vue.ls.get(ACCESS_TOKEN);
      var DOMAIN_URL = window._CONFIG['domianURL'];
      var TASKID = this.formData.taskDefKey;
      var URL = (this.path || '').replace(/{{([^}}]+)?}}/g, (s1, s2) => eval(s2)); // URL支持{{ window.xxx }}占位符变量
      console.log('isComp组件名称：', URL, this.path, this.formData);
      if (isURL(URL)) {
        this.iframeUrl = URL;
        return false;
      }
      return true;
    }
  },
  data() {
    return {
      activeKey: '1',
      loading: false,
      title: '流程',
      visible: false,
      bodyStyle: {
        padding: '0',
        height: (window.innerHeight - 80) + 'px',
        // 'overflow-y': 'hidden'
        'overflow-y': 'auto'
      },
      height: (window.innerHeight - 120) + 'px',
      iframeUrl: '',
      preSaveFormDebounce: null,
        mode: 'edit',
        // mode: 'detail',
        title: '操作',
        visible: false,
        bodyOverflow: null,
        bgColor: 'rgba(0,0,0,0.6)',
        isOnline: false,
      url: {
        json: '/desform/queryByCode',
      },
      loading: false,
      cgformId:""
    }
  },
  created() {
    // this.preSaveFormDebounce = debounce(this.preSaveForm, 500)
    this.init();
  },
  beforeUpdate() {
    // this.preSaveFormDebounce()
    // 需要判断当前modal是否显示状态，否则会提交两次（流程组件-修复改造方法中点击提交流程后会产生两次表单提交的问题）
    // if (this.visible && this.activeKey === '2') {
    //   console.log('页面变化->任务处理->预先检验和提交表单数据')
    //   this.$refs.formModal.$children[0]
    //     .submitForm(true) // false表示不立即提交
    //     .then(record => {})
    //     .catch(() => {
    //       this.$message.error('表单未完成！')
    //       this.activeKey = '1'
    //     })
    // }
  },
  methods: {
    /**
     * 预处理业务表单，进行自动提交
     * 1.需要debounce防抖动函数，可以： npm install lodash/debounce
     * 2.created钩子里添加防抖
     * 3.beforeUpdate钩子里对页面变化到“任务处理”进行业务表单提交
     * 4.注意visible校验保证modal关闭下不再次提交表单
     * 新增：不在beforeUpdate的保存逻辑
     * 1.需要确保业务表单的提交方法，能够返回Promise
     * 2.为组件TaskModule.vue添加此VM引用
     * 3.在“handleProcessComplete”的方法中，调用： await this.parent.preSaveForm()
     * 新增：@20220316
     * 1.结合Jeecg自带的流程中表单编辑模式，showFlowSubmitButton，当此标识为true时，才自动保存数据
     */
    preSaveForm() {
      const that = this
      return new Promise((resolve, reject) => {
        if (that.visible && that.activeKey === '2') {
          let methodProxy = null
          let showFlowSubmitButton = null
          let isOnline = false
          // try {
            // let target = that.$refs.formModal.$children[0]
            // const { handleOk, submitForm, handleSubmit } = target
            // showFlowSubmitButton = target.showFlowSubmitButton || null
            // methodProxy = handleOk || submitForm || handleSubmit || null
            // // 找在线表单的
            // if (!methodProxy) {
            //   // let { handleSubmit } = that.$refs.formModal.$children[0].$children[0].$children[0]
            //   methodProxy = that.getFirstMethodByName(that.$refs.formModal, 'handleSubmit')
            //   isOnline = !!methodProxy
            // }
            // console.log('实现的保存方法', methodProxy)
          // } catch (e) {
          //   console.error('其他情况异常', e)
          //   resolve()
          //   return
          // }

          // 用函数获取自动保存方法
          // let showFlowSubmitButton = that.getFirstMethodByName(that.$refs.formModal, 'showFlowSubmitButton')
          // let methodProxy
          // const methods = ['handleOk', 'submitForm', 'handleSubmit']
          // for (let method of methods) {
          //   methodProxy = that.getFirstMethodByName(that.$refs.formModal, method)
          //   if (methodProxy) {
          //     break
          //   }
          // }
          // console.log('实现的保存方法', methodProxy)
          // reject()
          // return
            // 添加数据表单保存操作
            if(this.mode=== 'edit'){
              this.$refs.desform.saveAllData()
            }
          if (!methodProxy) {
            console.error('业务表单未实现保存方法！')
            resolve()
            return
          }
          if (null == showFlowSubmitButton) {
            showFlowSubmitButton = true
          }
          // 在线表单类型的自动保存设置延迟
          if (isOnline) {
            methodProxy && methodProxy(true)
            setTimeout(() => {
              resolve()
            }, 2000)
          } else {
            // 编码表单的自动保存通过promise返回
            const result = showFlowSubmitButton && methodProxy && methodProxy(true);
            console.log('页面变化->任务处理->预先检验和提交表单数据', result, showFlowSubmitButton)
            showFlowSubmitButton && result && result.then(record => resolve(record))
              .catch(err => {
                that.$message.error('表单未完成！')
                that.activeKey = '1'
                reject(err)
              })
            !showFlowSubmitButton && resolve()
          }
        }
      })
    },
    // 关闭模态框
    handleModalCancel() {
      this.visible = false
    },
    deal(record) {
      this.visible = true;
    },
    completeProcess() {
      this.visible = false;
      this.$emit('ok');
    },
    // 获取指定方法
    getFirstMethodByName(comp, funcName) {
      if (comp[funcName] && typeof comp[funcName] === 'function') {
        // if (comp[funcName]) {
        // console.log('找到的属性', comp[funcName], comp)
        // 如果当前组件存在名称为funcName的方法，则返回该方法
        return comp[funcName];
      }
      // 遍历子组件
      for (const childRef of comp.$children) {
        const childMethod = this.getFirstMethodByName(childRef, funcName);
        if (childMethod) {
          // 如果子组件存在名称为funcName的方法，则返回该方法
          return childMethod;
        }
      }
      // 如果没有找到符合条件的方法，则返回null或者自定义的默认值
      return null;
    },

    handleReload(data) {
      this.$emit('reload', { target: this })
    },
    async init() {
      await this.loadFormJson()
      // await this.loadFormData()

    },
    loadFormJson() {
      return new Promise((resolve, reject) => {
        if (!this.formData || !this.formData.tableName) {
          this.pageLoading = false
          console.warn('--TaskDealModal--loadFormJson--表单数据为空！')
          resolve()
          return
        }
        // 获取json
        var params = { desformCode: this.formData.tableName };// 查询条件
        getAction(this.url.json, params)
          .then(res => {
            this.pageLoading = false
            this.formDataJson = JSON.parse(res.result.desformDesignJson)
            this.formData.cgformId=res.result.cgformId
            console.log("cgformId",this.formData.cgformId)
            resolve()
          })
      })
    },
    loadFormData(){
      return new Promise((resolve,reject)=>{
        if (!this.formData || !this.formData.tableName) {
          this.pageLoading = false
          console.warn('--TaskDealModal--loadFormData--表单数据为空！')
          resolve()
          return
        }
      // 获取表单数据
        getAction(`${this.url.getFormData}/${this.formData.tableName}/${this.formData.tableName.dataId}`).then(res => {
          console.log("获取表单数据", res.result)
          this.$refs.kfb.setData(res.result)
            resolve()
        })

      })
    },

  },
    watch: {
      formData: {
        handler(value) {
            this.formData = value
    this.init();
        }
      },
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
