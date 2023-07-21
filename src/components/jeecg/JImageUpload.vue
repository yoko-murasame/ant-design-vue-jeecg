<template>
  <div class="img">
    <a-upload
      name="file"
      listType="picture-card"
      :multiple="isMultiple"
      :action="customUploadAction || uploadAction"
      :headers="headers"
      :data="{biz:bizPath}"
      :fileList="fileList"
      :beforeUpload="beforeUpload"
      :transform-file="transformFile"
      :disabled="disabled"
      :isMultiple="isMultiple"
      @change="handleChange"
      @preview="handlePreview"
      :class="[!isMultiple?'imgupload':'', (!isMultiple && picUrl)?'image-upload-single-over':'' ]">
      <div>
        <!--<img v-if="!isMultiple && picUrl" :src="getAvatarView()" style="width:100%;height:100%"/>-->
        <div class="iconp">
          <a-icon :type="uploadLoading ? 'loading' : 'plus'" />
          <div class="ant-upload-text">{{ text }}</div>
        </div>
      </div>
      <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel()">
        <img alt="example" style="width: 100%" :src="previewImage"/>
      </a-modal>
    </a-upload>
  </div>
</template>

<script>
  import Vue from 'vue'
  import { ACCESS_TOKEN } from '@/store/mutation-types'
  import { getFileAccessHttpUrl } from '@/api/manage'
  import ImageZipCompressMixin from '@/components/yoko/mixins/ImageZipCompressMixin'

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
    name: 'JImageUpload',
    mixins: [ImageZipCompressMixin],
    data() {
      return {
        uploadAction: window._CONFIG['domianURL'] + '/sys/common/upload',
        uploadLoading: false,
        picUrl: false,
        headers: {},
        fileList: [],
        previewImage: '',
        previewVisible: false
      }
    },
    props: {
      text: {
        type: String,
        required: false,
        default: '上传'
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
      disabled: {
        type: Boolean,
        required: false,
        default: false
      },
      isMultiple: {
        type: Boolean,
        required: false,
        default: true
      },
      // update-begin-author:wangshuai date:20201021 for:LOWCOD-969 新增number属性，用于判断上传数量
      number: {
        type: Number,
        required: false,
        default: 0
      },
      // update-end-author:wangshuai date:20201021 for:LOWCOD-969 新增number属性，用于判断上传数量
      limitWidth: {
        type: Number,
        required: false,
        default: 0
      },
      limitHeight: {
        type: Number,
        required: false,
        default: 0
      },
      /**
       * 限制大小 单位为MB
       */
      limitSize: {
        type: Number,
        required: false,
        default: 10
      },
      acceptType: {
        type: String,
        required: false,
        default: 'image/*'
        // default: 'image/x-png, image/jpg, image/jpeg, image/gif'
      },
      /**
       * 自定义文件分割符，默认,
       */
      splitChar: {
        type: String,
        default: ','
      }
    },
    watch: {
      value: {
        handler(val, oldValue) {
          if (val instanceof Array) {
            this.initFileList(val.join(this.splitChar))
          } else {
            this.initFileList(val)
          }
          if (!val || val.length == 0) {
            this.picUrl = false
          }
        },
        // 立刻执行handler
        immediate: true
      }
    },
    created() {
      const token = Vue.ls.get(ACCESS_TOKEN)
      this.headers = { 'X-Access-Token': token }
    },
    methods: {
      initFileList(paths) {
        if (!paths || paths.length == 0) {
          this.fileList = []
          return
        }
        this.picUrl = true
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
      beforeUpload (file, fileList) {
        const fileType = file.type
        if (fileType.indexOf('image') < 0) {
          this.$message.warning('请上传图片')
          return false
        }

        // 文件类型(file.type)、大小限制(file.size)
        const isLt2M = file.size / 1024 / 1024 < this.limitSize
        if (!isLt2M) {
          this.$message.error(`上传图片大小不能超过 ${this.limitSize}MB!`)
          return Promise.reject()
        }

        // 限制上传数量
        const isLimit = (this.fileList.length + fileList.length) > this.number
        const indexOfFile = fileList.findIndex(item => item.uid === file.uid) + this.fileList.length
        if (this.number > 0) {
          if (isLimit && indexOfFile === this.number) {
            this.$message.error('最多可上传' + this.number + '张图片')
            return Promise.reject()
          }
          if (isLimit && indexOfFile > this.number) {
            return Promise.reject()
          }
        }

        // 限制宽高
        if (this.limitWidth > 0 && this.limitHeight > 0) {
          const width = this.limitWidth
          const height = this.limitHeight
          const isSize = new Promise(function(resolve, reject) {
            const _URL = window.URL || window.webkitURL
            const img = new Image()
            img.onload = function() {
              const valid = img.width == width && img.height == height
              valid ? resolve() : reject()
            }
            img.src = _URL.createObjectURL(file)
          }).then(() => {
            return file
          }, () => {
            this.$message.error('上传的图片宽高必须是' + this.limitWidth + '*' + this.limitHeight)
            return Promise.reject()
          })

          return isLt2M && isSize
        } else {
          return isLt2M
        }
      },
      handleChange(info) {
        this.picUrl = false
        let fileList = info.fileList
        // update-begin-author:wangshuai date:20201022 for:LOWCOD-969 判断number是否大于0和是否多选，返回选定的元素。
        if (this.number > 0 && this.isMultiple) {
          fileList = fileList.slice(-this.number)
        }
        // update-end-author:wangshuai date:20201022 for:LOWCOD-969 判断number是否大于0和是否多选，返回选定的元素。
        if (info.file.status === 'done') {
          if (info.file.response.success) {
            this.picUrl = true
            fileList = fileList.map((file) => {
              if (file.response) {
                file.url = file.response.message
              }
              return file
            })
          }
          // this.$message.success(`${info.file.name} 上传成功!`);
        } else if (info.file.status === 'error') {
          this.$message.error(`${info.file.name} 上传失败.`)
        } else if (info.file.status === 'removed') {
          this.handleDelete(info.file)
        }
        this.fileList = fileList
        if (info.file.status === 'done' || info.file.status === 'removed') {
          this.handlePathChange()
        }
      },
      getAvatarView() {
        if (this.fileList.length > 0) {
          let url = this.fileList[0].url
          return getFileAccessHttpUrl(url)
        }
      },
      handlePathChange() {
        let uploadFiles = this.fileList
        let path = ''
        if (!uploadFiles || uploadFiles.length == 0) {
          path = ''
        }
        let arr = []
        if (!this.isMultiple && uploadFiles.length > 0) {
          arr.push(uploadFiles[uploadFiles.length - 1].response.message)
        } else {
          for (let a = 0; a < uploadFiles.length; a++) {
            // update-begin-author:taoyan date:20200819 for:【开源问题z】上传图片组件 LOWCOD-783
            if (uploadFiles[a].status === 'done') {
              arr.push(uploadFiles[a].response.message)
            } else {
              return
            }
            // update-end-author:taoyan date:20200819 for:【开源问题z】上传图片组件 LOWCOD-783
          }
        }
        if (arr.length > 0) {
          path = arr.join(this.splitChar)
        }
        this.$emit('change', path)
      },
      handleDelete(file) {
        // 如有需要新增 删除逻辑
        console.log(file)
      },
      handleCancel() {
        this.close()
        this.previewVisible = false
      },
      close () {

      },
    },
    model: {
      prop: 'value',
      event: 'change'
    }
  }
</script>

<style scoped>
  /* update--begin--autor:lvdandan-----date:20201016------for：j-image-upload图片组件单张图片详情回显空白
  * https://github.com/zhangdaiscott/jeecg-boot/issues/1810
  * https://github.com/zhangdaiscott/jeecg-boot/issues/1779
  */

  /deep/ .imgupload .iconp{padding:20px;}
  /* update--end--autor:lvdandan-----date:20201016------for：j-image-upload图片组件单张图片详情回显空白*/

  /deep/ .image-upload-single-over .ant-upload-select{display: none}
</style>
