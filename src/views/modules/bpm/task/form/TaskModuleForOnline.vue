<template>
  <div style="background: #ffffff">
    <!-- 步骤条 -->
    <a-spin :spinning="loading">
      <a-card title="意见信息" :bodyStyle="{padding:'0 20px'}" size="default" style="margin-top:20px">
        <a-list itemLayout="vertical">

          <a-list-item>
            <div style="width: 100%;">
              <div style="margin-bottom: 5px">
                处理意见：
                <a-select
                  style="width: 300px"
                  placeholder="常用审批语"
                  :getPopupContainer="(target) => target.parentNode"
                  @change="handleChangeSelect">
                  <a-icon slot="suffixIcon" type="smile"/>
                  <a-select-option v-for="(item, key) in remarksDictOptions" :key="key" :value="item.value">{{
                    item.text
                  }}
                  </a-select-option>
                </a-select>
                <!--2022.07.20-添加流程处理意见暂存功能-->
                <a-popconfirm title="确定要暂存处理意见吗?" @confirm="cacheMessage">
                  <a-button type="primary">暂存处理意见</a-button>
                </a-popconfirm>
                <a-popconfirm title="确定要恢复暂存意见吗?" @confirm="reloadMessage">
                  <a-button type="primary">恢复暂存意见</a-button>
                </a-popconfirm>
              </div>
              <a-textarea rows="3" v-model="model.reason"/>
            </div>
          </a-list-item>
          <a-list-item>
            <j-upload text="添加文件" v-model="fileList" :returnUrl="false"></j-upload>
          </a-list-item>
          <a-list-item>
            <a-row>
              <a-col :span="24">
                <a-radio-group v-model="model.processModel">
                  <a-radio :checked="true" :value="1">流转下一节点</a-radio>
                  <!-- <a-radio :value="2">多分支模式</a-radio> -->
                  <a-radio :value="3" v-if="resultObj.histListSize>0">驳回</a-radio>
                </a-radio-group>
                <span :hidden="this.model.processModel!==2">
                  <span style="color: red;">多分支模式默认执行所有分支：</span>
                  <!--<a-checkbox-group v-model="transition" >-->
                  <template v-for="(item,index) in resultObj.transitionList">
                    <a-checkbox :checked="true" :value="item.nextnode">{{ item.Transition }}</a-checkbox>
                  </template>
                  <!-- </a-checkbox-group>-->
                </span>
                <span :hidden="this.model.processModel!==3" v-if="resultObj.histListSize>0">
                  <a-select
                    v-model="model.rejectModelNode"
                    :getPopupContainer="(target) => target.parentNode"
                    style="width:350px">
                    <template v-for="(item,index) in resultObj.histListNode">
                      <a-select-option
                        v-if="item.name_ != resultObj.taskName "
                        :value="item.task_def_key_">{{ item.name_ }}</a-select-option>
                    </template>
                  </a-select>
                </span>
              </a-col>
            </a-row>
          </a-list-item>
          <a-list-item>
            <!-- <a-checkbox :checked="checkedNext" @change="handleCheckedNextChange">指定下一步操作人（指定下一步会签人员 xxx待删除）</a-checkbox> -->
            <a-checkbox :checked="checkedNext" @change="handleCheckedNextChange">指定下一步操作人/会签人</a-checkbox>
            <a-checkbox :checked="checkedCc" @change="handleCheckedCcChange">是否抄送</a-checkbox>
          </a-list-item>
          <a-list-item style="line-height: 32px" :hidden="!checkedNext">
            <span>指定下一步操作人（指定下一步会签人员）：</span>
            <!--<a-input style="width: 200px;" v-model="model.nextUserName"></a-input>-->
            <a-select
              style="width: 300px;"
              mode="multiple"
              placeholder="点击选择用户"
              :value="hqUserList"
            >
              <!--<a-select-option v-for="(item,index) in hqUserSelectList" :key="item.name">
                {{ item.name }}
              </a-select-option>-->
            </a-select>
            <a-button type="primary" @click="handleHqUserSelect" icon="search" style="margin-left: 8px">选择</a-button>
            <a-button type="primary" @click="hqUserSelectReset" icon="reload" style="margin-left: 8px">清空</a-button>
            <span>（如果不指定则按照系统默认，默认将移交给任务发起人）</span>

          </a-list-item>
          <a-list-item style="line-height: 32px" :hidden="!checkedCc">
            <span>抄送给：</span>
            <!--<a-input style="width: 200px;" v-model="model.ccUserRealNames"></a-input>-->
            <a-select
              style="width: 300px;"
              mode="multiple"
              placeholder="点击选择按钮"
              :value="ccUserList"
            >
              <!--<a-select-option v-for="(item,index) in ccUserSelectList" :key="item.name">
                {{ item.name }}
              </a-select-option>-->
            </a-select>
            <a-button type="primary" @click="handleCcUserSelect" icon="search" style="margin-left: 8px">选择</a-button>
            <a-button type="primary" @click="ccUserSelectReset" icon="reload" style="margin-left: 8px">清空</a-button>
          </a-list-item>
        </a-list>
        <!-- 流转按钮 -->
        <div style="margin-top:20px;text-align:center">
          <template v-if="model.processModel==1">
            <template v-for="(item,index) in resultObj.transitionList">
              <a-button type="primary" @click="handleProcessComplete(item.nextnode)">{{ item.Transition }}</a-button>
            </template>
          </template>
          <template v-else>
            <a-button type="primary" @click="handleManyProcessComplete()">确认提交</a-button>
          </template>
        </div>
        <br>
      </a-card>
      <!-- 意见 -->
      <a-card title="审批历史" :bodyStyle="{padding:'0 20px'}" size="default" style="margin-top:20px">
        <a-list itemLayout="vertical">
          <template v-for="(item,index) in bpmLogList">
            <a-list-item>
              <a-list-item-meta :description="item.remarks">
                <a slot="title">{{ item.opUserName }}<span style="color: #ff6d75;">[{{ item.taskName }}]</span>
                  {{ item.opTime }}</a>
                <a-avatar slot="avatar" :size="36" icon="user" style="background-color: #51cbff;"></a-avatar>
              </a-list-item-meta>
              <template v-for="(file,index) in item.bpmFiles">
                <div class="ant-upload-list ant-upload-list-text">
                  <div class="ant-upload-list-item ant-upload-list-item-done">
                    <div class="ant-upload-list-item-info">
                      <span>
                        <a-icon type="paper-clip"/>
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          :title="file.fileName"
                          :href="getFileDownloadUrl(file.filePath)"
                          class="ant-upload-list-item-name">{{
                            file.fileName
                          }}</a>
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </a-list-item>
          </template>
        </a-list>
      </a-card>

      <select-user-modal ref="selectHqUserModal" @selectFinished="selectHqUserOK"></select-user-modal>
      <select-user-modal ref="selectCcUserModal" @selectFinished="selectCcUserOK"></select-user-modal>
    </a-spin>
  </div>
</template>

<script>
import { getAction, getFileAccessHttpUrl, httpAction } from '@/api/manage'
import { initDictOptions } from '@/components/dict/JDictSelectUtil'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import AListItem from 'ant-design-vue/es/list/Item'
import Vue from 'vue'
import JEllipsis from '../../../../../components/jeecg/JEllipsis.vue'
import JUpload from '../../../../../components/jeecg/JUpload'
import SelectUserModal from './SelectUserModal'

export default {
  components: {
    JUpload,
    JEllipsis,
    AListItem,
    SelectUserModal
  },
  name: 'TaskModule',
  props: {
    formData: {
      type: Object,
      default() {
        return {}
      }
    },
    /**
     * 流程按钮提交前会触发，表单自己实现相应的保存事件
     */
    saveForm: {
      type: Function,
      default() {
        return async() => {}
      }
    }
  },
  data() {
    return {
      parent: null,
      url: {
        getProcessTaskTransInfo: '/act/task/getProcessTaskTransInfo',
        processComplete: '/act/task/processComplete',
        upload: window._CONFIG['domianURL'] + '/sys/common/upload'
      },
      headers: {},
      resultObj: {},
      checkedNext: false,
      transition: [],
      hqUserSelectList: [],
      ccUserSelectList: [],
      remarksDictOptions: [],
      model: {
        taskId: '',
        nextnode: '',
        nextCodeCount: '',
        reason: '已完成', // 修改默认处理意见
        processModel: 1,
        rejectModelNode: '',
        nextUserName: '',
        nextUserId: '',
        ccUserIds: '',
        ccUserRealNames: '',
        fileList: ''
      },
      bodyStyle: {
        padding: '10px'
      },
      checkedCc: false,
      fileList: [],
      loading: false
    }
  },
  computed: {
    bpmLogList() {
      return (this.resultObj.bpmLogList || []).reverse()
    },
    stepIndex: function () {
      if (this.resultObj.bpmLogListCount > 3) {
        return this.resultObj.bpmLogStepListCount + 1
      }
      return this.resultObj.bpmLogStepListCount
    },
    hqUserList: function () {
      console.log('hq user select ', this.hqUserSelectList)
      var names = []
      var ids = []
      for (var a = 0; a < this.hqUserSelectList.length; a++) {
        names.push(this.hqUserSelectList[a].realname)
        ids.push(this.hqUserSelectList[a].username)
      }
      this.model.nextUserId = ids.join(',')
      this.model.nextUserName = names.join(',')
      return names
    },
    ccUserList: function () {
      console.log('cc user select ', this.ccUserSelectList)
      var names = []
      var ids = []
      for (var a = 0; a < this.ccUserSelectList.length; a++) {
        names.push(this.ccUserSelectList[a].realname)
        ids.push(this.ccUserSelectList[a].username)
      }
      this.model.ccUserIds = ids.join(',')
      this.model.ccUserRealNames = names.join(',')
      return names
    }
  },
  methods: {
    cacheMessage() {
      Vue.ls.set('TaskModuleDealMessage', this.model.reason)
      this.$message.success('处理意见已暂存')
    },
    reloadMessage() {
      const msg = Vue.ls.get('TaskModuleDealMessage')
      !msg && this.$message.info('无暂存数据')
      if (msg) {
        this.model.reason = msg
        this.$message.success('处理意见已恢复')
      }
    },
    handleChangeSelect(value) {
      console.log('handleChangeSelect', value)
      this.model.reason = value
    },
    initDictConfig() {
      // 初始化字典 - 性别
      initDictOptions('approval_remarks').then((res) => {
        if (res.success) {
          this.remarksDictOptions = res.result
        }
      })
    },
    getFileDownloadUrl: function (path) {
      return getFileAccessHttpUrl(path)
    },
    // 此方法已作废
    handleChange2(info) {
      this.fileList = []
      let fileList = info.fileList
      // fileList = fileList.slice(-2);
      fileList = fileList.map((file) => {
        if (file.response) {
          file.url = file.response.message
        }
        return file
      })
      fileList = fileList.filter((file) => {
        console.log('-----fileList response-----', file.response)
        if (file.response) {
          return file.response.success === true
        }
        return false
      }).map((file) => {
        var fileJson = {
          fileName: file.name,
          filePath: file.url,
          fileSize: file.size
        }
        this.fileList.push(fileJson)
      })
      this.model.fileList = JSON.stringify(this.fileList)
      console.log('-----fileList-----', this.model.fileList)
    },
    handleCheckedNextChange(e) {
      this.checkedNext = e.target.checked
      this.hqUserSelectReset()
    },
    handleCheckedCcChange(e) {
      this.checkedCc = e.target.checked
      this.ccUserSelectReset()
    },
    getProcessTaskTransInfo(formData) {
      console.log('getProcessTaskTransInfo', formData)
      var params = { taskId: formData.taskId }// 查询条件
      this.loading = true
      getAction(this.url.getProcessTaskTransInfo, params).then((res) => {
        if (res.success) {
          console.log('流程流转信息', res)
          this.resultObj = res.result
        }
        this.loading = false
      }).finally(() => {
        this.loading = false
      })
    },
    async handleProcessComplete(nextnode) {
      const that = this
      console.log('流程办理数据：', this.model)
      if (!this.model.reason || this.model.reason.length == 0) {
        this.$message.warning('请填写处理意见')
        return
      }
      if (nextnode) {
        this.model.nextnode = nextnode
      }
      var method = 'post'
      this.$confirm({
        title: '提示',
        content: '确认提交审批吗?',
        okText: '确定',
        cancelText: '取消',
        onOk: async function () {
          // 预校验表单
          try {
            if (that.model.processModel !== 3) {
              await that.saveForm()
            }
          } catch (e) {
            console.error('流程保存错误', e)
            console.log('流转信息', that.resultObj)
            return
          }
          that.loading = true
          that.model.fileList = JSON.stringify(that.fileList)
          httpAction(that.url.processComplete, that.model, method).then((res) => {
            if (res.success) {
              // that.$message.success(res.message)
              that.$emit('complete')
            } else {
              // that.$message.error(res.message);
              // 明显点的提示框
              const h = that.$createElement
              let secondsToGo = 30
              const modal = that.$error({
                title: '错误消息',
                // content: `${res.message}\n该提示将在 ${secondsToGo} 秒后自动关闭`
                content: h('div', {}, [
                  h('p', res.message),
                  h('div', `该提示将在 ${secondsToGo} 秒后自动关闭`)
                ])
              })
              const interval = setInterval(() => {
                secondsToGo -= 1
                modal.update({
                  // content: `${res.message}\n该提示将在 ${secondsToGo} 秒后自动关闭`
                  content: h('div', {}, [
                    h('p', res.message),
                    h('div', `该提示将在 ${secondsToGo} 秒后自动关闭`)
                  ])
                })
              }, 1000)
              setTimeout(() => {
                clearInterval(interval)
                modal.destroy()
              }, secondsToGo * 1000)
              // 自动勾选选人按钮
              that.checkedNext = true
            }
          }).finally(() => {
            that.loading = false
            // that.close();
          })
        }
      })
    },
    handleManyProcessComplete() {
      if (this.model.processModel == 3) {
        if (!this.model.rejectModelNode || this.model.rejectModelNode.length == 0) {
          this.$message.warning('请选择驳回节点')
          return
        }
      }
      this.handleProcessComplete()
    },
    selectHqUserOK: function (data) {
      this.hqUserSelectList = data
    },
    handleHqUserSelect: function () {
      this.$refs.selectHqUserModal.add()
    },
    hqUserSelectReset() {
      this.hqUserSelectList = []
    },
    selectCcUserOK: function (data) {
      this.ccUserSelectList = data
    },
    handleCcUserSelect: function () {
      this.$refs.selectCcUserModal.add()
    },
    ccUserSelectReset() {
      this.ccUserSelectList = []
    }
  },
  created() {
    const token = Vue.ls.get(ACCESS_TOKEN)
    this.headers = { 'X-Access-Token': token }
    console.log('任务办理组件数据：', this.formData)
    this.model.taskId = this.formData.taskId
    this.getProcessTaskTransInfo(this.formData)
    this.initDictConfig()
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

.task-date span {
  /* color: #ff6d75;*/
}

.ant-steps-item-description {
  max-width: 200px !important;
}

/** Button按钮间距 */
.ant-btn {
  margin-left: 3px
}
</style>
