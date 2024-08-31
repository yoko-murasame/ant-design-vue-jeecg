/**
 * 自定义流程任务处理模块mixin
 * 这里的方法和参数必须要
 */
import { getAction, httpAction } from '@/api/manage'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { initDictOptions } from '@comp/dict/JDictSelectUtil'
import Vue from 'vue'

export const TaskModuleMixin = {
  props: {
    /**
     * TODO 流程审批流转数据，必传
     */
    formData: {
      type: Object,
      default() {
        return {
          showReject: false,
          taskId: '',
          onlineFormConfig: {
            initQueryParam: {}
          }
        }
      }
    },
    /**
     * 表单组件实例
     */
    formVm: {
      type: Object,
      default: null
    },
    /**
     * TODO 流程按钮提交前会触发，表单自己实现相应的保存事件
     */
    saveForm: {
      type: Function,
      default() {
        // 两个参数，flag为表单的提交标识，可能是123去判断是否发起流程；buttonName为当前审批节点用户点击的按钮名称
        return async(flag, buttonName) => {}
      }
    },
    // 意见信息默认字典
    dictCode: {
      type: String,
      default: 'approval_remarks'
    },
    // 是否显示审批步骤(最上面模块)
    showSteps: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      url: {
        getProcessTaskTransInfo: '/act/task/getProcessTaskTransInfo',
        processComplete: '/act/task/processComplete',
        upload: window._CONFIG['domianURL'] + '/sys/common/upload'
      },
      headers: {},
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
      // 流转信息
      resultObj: {},
      checkedNext: false,
      fileList: [],
      loading: false,
      remarksDictOptions: []
    }
  },
  created() {
    const token = Vue.ls.get(ACCESS_TOKEN)
    this.headers = { 'X-Access-Token': token }
    console.log('任务办理组件数据：', this.formData)
    this.model.taskId = this.formData.taskId
    this.getProcessTaskTransInfo(this.formData)
    this.initDictConfig()
  },
  methods: {
    initDictConfig() {
      // 初始化字典 - 性别
      initDictOptions(this.dictCode).then((res) => {
        if (res.success) {
          this.remarksDictOptions = res.result
        }
      })
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
    handleManyProcessComplete() {
      if (this.model.processModel == 3) {
        if (!this.model.rejectModelNode || this.model.rejectModelNode.length == 0) {
          this.$message.warning('请选择驳回节点')
          return
        }
      }
      this.handleProcessComplete()
    },
    async handleProcessComplete(nextnode, buttonName = '确认提交') {
      const that = this
      console.log('流程办理数据：', this.model)
      if (!this.model.reason || this.model.reason.length === 0) {
        this.$message.warning('请填写处理意见')
        return
      }
      if (nextnode) {
        this.model.nextnode = nextnode
      }
      var method = 'post'
      this.$confirm({
        title: '提示',
        content: buttonName === '确认提交' ? '确认提交审批吗?' : `确认${buttonName}吗?`,
        okText: '确定',
        cancelText: '取消',
        onOk: async function () {
          // 预校验表单
          try {
            if (that.model.processModel !== 3) {
              await that.saveForm(null, buttonName)
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
  }
}
