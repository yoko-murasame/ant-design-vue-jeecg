<template>
  <!-- <div v-if="visible" class="j-auto-desform-data-full-screen" :style="{backgroundColor:bgColor}">
    <desform-view
      class="desform-view"
      :mode="mode"
      :desformCode="desformCode"
      :dataId="dataId"
      height="100vh"
      :innerDialog="true"
      @close="close"
      @success="handleSuccess"
      @reload="handleReload"
      :isOnline="isOnline"
    />
  </div> -->

  <j-modal
    :title="title"
    :visible="visible"
    :bodyStyle="{ padding: '50' }"
    :maskClosable="false"
    :destroyOnClose="true"
    :closable="true"
    :keyboard="false"
    :switch-fullscreen="true"
    @cancel="close"
    @ok="handleSuccess"
    class="none-modal-bottom-padding"
    width="60%">
    <template v-if="buttonSwitch.modal_footer" slot="footer">
      <cancel-button
        v-if="buttonSwitch.modal_cancel"
        :disableSubmit="disableSubmit"
        :button-text="buttonAlias.modal_cancel || '取消'"
        key="back"
        @click="close" />
      <a-button type="primary" @click="handleSuccess" v-if="!disableSubmit && buttonSwitch.modal_save">{{ buttonAlias.modal_save || '保存' }}</a-button>
      <a-button
        type="primary"
        @click="saveAndSubmitBPM"
        v-if="!disableSubmit && buttonSwitch.bpm && buttonSwitch.modal_submit && hasBpmStatus">
        {{ buttonAlias.modal_submit || '保存并提交流程' }}
      </a-button>
    </template>
    <desform-view
      class="desform-view"
      :parent="parent"
      :mode="mode"
      :desformCode="desformCode"
      :dataId="dataId"
      :onlineTableId="tableId"
      height="100vh"
      :innerDialog="true"
      @reload="handleReload"
      :isOnline="isOnline"
      :newDefaultData="newDefaultData"
      ref="desform" />
  </j-modal>
</template>

<script>
import DesformView from '@/components/online/desform/DesformView'

export default {
  name: 'AutoDesformDataFullScreen',
  components: { DesformView },
  props: {
    // 按钮显示控制
    buttonSwitch: {
      type: Object,
      required: false,
      default() {
        return {
          bpm: false,
          // 表单按钮控制，默认开放
          modal_footer: true,
          modal_save: true,
          modal_submit: true,
          modal_cancel: true
        }
      }
    },
    // 按钮别名
    buttonAlias: {
      type: Object,
      required: false,
      default() {
        return {}
      }
    },
    hasBpmStatus: {
      type: Boolean,
      default: false
    },
    // 默认数据,优先级较高
    defaultData: {
      type: Object,
      default() {
        return {}
      }
    },
    // 父列表组件
    parent: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      mode: 'add',
      title: '操作',
      visible: false,
      desformCode: null,
      dataId: null,
      bodyOverflow: null,
      bgColor: 'rgba(0,0,0,0.6)',
      isOnline: false,
      tableId: '',
      newDefaultData: {}
    }
  },
  computed: {
    disableSubmit() {
      return this.mode === 'detail'
    }
  },
  methods: {
    /** 开启表单 */
    open(mode, desformCode, dataId, title, isOnline, tableId, newDefaultData) {
      this.isOnline = isOnline
      this.mode = mode
      this.title = title
      this.dataId = dataId
      this.desformCode = desformCode
      this.tableId = tableId
      this.newDefaultData = Object.assign(this.newDefaultData, newDefaultData, this.defaultData)
      this.visible = true
      // 禁止body滚动，防止滚动穿透
      // this.bodyOverflow = document.body.style.overflow
      // document.body.style.overflow = 'hidden'
    },
    /** 开始关闭动画 */
    close() {
      this.bgColor = 'rgba(0,0,0,0)'
      setTimeout(() => {
        this.closed()
      }, 150)
    },
    /** 完全关闭，并初始化所有的字段 */
    async closed() {
      // 执行表单关闭钩子
      if (this.$refs.desform && this.$refs.desform.$refs.kfb) {
        await this.$refs.desform.$refs.kfb.beforeModalClose()
      }
      this.visible = false
      this.$emit('close')
      this.bgColor = 'rgba(0,0,0,0.6)'
      // 恢复body的滚动
      // document.body.style.overflow = this.bodyOverflow
      // this.bodyOverflow = null
    },
    async handleSuccess() {
      const data = await this.$refs.desform.saveAllData()
      // this.$refs.desform.handleGetData()
      this.$emit('ok', data)
      this.close()
    },
    handleReload() {
      this.$emit('ok')
    },
    saveAndSubmitBPM() {
      return new Promise(async (resolve, reject) => {
        try {
          const data = await this.$refs.desform.saveAndSubmitBPM(true)
          this.$emit('saveAndSubmitBPM', data)
          resolve(data)
        } catch (e) {
          // TODO 自己处理下错误
          // reject(e)
        }
      })
    }
  },
  watch: {
    defaultData: {
      immediate: true,
      handler(val) {
        this.newDefaultData = Object.assign(this.newDefaultData, val)
      }
    }
  }
}
</script>
<style lang="less">
@import '~@assets/less/modal-common.less';
</style>
<style lang="less" scoped>
.j-auto-desform-data-full-screen {
  position: fixed;
  z-index: 999;
  transition: background-color 150ms;

  &,
  .desform-view {
    top: 0;
    left: 0;
    width: 80%;
    height: 100%;
  }

  .desform-view {
    position: absolute;
  }

}
</style>
