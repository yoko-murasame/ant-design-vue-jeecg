<template>
  <div :id="containerId" style="position: relative">

    <!--  ---------------------------- begin 图片左右换位置 ------------------------------------- -->
    <div class="movety-container" :style="{top:top+'px',left:left+'px',display:moveDisplay}" style="padding:0 8px;position: absolute;z-index: 91;height: 32px;width: 104px;text-align: center;">
      <div :id="containerId+'-mover'" :class="showMoverTask?'uploadty-mover-mask':'movety-opt'" style="margin-top: 12px">
        <a @click="moveLast" style="margin: 0 5px;"><a-icon type="arrow-left" style="color: #fff;font-size: 16px"/></a>
        <a @click="moveNext" style="margin: 0 5px;"><a-icon type="arrow-right" style="color: #fff;font-size: 16px"/></a>
      </div>
    </div>
    <!--  ---------------------------- end 图片左右换位置 ------------------------------------- -->

    <a-upload
      :name="knowledgePath ? 'multipartFiles' : 'file'"
      :multiple="multiple"
      :accept="acceptType"
      :action="knowledgePath ? knowledgeUploadAction : (customUploadAction || uploadAction)"
      :headers="headers"
      :data="{'biz':bizPath,'folderId': knowledgeFolder && knowledgeFolder.id}"
      :fileList="fileList"
      :beforeUpload="doBeforeUpload"
      @change="handleChange"
      :disabled="knowledgePath ? (!knowledgeFolder || disabled) : disabled"
      :returnUrl="returnUrl"
      :listType="complistType"
      @preview="handlePreview"
      :transform-file="transformFile"
      :class="{'uploadty-disabled':disabled}">
      <template>
        <div v-if="isImageComp">
          <template>
            <a-icon type="plus" />
            <div class="ant-upload-text">{{ text }}</div>
          </template>
          <template v-if="knowledgePath && knowledgeFolder">
            <div @click.prevent.stop="openTagsDialog()" class="ant-upload-text knowledge-pic"><a-icon type="read" style="margin-right: .2vh" />{{ '知识库' }}</div>
          </template>
        </div>
        <template v-else-if="buttonVisible">
          <template v-if="knowledgePath && knowledgeFolder">
            <a-dropdown-button placement="topRight">
              <a-icon type="upload" />
              {{ text }}
              <a-menu slot="overlay" @click="openTagsDialog()">
                <a-menu-item key="1"><a-icon type="read" />知识库</a-menu-item>
              </a-menu>
              <a-icon slot="icon" type="more" />
            </a-dropdown-button>
          </template>
          <a-button v-else>
            <a-icon type="upload" />{{ text }}
          </a-button>
        </template>
        <div v-if="!buttonVisible && !fileList.length" style="padding: 4px 11px">
          暂无数据
        </div>
      </template>
    </a-upload>
    <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
    <file-list-modal v-if="knowledgePath" ref="fileListModal"></file-list-modal>
  </div>
</template>

<script>

  import Vue from 'vue'
  import { ACCESS_TOKEN } from '@/store/mutation-types'
  import { getFileAccessHttpUrl, postAction } from '@/api/manage'
  import ImageZipCompressMixin, {
    FILE_TYPE_ALL,
    FILE_TYPE_IMG,
    FILE_TYPE_VIDEO
  } from '@/components/yoko/mixins/ImageZipCompressMixin'
  import FileListModal from '@views/modules/knowledge/modules/FileListModal'
  import { debounce } from 'lodash'

  const uidGenerator = () => {
    return '-' + parseInt(Math.random() * 10000 + 1, 10)
  }
  const getFileName = (path) => {
    if (path.lastIndexOf('\\') >= 0) {
      let reg = new RegExp('\\\\', 'g')
      path = path.replace(reg, '/')
    }
    return path.substring(path.lastIndexOf('/') + 1)
  }
  export default {
    name: 'JUploadKnowledge',
    components: { FileListModal},
    mixins: [ImageZipCompressMixin],
    data() {
      return {
        uploadAction: window._CONFIG['domianURL'] + '/sys/common/upload',
        knowledgeUploadAction: window._CONFIG['domianURL'] + '/technical/file/upload',
        checkKnowledgePathUrl: window._CONFIG['domianURL'] + '/technical/folder/queryTreeLastNodeByFolderTreeNames',
        knowledgeFolder: null,
        headers: {},
        fileList: [],
        newFileList: [],
        uploadGoOn: true,
        previewVisible: false,
        // ---------------------------- begin 图片左右换位置 -------------------------------------
        previewImage: '',
        containerId: '',
        top: '',
        left: '',
        moveDisplay: 'none',
        showMoverTask: false,
        moverHold: false,
        currentImg: ''
        // ---------------------------- end 图片左右换位置 -------------------------------------
      }
    },
    props: {
      /**
       * 知识库存储路径 例如：技术,技术文档,高科技
       */
      knowledgePath: {
        type: String,
        required: false,
        default: ''
      },
      /**
       * 是否打开标签管理弹窗
       */
      showTagsDialog: {
        type: Boolean,
        required: false,
        default: true
      },
      acceptType: {
        type: String,
        required: false,
        default: '*'
      },
      text: {
        type: String,
        required: false,
        default: '点击上传'
      },
      fileType: {
        type: String,
        required: false,
        default: FILE_TYPE_ALL
      },
      /* 这个属性用于控制文件上传的业务路径 */
      bizPath: {
        type: String,
        required: false,
        default: 'temp'
      },
      value: {
        type: [String, Array],
        required: false
      },
      // update-begin- --- author:wangshuai ------ date:20190929 ---- for:Jupload组件增加是否能够点击
      disabled: {
        type: Boolean,
        required: false,
        default: false
      },
      // update-end- --- author:wangshuai ------ date:20190929 ---- for:Jupload组件增加是否能够点击
      // 此属性被废弃了
      triggerChange: {
        type: Boolean,
        required: false,
        default: false
      },
      /**
       * update -- author:lvdandan -- date:20190219 -- for:Jupload组件增加是否返回url，
       * true：仅返回url
       * false：返回fileName filePath fileSize
       */
      returnUrl: {
        type: Boolean,
        required: false,
        default: true
      },
      number: {
        type: Number,
        required: false,
        default: 0
      },
      buttonVisible: {
        type: Boolean,
        required: false,
        default: true
      },
      multiple: {
        type: Boolean,
        default: true
      },
      beforeUpload: {
        type: Function
      },
      /**
       * 自定义文件分割符，默认,
       */
      splitChar: {
        type: String,
        default: ','
      },
      /**
       * 业务主键
       */
      businessId: {
        type: String,
        default: ''
      },
      /**
       * 项目主键
       */
      projectId: {
        type: String,
        default: ''
      },
      /**
       * 当关联知识库路径不存在时，是否自动初始化
       */
      knowledgePathAutoInit: {
        type: [String, Boolean],
        default: false
      }
    },
    watch: {
      value: {
        immediate: true,
        handler() {
          let val = this.value
          if (val instanceof Array) {
            if (this.returnUrl) {
              this.initFileList(val.join(this.splitChar))
            } else {
              this.initFileListArr(val)
            }
          } else {
            this.initFileList(val)
          }
        }
      }
    },
    async created() {
      const token = Vue.ls.get(ACCESS_TOKEN)
      await this.checkKnowledgePath()
      this.openTagsDialog = debounce(this.openTagsDialog, 300)
      // ---------------------------- begin 图片左右换位置 -------------------------------------
      this.headers = { 'X-Access-Token': token }
      this.containerId = 'container-ty-' + new Date().getTime()
      // ---------------------------- end 图片左右换位置 -------------------------------------
    },

    methods: {
      openTagsDialog(ids = [], flag = true) {
        if (!flag) {
          return
        }
        if (!this.knowledgePath || !this.knowledgeFolder) {
          return
        }
        if (this.fileList.filter(item => item.status !== 'done').length) {
          console.log('openTagsDialog::等待多文件列表完成', this.fileList)
          return
        }
        let param
        // 直接打开关联知识库列表，根据当前包含的文件名筛选
        if (!ids.length) {
          param = {
            folderId: this.knowledgeFolder.id,
            name: this.returnUrl ? this.value : null,
            names: this.returnUrl ? null : this.newFileList.map(e => e.fileName)
          }
          this.$refs.fileListModal.show(param)
          return
        }
        // 新上传的文件
        if (this.showTagsDialog) {
          param = {
            folderId: this.knowledgeFolder.id,
            ids: ids
          }
          const that = this
          this.$confirm({
            title: '提示',
            content: '文件已上传至知识库，是否前往标签管理？',
            okText: '确定',
            cancelText: '取消',
            onOk: () => that.$refs.fileListModal.show(param)
          })
        }
      },
      /**
       * 如果配置了知识库路径，则需要检查知识库路径是否存在
       */
      async checkKnowledgePath() {
        if (this.knowledgePath) {
          const { success, result, message } = await postAction(this.checkKnowledgePathUrl, {
            folderTreeNames: this.knowledgePath,
            businessId: this.businessId,
            projectId: this.projectId,
            initialFolderTreeNamesIfNotExist: !!this.knowledgePathAutoInit,
            type: 'DOCUMENT'
          })
          const errMsg = '知识库路径不存在，请重新配置'
          if (success) {
            if (result && result.length > 0) {
              this.knowledgeFolder = result[0]
            } else {
              this.$message.error(errMsg)
              throw new Error(errMsg)
            }
          } else {
            this.$message.error(message)
            throw new Error(message)
          }
        }
      },
      initFileListArr(val) {
        if (!val || val.length == 0) {
          this.fileList = []
          return
        }
        let fileList = []
        for (var a = 0; a < val.length; a++) {
          let url = getFileAccessHttpUrl(val[a].filePath)
          fileList.push({
            uid: uidGenerator(),
            name: val[a].fileName,
            status: 'done',
            url: url,
            response: {
              status: 'history',
              message: val[a].filePath
            }
          })
        }
        this.fileList = fileList
      },
      initFileList(paths) {
        if (!paths || paths.length == 0) {
          // return [];
          // update-begin- --- author:os_chengtgen ------ date:20190729 ---- for:issues:326,Jupload组件初始化bug
          this.fileList = []
          return
          // update-end- --- author:os_chengtgen ------ date:20190729 ---- for:issues:326,Jupload组件初始化bug
        }
        let fileList = []
        let arr = paths.split(this.splitChar)
        for (var a = 0; a < arr.length; a++) {
          let url = getFileAccessHttpUrl(arr[a])
          fileList.push({
            uid: uidGenerator(),
            name: getFileName(arr[a]),
            status: 'done',
            url: url,
            response: {
              status: 'history',
              message: arr[a]
            }
          })
        }
        this.fileList = fileList
      },
      handlePathChange(info) {
        let uploadFiles = this.fileList
        let path = ''
        if (!uploadFiles || uploadFiles.length == 0) {
          path = ''
        }
        let arr = []
        let ids = []


        for (var a = 0; a < uploadFiles.length; a++) {
          // update-begin-author:lvdandan date:20200603 for:【TESTA-514】【开源issue】多个文件同时上传时，控制台报错
          if (uploadFiles[a].status === 'done') {
            let filePath
            if (this.knowledgePath && this.knowledgeFolder && uploadFiles[a].response.result) {
              const { id, ossFile } = uploadFiles[a].response.result[0]
              filePath = ossFile.url
              ids.push(id)
            } else {
              filePath = uploadFiles[a].response.message
            }
            arr.push(filePath)
          } else {
            return
          }
          // update-end-author:lvdandan date:20200603 for:【TESTA-514】【开源issue】多个文件同时上传时，控制台报错
        }
        if (arr.length > 0) {
          path = arr.join(this.splitChar)
        }
        this.$emit('change', path)
        this.openTagsDialog(ids, info.file.status === 'done')
        console.log('handlePathChange', path, ids, uploadFiles)
      },
      doBeforeUpload(file) {
        this.uploadGoOn = true
        var fileType = file.type
        if (this.fileType === FILE_TYPE_IMG) {
          if (fileType.indexOf('image') < 0) {
            this.$message.warning('请上传图片')
            this.uploadGoOn = false
            return false
          }
        }
        // 扩展 beforeUpload 验证
        if (typeof this.beforeUpload === 'function') {
          return this.beforeUpload(file)
        }
        return true
      },
      handleChange(info) {
        console.log('--文件列表改变--')
        if (!info.file.status && this.uploadGoOn === false) {
          info.fileList.pop()
        }
        let fileList = info.fileList
        if (info.file.status === 'done') {
          if (this.number > 0) {
            fileList = fileList.slice(-this.number)
          }
          let newTarget
          if (info.file.response.success) {
            fileList = fileList.map((file) => {
              if (file.response) {
                let reUrl
                if (this.knowledgePath && this.knowledgeFolder && file.response.result) {
                  reUrl = file.response.result[0].ossFile.url
                } else {
                  reUrl = file.response.message
                }
                file.url = getFileAccessHttpUrl(reUrl)
              }
              if (info.file.uid === file.uid) {
                newTarget = file
              }
              return file
            })
            // 去重，链接相同的都是一个文件，放到末尾
            const filterArr = fileList.filter(item => item.url !== newTarget.url)
            filterArr.push(newTarget)
            info.fileList = fileList = filterArr
          }
          // this.$message.success(`${info.file.name} 上传成功!`);
        } else if (info.file.status === 'error') {
          this.$message.error(`${info.file.name} 上传失败.`)
        } else if (info.file.status === 'removed') {
          this.handleDelete(info.file)
        }
        this.fileList = fileList
        if (info.file.status === 'done' || info.file.status === 'removed') {
          // returnUrl为true时仅返回文件路径
          if (this.returnUrl) {
            this.handlePathChange(info)
          } else {
            // returnUrl为false时返回文件名称、文件路径及文件大小
            this.newFileList = []
            let ids = []
            for (var a = 0; a < fileList.length; a++) {
              // update-begin-author:lvdandan date:20200603 for:【TESTA-514】【开源issue】多个文件同时上传时，控制台报错
              if (fileList[a].status === 'done') {
                let fileJson
                if (this.knowledgePath && this.knowledgeFolder && fileList[a].response.result) {
                  const { id, name, ossFile } = fileList[a].response.result[0]
                  fileJson = {
                    fileName: name,
                    filePath: ossFile.url,
                    fileSize: fileList[a].size
                  }
                  ids.push(id)
                } else {
                  fileJson = {
                    fileName: fileList[a].name,
                    filePath: fileList[a].response.message,
                    fileSize: fileList[a].size
                  }
                }
                this.newFileList.push(fileJson)
              } else {
                return
              }
              // update-end-author:lvdandan date:20200603 for:【TESTA-514】【开源issue】多个文件同时上传时，控制台报错
            }
            this.$emit('change', this.newFileList)
            this.openTagsDialog(ids, info.file.status === 'done')
          }
        }
      },
      handleDelete(file) {
        // 如有需要新增 删除逻辑
        console.log(file)
      },
      handleCancel() {
        this.previewVisible = false
      },
      // ---------------------------- begin 图片左右换位置 -------------------------------------
      moveLast() {
        // console.log(ev)
        // console.log(this.fileList)
        // console.log(this.currentImg)
        let index = this.getIndexByUrl()
        if (index == 0) {
          this.$message.warn('已到最前~')
        } else {
          let curr = this.fileList[index].url
          let last = this.fileList[index - 1].url
          let arr = []
          for (let i = 0; i < this.fileList.length; i++) {
            if (i == index - 1) {
              arr.push(curr)
            } else if (i == index) {
              arr.push(last)
            } else {
              arr.push(this.fileList[i].url)
            }
          }
          this.currentImg = last
          this.$emit('change', arr.join(this.splitChar))
        }
      },
      moveNext() {
        let index = this.getIndexByUrl()
        if (index == this.fileList.length - 1) {
          this.$message.warn('已到最后~')
        } else {
          let curr = this.fileList[index].url
          let next = this.fileList[index + 1].url
          let arr = []
          for (let i = 0; i < this.fileList.length; i++) {
            if (i == index + 1) {
              arr.push(curr)
            } else if (i == index) {
              arr.push(next)
            } else {
              arr.push(this.fileList[i].url)
            }
          }
          this.currentImg = next
          this.$emit('change', arr.join(this.splitChar))
        }
      },
      getIndexByUrl() {
        for (let i = 0; i < this.fileList.length; i++) {
          if (this.fileList[i].url === this.currentImg || encodeURI(this.fileList[i].url) === this.currentImg) {
            return i
          }
        }
        return -1
      }
    },
    mounted() {
      // 修复id被antd form的v-decorator覆盖的问题，会导致图片移动功能失效
      if (this.$el.getAttribute('id')) {
        this.containerId = this.$el.getAttribute('id')
      }
      this.$nextTick(() => {
        const moverObj = document.getElementById(this.containerId + '-mover')
        if (moverObj) {
          moverObj.addEventListener('mouseover', () => {
            this.moverHold = true
            this.moveDisplay = 'block'
          })
          moverObj.addEventListener('mouseout', () => {
            this.moverHold = false
            this.moveDisplay = 'none'
          })
        }

        let picList = document.getElementById(this.containerId) ? document.getElementById(this.containerId).getElementsByClassName('ant-upload-list-picture-card') : []
        if (picList && picList.length > 0) {
          picList[0].addEventListener('mouseover', (ev) => {
            ev = ev || window.event
            let target = ev.target || ev.srcElement
            if (target.className == 'ant-upload-list-item-info') {
              this.showMoverTask = false
              let item = target.parentElement
              this.left = item.offsetLeft
              this.top = item.offsetTop + item.offsetHeight - 50
              this.moveDisplay = 'block'
              this.currentImg = target.getElementsByTagName('img')[0].src
            }
          })

          picList[0].addEventListener('mouseout', (ev) => {
            ev = ev || window.event
            let target = ev.target || ev.srcElement
            // console.log('移除',target)
            if (target.className == 'ant-upload-list-item-info') {
              this.showMoverTask = true
              setTimeout(() => {
                if (this.moverHold === false) { this.moveDisplay = 'none' }
              }, 100)
            }
            if (target.className == 'ant-upload-list-item ant-upload-list-item-done' || target.className == 'ant-upload-list ant-upload-list-picture-card') {
              this.moveDisplay = 'none'
            }
          })
          // ---------------------------- end 图片左右换位置 -------------------------------------
        }
      })
    },
    model: {
      prop: 'value',
      event: 'change'
    }
  }
</script>
<style lang="less" scoped>
.knowledge-pic {
  display: inline-block;
  margin: 1vh auto 0;
  font-size: 1.1vh;
  color: #40a9ff;
}
</style>

<style lang="less">
.uploadty-disabled{
  .ant-upload-list-item {
    .anticon-close{
      display: none;
    }
    .anticon-delete{
      display: none;
    }
  }
  /*update-begin-author:taoyan date:2022-12-5 for: issues/4250 建议JUpload组件，disabled为true的时候上传button能够变灰或者其他样式图案，便于知晓无法再点击上传*/
  .ant-btn, .ant-upload-disabled{
    cursor: not-allowed;
    color: rgba(0, 0, 0, 0.25);
    background-color: #f5f5f5;
    border-color: #d9d9d9;
  }
  /*update-end-author:taoyan date:2022-12-5 for: issues/4250 建议JUpload组件，disabled为true的时候上传button能够变灰或者其他样式图案，便于知晓无法再点击上传*/

}
  //---------------------------- begin 图片左右换位置 -------------------------------------
  .uploadty-mover-mask{
    background-color: rgba(0, 0, 0, 0.5);
    opacity: .8;
    color: #fff;
    height: 28px;
    line-height: 28px;
  }
  //---------------------------- end 图片左右换位置 -------------------------------------
</style>
