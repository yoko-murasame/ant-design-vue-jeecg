<template>
  <j-modal
    :maskClosable="false"
    :title="title"
    :width="width"
    :visible="visible"
    switchFullscreen
    @ok="handleOk"
    :okButtonProps="{ class:{'jee-hidden': disableSubmit} }"
    @cancel="handleCancel"
    cancelText="关闭">
    <template slot="footer">
      <!--<cancel-button :disableSubmit="disableSubmit" key="back" @click="handleCancel"/>-->
      <a-button type="primary" @click="handleOk">关闭</a-button>
    </template>
    <vue-aliplayer-v2
      v-if="visible"
      :source="videos[0]"
      ref="VueAliplayerV2"
      :options="videoProps"/>
  </j-modal>
</template>

<script>

export default {
  name: 'SakugaVideoModal',
  components: {},
  data () {
    return {
      title: '',
      width: 1000,
      visible: false,
      disableSubmit: false,
      videos: ['https://index-sakuga.oss-cn-hangzhou.aliyuncs.com/indexsakuga/video/202305/newvideo-we28h_1683454588628.mp4'],
      videoProps: {
        height: '60vh',
        // source:'//player.alicdn.com/video/aliyunmedia.mp4',
        isLive: false // 切换为直播流的时候必填
        // format: 'm3u8'  //切换为直播流的时候必填
      }
    }
  },
  methods: {
    show () {
      this.visible = true
    },
    handleOk () {
      this.visible = false;
    },
    handleCancel () {
      this.visible = false;
    }
  }
}
</script>
<style lang="less" scoped>
/deep/ .ant-modal-body {
  position: relative;
}
</style>
