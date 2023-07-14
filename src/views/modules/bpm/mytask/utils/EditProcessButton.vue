<template>
  <div style="display: inline-block">
    <template v-if="type === 'a'">
      <template v-if="canEdit === '2'">
        <a v-bind="$attrs" v-on="$listeners" @click="handleProcess">{{ processText }}</a>
      </template>
      <template v-if="canEdit === '1'">
        <a-tooltip>
          <template slot="title">
            <div>编辑权限到期时间</div>
            <div>{{ editApply.expireTime }}</div>
            <div class="edit-process-track" @click="handleProcess">查看授权记录</div>
          </template>
          <a v-bind="$attrs" v-on="$listeners" @click="handleEdit">{{ editText }}</a>
        </a-tooltip>
      </template>
      <template v-if="canEdit === '0'">
        <a v-bind="$attrs" v-on="$listeners" @click="handleApply">{{ applyText }}</a>
      </template>
    </template>
    <template v-if="type === 'a-button'">
      <template v-if="canEdit === '2'">
        <a-button v-bind="$attrs" v-on="$listeners" @click="handleProcess">{{ processText }}</a-button>
      </template>
      <template v-if="canEdit === '1'">
        <a-tooltip>
          <template slot="title">
            <div>编辑权限到期时间</div>
            <div>{{ editApply.expireTime }}</div>
            <div class="edit-process-track" @click="handleProcess">查看授权记录</div>
          </template>
          <a-button v-bind="$attrs" v-on="$listeners" @click="handleEdit">{{ editText }}</a-button>
        </a-tooltip>
      </template>
      <template v-if="canEdit === '0'">
        <a-button v-bind="$attrs" v-on="$listeners" @click="handleApply">{{ applyText }}</a-button>
      </template>
    </template>
    <template v-if="type === 'a-menu-item'">
      <template v-if="canEdit === '2'">
        <a class="a-menu-item-a" v-bind="$attrs" v-on="$listeners" @click="handleProcess">{{ processText }}</a>
      </template>
      <template v-if="canEdit === '1'">
        <a-tooltip>
          <template slot="title">
            <div>编辑权限到期时间</div>
            <div>{{ editApply.expireTime }}</div>
            <div class="edit-process-track" @click="handleProcess">查看授权记录</div>
          </template>
          <a class="a-menu-item-a" v-bind="$attrs" v-on="$listeners" @click="handleEdit">{{ editText }}</a>
        </a-tooltip>
      </template>
      <template v-if="canEdit === '0'">
        <a class="a-menu-item-a" v-bind="$attrs" v-on="$listeners" @click="handleApply">{{ applyText }}</a>
      </template>
    </template>
  </div>
</template>

<script>
import { postAction } from '@/api/manage';
import { debounce } from 'lodash';

export default {
  name: 'EditProcessButton',
  mixins: [],
  props: {
    /**
     * 类型如下： <br/>
     * 1.a：标签a <br/>
     * 2.a-button：组件a-button <br/>
     * 3.a-menu-item：组件a-menu-item中的a标签
     */
    type: {
      type: String,
      required: false,
      default: 'a'
    },
    /**
     * canEdit，类型为字符串，取值： <br/>
     * 1.不可编辑 0 <br/>
     * 2.可以编辑 1 <br/>
     * 3.流程中 2
     */
    params: {
      type: Object,
      required: false,
      default: () => ({
        record: { id: '' },
        id: '',
        bpmTitle: '',
        canEdit: '0',
        bpmFlowCode: '',
        bpmFormUrl: '',
        bpmFormApi: ''
      })
    },
    editText: {
      type: String,
      required: false,
      default: '编辑(已授权)'
    },
    applyText: {
      type: String,
      required: false,
      default: '申请编辑'
    },
    processText: {
      type: String,
      required: false,
      default: '申请编辑进度'
    }
  },
  components: {},
  data() {
    return {
      url: {
        startProcess: '/act/process/extActProcess/startMutilProcess',
        getAndInit: '/workflow/editapply/getAndInit',
        edit: '/workflow/editapply/edit'
      },
      editApplyBpmFlowCode: 'dev_deal_service_edit_apply_001',
      canEdit: false,
      editApply: null
    }
  },
  computed: {
    disabled() {
      return false;
    }
  },
  methods: {
    /**
     * 提交申请流程
     * 列表页需要处理@apply事件（比如刷新列表）
     */
    handleApply() {
      console.log('handleApply', this.params);
      const that = this;
      this.$confirm({
        title: '提示',
        content: '申请编辑权限需要提交审批流程，确认申请吗?',
        okText: '确认',
        okType: 'danger',
        onOk: async () => {
          const param = {
            flowCode: that.editApplyBpmFlowCode,
            id: that.editApply.id,
            formUrl: that.editApply.bpmFormUrl
          };
          const { success, message } = await postAction(that.url.startProcess, param);
          if (success) {
            that.$message.success('编辑权限申请流程发起成功！');
            // 更新状态
            that.editApply = {
              ...that.editApply,
              canEdit: '2',
              bpmStatus: '2'
            };
            that.canEdit = '2';
            await postAction(that.url.edit, that.editApply);
          } else {
            that.$message.warning(message);
          }
          that.$emit('apply', that.params);
        }
      });
      // this.canEdit = '2';
      // TODO 先发起申请修改流程，然后可能需要作废原有业务流程
      // this.$emit('apply', this.params);
    },
    handleEdit() {
      console.log('handleEdit', this.params.record);
      this.$emit('edit', this.params.record);
    },
    /**
     * 编辑权限审批进度-流程跟踪
     */
    handleProcess() {
      const trackParam = { flowCode: this.editApplyBpmFlowCode, dataId: this.editApply.id };
      this.$emit('process', trackParam);
      console.log('handleProcess', this.params, trackParam);
    },
    /**
     * 初始化编辑按钮状态数据
     * 后端接口数据默认缓存24H
     * @param params
     */
    initEditApply(params) {
      if (!params || !Object.keys(params)) {
        return;
      }
      postAction(this.url.getAndInit, params).then(({ result, success, message }) => {
        if (success) {
          this.editApply = result;
          this.canEdit = result.canEdit;
        } else {
          this.$message.error(message);
          this.canEdit = '0';
        }
      });
    }
  },
  watch: {
    params: {
      immediate: true,
      deep: false,
      handler(newVal) {
        this.initEditApply(newVal);
      }
    }
  },
  created() {
    if (!this.editApplyBpmFlowCode) {
      console.error('未配置权限申请流程');
    } else {
      console.log('当前绑定的权限申请流程code:', this.editApplyBpmFlowCode);
    }
    this.initEditApply = debounce(this.initEditApply, 200);
  }
}
</script>

<style lang="less" scoped>
  .a-menu-item-a {
    text-underline: none;
    color: inherit;
  }
  .edit-process-track {
    color: #02b379;
    font-weight: inherit;
    &:hover {
      cursor: pointer;
    }
  }
</style>
