<template>
  <!--PDF预览-->
  <j-modal
    :visible="pdfVisible"
    :switchFullscreen="false"
    :maskClosable="false"
    :title="title"
    ok-text=""
    :cancel-text="closeText"
    @cancel="onPdfClose"
    @ok="onPdfClose"
    width="70vw">
    <template slot="footer">
      <cancel-button :disableSubmit="true" key="back" @click="onPdfClose" />
    </template>
    <vue-pdf-app v-if="pdf" style="height: 80vh" :config="config" :pdf="pdf"></vue-pdf-app>
  </j-modal>
</template>

<script>
import { USER_AUTH } from '@/store/mutation-types'
import VuePdfApp from "vue-pdf-app"
import 'vue-pdf-app/dist/icons/main.css';

/**
 * VUE PDF 预览组件
 */
export default {
  name: 'VuePdfAppModal',
  components: { VuePdfApp },
  props: {
    // 下载权限，配置按钮权限code, 多个用逗号分隔
    downloadPermission: {
      type: String,
      require: false,
      default: ''
    },
    pdf: {
      type: String,
      require: false,
      default: ''
    },
    closeText: {
      type: String,
      require: false,
      default: '关闭'
    },
    title: {
      type: String,
      require: false,
      default: 'PDF预览'
    }
  },
  data () {
    return {
      pdfVisible: false,
      // 配置参数
      config: {
        sidebar: {
          viewThumbnail: true,
          viewOutline: true,
          viewAttachments: true,
        },
        secondaryToolbar: {
          secondaryPresentationMode: false,
          secondaryOpenFile: false,
          secondaryPrint: false,
          secondaryDownload: false,
          secondaryViewBookmark: false,
          firstPage: false,
          lastPage: false,
          pageRotateCw: false,
          pageRotateCcw: false,
          cursorSelectTool: false,
          cursorHandTool: true,
          scrollVertical: false,
          scrollHorizontal: false,
          scrollWrapped: false,
          spreadNone: false,
          spreadOdd: false,
          spreadEven: false,
          documentProperties: false,
        },
        toolbar: {
          toolbarViewerLeft: {
            findbar: false,
            previous: true,
            next: true,
            pageNumber: true,
          },
          toolbarViewerRight: {
            presentationMode: true,
            openFile: false,
            print: false,
            download: true,
            viewBookmark: false,
          },
          toolbarViewerMiddle: {
            zoomOut: true,
            zoomIn: true,
            scaleSelectContainer: true,
          },
        },
        errorWrapper: true,
      }
    }
  },
  watch: {
    pdf: {
      handler (val) {
        if (!val) {
          return
        }
        this.checkPermissions()
        // this.config.secondaryToolbar = false
        this.pdfVisible = true
      },
      immediate: true
    }
  },
  methods: {
    onPdfClose() {
      this.pdfVisible = false
      this.$emit('update:pdf', '')
      this.$emit('update:title', '')
    },
    checkPermissions() {
      if (!this.downloadPermission) {
        return
      }
      const permissions = this.downloadPermission.split(',')
      let authList = JSON.parse(sessionStorage.getItem(USER_AUTH) || '[]')
      for (let auth of authList) {
        if (permissions.includes(auth.action)) {
          this.config.toolbar.toolbarViewerRight.download = true
          console.log('--------VuePdfAppModal--下载权限放行--------')
          return
        }
      }
      this.config.toolbar.toolbarViewerRight.download = false
      console.log('--------VuePdfAppModal--禁用下载--------')
    }
  }
}
</script>
<style scoped lang="less">
/deep/ .ant-modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: none !important;
}
/deep/ .ant-modal-body {
  padding: 0;
  /* 这将改变整个页面滚动条的宽度 */
  ::-webkit-scrollbar {
    width: 1.5vh;  /* 对于垂直滚动条来说，你可以设置更大的值 */
    height: 1.5vh;
  }
}

</style>
