<template>
  <div class="j-chat-online" :style="size">
    <iframe :src="src"></iframe>
  </div>
</template>

<script>
  import { randomString } from '@/utils/util'
  import { ACCESS_TOKEN } from '@/store/mutation-types'

  export default {
    name: 'JChat',
    props: {
      // 聊天窗口状态（一般用于调试）
      chatStatus: String
    },
    data() {
      return {
        messageId: randomString('16'),
        chat: '',
        size: { width: '0px', height: '0px' }
      }
    },
    computed: {
      src() {
        let domain = window._CONFIG['domianURL']
        let token = this.$ls.get(ACCESS_TOKEN)

        let url = `${domain}/eoa/im/index`
        url += `?token=${token}&messageId=${this.messageId}`

        return url
      }
    },
    created() {
      const _this = this
      window.addEventListener('message', function (event) {
        let { messageId, type, data } = event.data

        if (`${_this.messageId}` !== messageId) {
          return
        }

        switch (type) {
          // 更改DIV大小事件
          case 'change-size':
            _this.size = data
            break
          // 显示信息
          case 'show-info':
            _this.$message.info(data.message)
            _this.$emit('update:chatStatus', JSON.stringify(data.status))
            break
        }
      }, false)
    }
  }
</script>

<style scoped lang="less">
  .j-chat-online {
    display: block;
    position: fixed;
    bottom: 0;
    right: 0;
    z-index: 21;

    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  }
</style>
