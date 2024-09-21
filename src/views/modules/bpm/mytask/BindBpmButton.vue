<template>
  <div style="display: inline-block">
    <a-divider v-if="verticalLineFirst" type="vertical" />
    <!--审批进度 BEGIN-->
    <div style="display: inline-block" v-if="formData.bpmStatus && formData.bpmStatus !== '1' && formData.bpmStatus !== 1 && trackCondition">
      <a @click="handleTrack">{{ trackName }}</a>
      <a-divider type="vertical" />
    </div>
    <!--审批进度 END-->
    <!--办理功能 BEGIN-->
    <div style="display: inline-block" v-if="formData.bpmStatus === '2' && formData.bpmData">
      <template v-if="(formData.bpmData.taskAssigneeName || '').trim()">
        <a @click="handleProcess">
          办理
        </a>
        <!--<a-divider type="vertical" />-->
        <!--<a @click="selectEntruster(record)">委托</a>-->
      </template>
      <template v-else>
        <a @click="handleClaim" >签收</a>
      </template>
      <a-divider type="vertical" />
    </div>
    <!--办理功能 END-->
    <!--流程提交 BEGIN-->
    <div style="display: inline-block" v-if="formData.bpmStatus === '1' || formData.bpmStatus === 1">
      <template v-if="fullPermission || (limitCreatorCanSubmit ? formData.createBy === $store.getters.userInfo.username : true)">
        <a @click="startProcess">{{ startButtonText }}</a>
        <!--<a-popconfirm title="确定要提交流程吗?" @confirm="startProcess">-->
        <!--  <a>提交流程</a>-->
        <!--</a-popconfirm>-->
        <a-divider type="vertical" v-if="showMore" />
      </template>
    </div>
    <!--流程提交 END-->
    <!--更多扩展按钮(slot传入+管理员运维) BEGIN-->
    <div style="display: inline-block" v-if="showMore">
      <a-dropdown>
        <a class="ant-dropdown-link">更多 <a-icon type="down"/></a>
        <a-menu slot="overlay">
          <slot name="more">
            <a-menu-item class="empty">——</a-menu-item>
          </slot>
          <template v-if="fullPermission || (limitCreatorCanSubmit ? formData.createBy === $store.getters.userInfo.username : true)">
            <slot name="more-auth">
              <a-menu-item class="empty">——</a-menu-item>
            </slot>
          </template>
          <a-menu-item v-if="formData.bpmStatus === '2' && formData.bpmData && formData.bpmData.taskAssigneeName">
            <a-popconfirm title="确定要委托给别人处理吗?" @confirm="selectEntruster">
              <a>委托</a>
            </a-popconfirm>
          </a-menu-item>
          <a-menu-item v-has="adminAuth">
            <a @click="handleEdit">编辑(管理员)</a>
          </a-menu-item>
          <a-menu-item v-has="adminAuth">
            <a-popconfirm title="确定要删除吗?" @confirm="handleDelete">
              <a>删除(管理员)</a>
            </a-popconfirm>
          </a-menu-item>
          <a-menu-item v-has="adminAuth" v-if="formData.bpmStatus === '2' ">
            <a-popconfirm title="确定要完成流程吗?" @confirm="finishProcess">
              <a>完成流程</a>
            </a-popconfirm>
          </a-menu-item>
          <a-menu-item v-has="adminAuth" v-if="formData.bpmStatus === '2' ">
            <a-popconfirm title="确定要取回流程吗?" @confirm="callBackProcess">
              <a>取回流程</a>
            </a-popconfirm>
          </a-menu-item>
          <!--额外功能-编辑权限申请流程-->
          <a-menu-item v-if="editAuthFeature && formData.bpmStatus !== '1'">
            <EditProcessButton
              :type="'a-menu-item'"
              :params="getEditParams()"
              @process="editProcessTrack"
              @edit="handleEdit"
              @apply="loadData"></EditProcessButton>
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
    <!--更多扩展按钮(slot传入+管理员运维) END-->
    <a-divider v-if="verticalLineLast" type="vertical" />
  </div>
</template>

<script>
import EditProcessButton from '@views/modules/bpm/mytask/utils/EditProcessButton'

export default {
  name: 'BindBpmButton',
  components: { EditProcessButton },
  props: {
    parent: {
      type: Object,
      default: () => (undefined),
      required: false
    },
    formData: {
      type: Object,
      required: true,
      default: () => ({ id: '-1', bpmStatus: '2', bpmData: {} })
    },
    trackName: {
      type: String,
      default: '审批进度'
    },
    trackCondition: {
      type: [String, Boolean],
      default: true
    },
    verticalLineFirst: {
      type: [Boolean, String],
      default: true
    },
    verticalLineLast: {
      type: [Boolean, String],
      default: false
    },
    editAuthFeature: {
      type: [Boolean, String],
      required: false,
      default: false
    },
    /**
     * 只有创建人可以发起流程
     */
    limitCreatorCanSubmit: {
      type: [Boolean, String],
      required: false,
      default: true
    },
    showMore: {
      type: [Boolean, String],
      required: false,
      default: true
    },
    fullPermission: {
      type: [Boolean, String],
      required: false,
      default: false
    },
    adminAuth: {
      type: [String, Array],
      required: false,
      default: 'admin:delete'
    },
    startButtonText: {
      type: String,
      default: '提交流程'
    }
  },
  methods: {
    loadData() {
      this.parent && this.parent.loadData && this.parent.loadData(1)
      !this.parent && this.$emit('loadData', 1)
    },
    handleTrack() {
      const formData = this.formData
      this.parent && this.parent.handleTrack && this.parent.handleTrack(formData)
      !this.parent && this.$emit('handleTrack', formData)
    },
    handleProcess() {
      const formData = this.formData
      this.parent && this.parent.handleProcess && this.parent.handleProcess(formData)
      !this.parent && this.$emit('handleProcess', formData)
    },
    editProcessTrack(params) {
      this.parent && this.parent.editProcessTrack && this.parent.editProcessTrack(params)
      !this.parent && this.$emit('editProcessTrack', params)
    },
    handleClaim() {
      const formData = this.formData
      this.parent && this.parent.handleClaim && this.parent.handleClaim(formData)
      !this.parent && this.$emit('handleClaim', formData)
    },
    startProcess() {
      const formData = this.formData
      this.parent && this.parent.startProcess && this.parent.startProcess(formData, false, this.startButtonText)
      !this.parent && this.$emit('startProcess', formData, false, this.startButtonText)
    },
    selectEntruster() {
      const formData = this.formData
      this.parent && this.parent.selectEntruster && this.parent.selectEntruster(formData)
      !this.parent && this.$emit('selectEntruster', formData)
    },
    handleEdit() {
      const formData = this.formData
      this.parent && this.parent.handleEdit && this.parent.handleEdit(formData)
      !this.parent && this.$emit('handleEdit', formData)
    },
    handleDelete() {
      const formData = this.formData
      this.parent && this.parent.handleDelete && this.parent.handleDelete(formData.id)
      !this.parent && this.$emit('handleDelete', formData)
    },
    finishProcess() {
      const formData = this.formData
      this.parent && this.parent.finishProcess && this.parent.finishProcess(formData)
      !this.parent && this.$emit('finishProcess', formData)
    },
    callBackProcess() {
      const formData = this.formData
      this.parent && this.parent.callBackProcess && this.parent.callBackProcess(formData)
      !this.parent && this.$emit('callBackProcess', formData)
    },
    getEditParams() {
      const formData = this.formData
      let res = this.parent && this.parent.getEditParams && this.parent.getEditParams(formData)
      !this.parent && console.error('未绑定父类实例，无法调用getEditParams()')
      res = res || {}
      return res
    }
  }
}
</script>
<style lang="less" scoped>
  /** Button按钮间距 */
  .ant-btn {
    margin-left: 3px
  }
  .empty {
    cursor: not-allowed;
    //pointer-events: none;
  }
</style>
