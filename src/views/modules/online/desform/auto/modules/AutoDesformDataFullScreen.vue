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
    width="60%">
    <template slot="footer">
      <cancel-button :disableSubmit="disableSubmit" key="back" @click="close" />
      <a-button type="primary" @click="handleSuccess" v-if="!disableSubmit">保存</a-button>
      <a-button type="primary" @click="saveAndSubmitBPM" v-if="!disableSubmit && buttonSwitch.bpm&&hasBpmStatus">保存并提交流程</a-button>
    </template>
    <desform-view
      class="desform-view"
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
  props: ['buttonSwitch', 'hasBpmStatus'],
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
      this.newDefaultData = newDefaultData
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
    closed() {
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
    buttonSwitch: {
        immediate: true,
        handler(val) {
          console.log('buttonSwitch', val)
        }
      }
  }
}
</script>

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
