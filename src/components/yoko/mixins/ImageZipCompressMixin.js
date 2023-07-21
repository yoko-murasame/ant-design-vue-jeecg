import lrz from 'lrz'

/**
 * 图片压缩混入+v-viewer图片预览
 * a-upload需要添加
 * :transform-file="transformFile"
 * @preview="handlePreview"
 */
export const FILE_TYPE_ALL = 'all'
export const FILE_TYPE_IMG = 'image'
export const FILE_TYPE_TXT = 'file'
export default {
  props: {
    acceptType: {
      type: String,
      required: false,
      default: 'image/*'
      // default: 'image/x-png, image/jpg, image/jpeg, image/gif'
    },
    /**
     * 自定义上传接口
     */
    customUploadAction: {
      type: String,
      required: false,
      default: ''
    },
    fileType: {
      type: String,
      required: false,
      default: FILE_TYPE_IMG
    },
    /**
     * 开启压缩
     */
    doCompress: {
      type: Boolean,
      required: false,
      default: true
    },
    /**
     * 超过这个大小开始压缩，单位MB
     */
    zipEnableSize: {
      type: Number,
      default: 2
    },
    /**
     * 压缩率
     */
    zipPercent: {
      type: Number,
      required: false,
      default: 0.7
    },
    /**
     * 自定义文件分割符，默认,
     */
    splitChar: {
      type: String,
      default: ','
    }
  },
  data() {
    return {
      fileList: []
    }
  },
  methods: {
    transformFile(file) {
      const that = this
      return new Promise(resolve => {
        // const reader = new FileReader()
        // reader.readAsDataURL(file)
        // reader.onload = () => {
        //   const canvas = document.createElement('canvas')
        //   const img = document.createElement('img')
        //   img.src = reader.result
        //   img.onload = () => {
        //     const ctx = canvas.getContext('2d')
        //     ctx.drawImage(img, 0, 0)
        //     ctx.fillStyle = 'red'
        //     ctx.textBaseline = 'middle'
        //     ctx.fillText('PUSDN', 20, 20)
        //     canvas.toBlob(resolve)
        //   }
        // }
        // 不是图片就不压缩
        if (that.fileType !== FILE_TYPE_IMG) {
          resolve(file)
        } else if (that.doCompress && file.size / 1024 / 1024 > this.zipEnableSize) {
          that.compressImg(file).then((zippedFile) => {
            // 回调函数返回file的值（将base64编码转成file）
            const files = that.dataURLtoFile(zippedFile.base64, file.name)
            resolve(files)
          })
        } else {
          resolve(file)
        }
      })
    },
    // 压缩图片
    compressImg (file) {
      return lrz(file, {
        quality: this.zipPercent
      }).then((rst) => {
        return rst
      }).catch((err) => {
        console.log(err)
      })
    },
    // base64转码（压缩完成后的图片为base64编码，这个方法可以将base64编码转回file文件）
    dataURLtoFile (dataUrl, filename) {
      const arr = dataUrl.split(this.splitChar)
      const mime = arr[0].match(/:(.*?);/)[1]
      const bStr = atob(arr[1])
      let n = bStr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bStr.charCodeAt(n)
      }
      return new File([u8arr], filename, { type: mime })
    },
    handlePreview(file) {
      if (this.fileType === FILE_TYPE_IMG) {
        this.previewImage = file.url || file.thumbUrl
        console.log('扩展 $viewerApi', file, this.fileList)
        // 使用v-viewer进行图片预览
        // this.previewVisible = true;
        this.$viewerApi({
          images: [this.previewImage, ...this.fileList.filter(e => e.name !== file.name).map(e => e.url)]
        })
      } else {
        // location.href = file.url
        window.open(file.url)
      }
    }
  }
}
