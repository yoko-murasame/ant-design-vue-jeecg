import { getAction, postAction, putAction } from '@api/manage'
import { intersectionWith, throttle } from 'lodash'

/**
 * 高度封装流程接入核心方法类
 * @author Yoko
 * 0.和业务表单List列表高度解耦合设计
 * 1.自动根据接入List组件
 * 2.实现嵌入表单式的任务办理、任务签收、任务委托功能
 * 3.实现流程发起
 * 4.实现流程取回
 * 5.实现流程直接完成
 * 6.实现自定义按钮嵌入(BindBpmButton)
 * 7.实现表单多流程支持(覆写getFlowCode()方法)
 */
export default {
  data() {
    return {
      vm: this,
      url: {
        // 自定义流程办理接口
        getProcessNodeInfo: '/act/process/extActProcessNode/getProcessNodeInfo',
        getHisProcessNodeInfo: '/act/process/extActProcessNode/getHisProcessNodeInfo',
        // 自定义流程处理接入：我的待办列表、签收、委托、获取流程节点信息
        myTaskList: '/workflow/common/myTaskList/v2', // 旧接口：/act/task/list
        claim: '/act/task/claim',
        taskEntrust: '/act/task/taskEntrust',
        getBizProcessNodeInfo: '/act/process/extActProcessNode/getBizProcessNodeInfo',
        // 其余流程功能对接：发起流程、审批进度
        // startProcess: '/act/process/extActProcess/startMutilProcess',
        startProcess: '/workflow/common/startMutilProcess',
        callBackProcess: '/workflow/common/callBackProcess',
        finishProcess: '/workflow/common/finishProcess',
        getExtActProcess: '/workflow/common/getExtActProcess'
      },
      /**
       * 通过正则找到form，如果有特殊清空需要用户自定义，e.g. modules/state-owned/PurchasePlan/modules/GzcgCgjhForm
       * (this.$options.__file || '').replace(/src\/views\/(.*)\/(.*?)List\.vue/, '$1/modules/$2Form'),
       * done 这里的 this.$options.__file 在生产环境打包后无效，需要换方式解决，见created钩子
       */
      formUrl: 'modules/bpm/task/form/OnlineFormDetail',
      formUrlMobile: 'check/onlineForm/detail',
      // 流程定义id，默认与表名相同
      processDefinitionId: '',
      // 自定义流程处理接入
      path: 'modules/bpm/task/form/FormLoading',
      taskId: '',
      myTaskList: null,
      innerFormData: {},
      // 流程状态字段名
      bpmStatusFieldName: 'bpm_status',
      // 流程跟踪过程的特殊条件 TODO 加入online列表可配置化
      trackCondition: true,
      // 当前表名
      currentTableName: '',
      // 流程跟踪过程的按钮展示文本
      trackName: '审批进度',
      trackHisName: '审批历史',
      // 初始化参数，也会自动注入发起时的流程变量
      initQueryParam: {},
      // 流程编码前缀
      flowCodePre: 'onl_',
      flowCodePreDesign: 'desform_',
      // 是否含有流程状态字段
      hasBpmStatus: false,
      // 是否是online表单
      isOnlineForm: '',
      // 是否是kForm设计器表单
      isDesForm: '',
      // kForm设计器表单保存后，会自动生成的表单编码
      desFormCode: '',
      // 是否循环发起流程
      bpmCirculate: false
    }
  },
  created() {
    this.loadData = throttle(this.loadData, 100, { 'trailing': false })
    this.combineBpmDataList = throttle(this.combineBpmDataList, 100, { 'trailing': false })
    this.getProcessDefinitionId = throttle(this.getProcessDefinitionId, 100, { 'trailing': false })
    console.log('BindBpmOnlineMixin', this.path, this.formUrl)
  },
  methods: {
    /**
     * 获取flowCode
     * @param record
     */
    async getFlowCode(record = {}) {
      // console.log('getFlowCode', record, this.hasBpmStatus, this.isDesForm, this.desFormCode)
      const dynamicCode = await this.getDynamicFlowCode(JSON.stringify(record) === '{}' ? this.innerFormData : record)
      if (dynamicCode) {
        return dynamicCode
      }
      return (this.isDesForm === 'Y' ? this.flowCodePreDesign : this.flowCodePre) + this.currentTableName
    },
    /**
     * 获取动态流程编码，如果是多流程列表,可能需要复写此方法
     * @param record
     */
    async getDynamicFlowCode(record = {}) {
      // TODO 自己根据业务实现
      return ''
    },
    /**
     * 获取processDefinitionId,如果是多流程列表,可能需要复写此方法
     * 编码表单：覆盖 data.processDefinitionId 即可
     * online表单：自动根据 onl_表明 去请求数据库获取 processDefinitionId
     */
    async getProcessDefinitionId() {
      console.log('getProcessDefinitionId', this.innerFormData)
      const flowCode = await this.getFlowCode()
      if (!this.processDefinitionId) {
        // console.log('获取processDefinitionId', flowCode, this.currentTableName)
        const { result, success, message } = await getAction(this.url.getExtActProcess, {
          relationCode: flowCode,
          formTableName: this.currentTableName
        })
        if (!success) {
          // this.$message.error(message)
          console.error(message)
          throw new Error(message)
        }
        console.log('获取processDefinitionId', flowCode, this.currentTableName, result)
        this.processDefinitionId = result.processKey
      }
      return this.processDefinitionId
    },
    /**
     * 取回流程
     * @param record
     */
    callBackProcess(record) {
      const that = this
      getAction(`${this.url.callBackProcess}?id=${record.id}`).then(async res => {
        that.$message.success(res.message || '取回成功')
        await that.afterCallBackProcess(record)
        await that.fetchBpmDataList()
        that.loadData()
      })
    },
    async afterCallBackProcess(record) {
      console.log('afterCallBackProcess hook', record)
    },
    /**
     * 完成流程
     * @param record
     */
    finishProcess(record) {
      getAction(`${this.url.finishProcess}/${record.id}`).then(async res => {
        if (res.success) {
          this.$message.success(res.message || '成功完成')
          await this.afterFinishProcess(record)
          await this.fetchBpmDataList()
          this.loadData()
          this.onClearSelected()
        } else {
          this.$message.error(res.message)
        }
      })
    },
    async afterFinishProcess(record) {
      console.log('afterFinishProcess hook', record)
    },
    /**
     * 流程跟踪
     * @param record
     */
    async handleTrack(record) {
      const flowCode = await this.getFlowCode(record)
      // 查询条件 可循环发起时，查询历史就不报错误了
      const params = { flowCode, dataId: record.id, throwEx: !this.bpmCirculate }
      this.$refs.bindBpm.$refs.bpmProcessTrackModal.title = this.getRealTrackName(record)
      this.$refs.bindBpm.$refs.bpmProcessTrackModal.handleTrack(params)
    },
    /**
     * 发起流程
     * @param record
     * @param auto 自动发起无需确认
     * @param btnText
     */
    async startProcess(record, auto = false, btnText = '提交流程') {
      const flowCode = record.flowCode || await this.getFlowCode(record)
      if (!flowCode) {
        throw new Error('请配置data.flowCode或复写getFlowCode()方法')
      }
      if (!this.formUrl) {
        throw new Error('请配置data.formUrl')
      }
      const that = this
      const submitFunc = () => {
        let params = {
          flowCode,
          id: record.id,
          formUrl: that.formUrl,
          formUrlMobile: that.formUrlMobile,
          bpmVariables: that.initQueryParam || {}
        }
        postAction(that.url.startProcess, params).then(async res => {
          if (res.success) {
            that.$message.success(res.message)
            await that.fetchBpmDataList()
            that.loadData()
            that.onClearSelected()
          } else {
            that.$message.warning(res.message)
          }
        }).catch((e) => {
          that.$message.warning('不识别的请求!')
        })
      }
      if (auto) {
        submitFunc()
      } else {
        that.$confirm({
          okText: '确定',
          okType: '',
          cancelText: '取消',
          title: '提示',
          content: `确认${btnText}吗?`,
          onOk: submitFunc
        })
      }
    },
    /**
     * 加载我的待办列表接口数据
     * @20221011 产生了我的待办超过100条的数据了，需要调整大一点
     * @returns {Promise<void>}
     */
    async fetchBpmDataList() {
      const processDefinitionId = await this.getProcessDefinitionId()
      const { success, message, result } = await getAction(this.url.myTaskList, {
        processDefinitionId: processDefinitionId,
        pageSize: 1000
      })
      !success && this.$message.error(message)
      this.myTaskList = result.records || []
      // console.log('fetchBpmDataList', result, this.myTaskList)
    },
    /**
     * 将我的待办列表，映射到数据列表
     * 这里走缓存策略，仅在触发流程相关操作时，触发 fetchBpmDataList() 刷新任务列表
     * 第一次调用，默认 myTaskList 为null 或 空列表，这时硬性加载数据
     * 后续调用， myTaskList 流程相关操作时触发 fetchBpmDataList()
     * @returns {Promise<void>}
     */
    async combineBpmDataList() {
      // console.log('combineBpmDataList', this.myTaskList, this.getFlowCode(), this.currentTableName)
      if (!this.hasBpmStatus || !this.buttonSwitch.bpm) {
        console.log('非流程表单，不加载流程数据')
        return
      }
      if (!this.myTaskList || !this.myTaskList.length) {
        await this.fetchBpmDataList()
      }
      if (!this.myTaskList.length) {
        return
      }
      const recordsWithTask = intersectionWith(this.table.dataSource, this.myTaskList, (record, task) => {
        if (record.id === task.businessId) {
          this.$set(record, 'bpmData', task)
          return true
        }
        return false
      })
      console.log('加载我的待办列表，映射到数据列表', recordsWithTask) //, this.table.dataSource, this.myTaskList)
    },
    // /**
    //  * 加载流程数据，需要在loadData后执行，注入流程数据到 record.bpmData
    //  * @deprecated 这个形式请求过多，可废弃了，采用新的后端接口实现读取当前流程待办列表，外加映射到列表数据
    //  * @param val
    //  */
    // loadBpmData(val) {
    //   if (!this.getFlowCode()) {
    //     throw new Error('请配置flowCode')
    //   }
    //   const promises = this.table.dataSource.map(item => item.bpmStatus === '2' ? getAction(this.url.getBizProcessNodeInfo, {
    //     flowCode: this.getFlowCode(),
    //     dataId: item.id
    //   }) : Promise.resolve({ success: false }))
    //   Promise.all(promises).then((arr) => {
    //     arr.forEach((result, idx) => {
    //       result.success && this.$set(this.table.dataSource[idx], 'bpmData', result.result)
    //     })
    //     console.log('loadBpmData', arr, this.table.dataSource)
    //   })
    // },
    /**
     * 展示流程-我的任务处理面板
     * 依赖组件: import TaskDealModal from '@views/modules/bpm/task/TaskDealModal';
     * 依赖Mixin: import { BpmNodeInfoMixin } from '@/views/modules/bpm/mixins/BpmNodeInfoMixin'
     * @param record
     */
    handleProcess(record) {
      this.$refs.bindBpm.$refs.taskDealModal.activeKey = '1'
      // 单条数据查的旧接口需要重新匹配，新的直接传bpmData
      this.getProcessNodeInfo(record.bpmData)
      // this.getProcessNodeInfo({
      //   id: record.bpmData.taskId,
      //   taskId: record.bpmData.taskDefKey,
      //   processInstanceId: record.bpmData.procInsId
      // });
    },
    /**
     * 签收任务
     * @param record
     */
    handleClaim(record) {
      const that = this
      // 旧版是record.bpmData.taskId，新的流程数据是record.bpmData.id
      const params = { taskId: record.bpmData.id || record.bpmData.taskId }// 查询条件
      this.$confirm({
        okText: '确定',
        cancelText: '取消',
        title: '确认签收吗',
        content: '是否签收该任务?',
        onOk: function () {
          putAction(that.url.claim, params).then(async (res) => {
            if (res.success) {
              that.$message.success(res.message)
              await that.fetchBpmDataList()
              that.loadData()
            } else {
              that.$message.warning(res.message)
              await that.fetchBpmDataList()
              that.loadData()
            }
          })
        }
      })
    },
    selectEntruster(record) {
      this.taskId = record.bpmData.id
      this.$refs.bindBpm.$refs.selectEntrusterModal.select(record)
      this.$refs.bindBpm.$refs.selectEntrusterModal.title = '选择委托人'
    },
    handleEntruster(data) {
      const that = this
      const params = {
        taskId: this.taskId,
        taskAssignee: data.username
      }// 查询条件
      console.log('委托', params)
      putAction(that.url.taskEntrust, params).then(async (res) => {
        if (res.success) {
          that.$message.success(res.message)
          await that.fetchBpmDataList()
          that.loadData()
        } else {
          that.$message.warning(res.message)
          await that.fetchBpmDataList()
          that.loadData()
        }
      })
    },
    async handleTaskDealOK() {
      await this.fetchBpmDataList()
      this.loadData()
    },
    getProcessNodeInfo(record, showModal = true) {
      let params = { taskId: record.id }// 查询条件
      return new Promise((resolve, reject) => {
        getAction(this.url.getProcessNodeInfo, params).then((res) => {
          if (res.success) {
            console.log('获取流程节点信息', res)
            let data = {
              dataId: res.result.dataId,
              taskId: record.id,
              taskDefKey: record.taskId,
              procInsId: record.processInstanceId,
              tableName: res.result.tableName,
              permissionList: res.result.permissionList,
              vars: res.result.records,
              formType: record.formType,
              // 配置来的参数
              modelAndViewType: res.result.modelAndViewType,
              showTask: res.result.showTask,
              showProcess: res.result.showProcess,
              showReject: res.result.showReject,
              customTaskModule: res.result.customTaskModule,
              showMessageHandle: res.result.showMessageHandle,
              onlineCode: res.result.onlineCode,
              onlineFormConfig: res.result.onlineFormConfig,
              onlineInitQueryParamGetter: res.result.onlineInitQueryParamGetter
            }
            this.innerFormData = data
            // update--begin--autor:scott-----date:20191005------for：流程节点配置组件URL的时候也支持传递参数了，解决TASK #3238流程节点无法与online的复制视图对接------
            console.log('获取流程节点表单URL', res.result.formUrl)

            let tempFormUrl = res.result.formUrl
            // 节点配置表单URL，VUE组件类型对应的拓展参数
            this.innerFormData['disabled'] = true
            if (tempFormUrl && tempFormUrl.indexOf('?') !== -1 && !isURL(tempFormUrl) && tempFormUrl.indexOf('{{DOMAIN_URL}}') === -1) {
              tempFormUrl = res.result.formUrl.split('?')[0]
              console.log('获取流程节点表单URL（去掉参数）', tempFormUrl)
              // update--begin--autor:taoyan-----date:20200729------for：支持新版代码生成器，简易实现表单带button编辑效果------
              let qv = getQueryVariable(res.result.formUrl)
              this.innerFormData.extendUrlParams = qv
              // 设置表单可编辑
              if (qv.edit === '1' || qv.edit === 'true' || qv.edit === 1) {
                this.innerFormData['disabled'] = false
              }
              // update--end--autor:taoyan-----date:20200729------for：支持新版代码生成器，简易实现表单带button编辑效果------
            }

            // update--begin--autor:scott-----date:20191005------for：节点配置设计器表单的URL，需要参数传递taskid，用于节点表单权限------
            // 如果没有taskId参数，程序自动追加，用于设计器表单节点权限
            if (tempFormUrl != null && tempFormUrl.indexOf('{{DOMAIN_URL}}/desform/') !== -1 && tempFormUrl.indexOf('taskId') === -1) {
              tempFormUrl = tempFormUrl.trim()
              if (tempFormUrl.endsWith('?')) {
                tempFormUrl = tempFormUrl + 'taskId=' + record.taskId
              } else {
                tempFormUrl = tempFormUrl + '&taskId=' + record.taskId
              }
            }
            this.path = tempFormUrl
            // update--end--autor:scott-----date:20191005------for：节点配置设计器表单的URL，需要参数taskid，用于节点表单权限-----

            // update--end--autor:scott-----date:20191005------for：流程节点配置组件URL的时候也支持传递参数了，解决TASK #3238流程节点无法与online的复制视图对接------

            console.log('获取流程节点信息', this.innerFormData, this.path)
            if (showModal && this.$refs.bindBpm) {
              this.$refs.bindBpm.$refs.taskDealModal.deal(record)
              this.$refs.bindBpm.$refs.taskDealModal.title = '流程办理'
            }
            resolve(res.result)
          } else {
            reject(res.message)
          }
        })
      })
    },
    getHisProcessNodeInfo(record) {
      var params = { procInstId: record.processInstanceId }// 查询条件
      getAction(this.url.getHisProcessNodeInfo, params).then((res) => {
        if (res.success) {
          console.log('获取流程节点信息', res)
          var data = {
            dataId: res.result.dataId,
            taskId: record.id,
            taskDefKey: record.taskId,
            procInsId: record.processInstanceId,
            tableName: res.result.tableName,
            vars: res.result.records,
            formType: record.formType || res.result.formType,
            ccOrHis: res.result.ccOrHis
          }
          this.innerFormData = data
          // update--begin--autor:scott-----date:20191005------for：流程节点配置组件URL的时候也支持传递参数了，解决TASK #3238流程节点无法与online的复制视图对接------
          console.log('获取流程节点表单URL ', res.result.formUrl)

          let tempFormUrl = res.result.formUrl
          // 节点配置表单URL，VUE组件类型对应的拓展参数
          if (tempFormUrl && tempFormUrl.indexOf('?') !== -1 && !isURL(tempFormUrl) && tempFormUrl.indexOf('{{DOMAIN_URL}}') === -1) {
            tempFormUrl = res.result.formUrl.split('?')[0]
            console.log('获取流程节点表单URL（去掉参数）', tempFormUrl)
            this.innerFormData.extendUrlParams = getQueryVariable(res.result.formUrl)
          }
          this.path = tempFormUrl
          // update--end--autor:scott-----date:20191005------for：流程节点配置组件URL的时候也支持传递参数了，解决TASK #3238流程节点无法与online的复制视图对接------

          console.log('获取流程节点信息', this.innerFormData, this.path)
          this.$refs.bindBpm.$refs.taskDealModal.deal(record)
          this.$refs.bindBpm.$refs.taskDealModal.title = '流程历史'
        }
      })
    },
    /**
     * 获取流程状态字段配置
     */
    getBpmStatusColumn() {
      return {
        title: '流程状态',
        align: 'center',
        dataIndex: 'bpmStatus_dictText',
        customRender: (t, r, index) => {
          return r.bpmData ? r.bpmData.taskName : this.$filterMultiDictText(this.dictOptions['bpm_status'], t)
        }
      }
    },
    // /**
    //  * 旧的流程启动方式
    //  */
    // startProcess: function(record) {
    //   var that = this;
    //   this.$confirm({
    //     title: '提示',
    //     content: '确认提交流程吗?',
    //     onOk: function() {
    //       var param = {
    //         flowCode: that.getFlowCode() + that.currentTableName,
    //         id: record.id,
    //         formUrl: 'modules/bpm/task/form/OnlineFormDetail',
    //         formUrlMobile: 'check/onlineForm/detail'
    //       }
    //       postAction(that.url.startProcess, param).then((res) => {
    //         if (res.success) {
    //           that.$message.success(res.message);
    //           that.loadData();
    //           that.onClearSelected();
    //         } else {
    //           that.$message.warning(res.message);
    //         }
    //       });
    //     }
    //   });
    // },
    /**
     * 清空在线表单流程相关配置，在切换表单（路由改变）时触发
     */
    clearOnlineConfig() {
      console.log('清空在线表单流程相关配置')
      this.myTaskList = null
      this.processDefinitionId = null
    },
    /**
     * 获取审批历史、审批进度按钮文本
     * @param record
     * @returns {string|*|string}
     */
    getRealTrackName(record) {
      return record[this.bpmStatusFieldName] === '3' ? (this.buttonAlias.bpm_track || this.trackHisName).replace('进度', '历史') : (this.buttonAlias.bpm_track || this.trackName)
    },
    endMethod() {}
  }
  // online表单监听路由改变时，重置流程相关数据 FIXME 放到 OnlCgformAutoList.vue
  // watch: {
  //   '$route'() {
  //     this.clearOnlineConfig()
  //   }
  // }
}

// 获取URL上参数
function getQueryVariable(url) {
  if (!url) return

  var t
  var n
  var r
  var i = url.split('?')[1]
  var s = {}
  // eslint-disable-next-line no-sequences,no-unused-expressions
  t = i.split('&'),
    r = null,
    n = null
  for (var o in t) {
    var u = t[o].indexOf('=')
    // eslint-disable-next-line no-unused-expressions
    u !== -1 && (r = t[o].substr(0, u),
      n = t[o].substr(u + 1),
      s[r] = n)
  }
  return s
}

/**
 * URL地址
 * @param {*} s
 */
function isURL(s) {
  return /^http[s]?:\/\/.*/.test(s)
}
