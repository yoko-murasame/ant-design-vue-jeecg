<template>
  <div class="tinymce-editor">
    <editor
      v-if="!reloading"
      v-model="myValue"
      :init="init"
      :disabled="disabled"
      @onClick="onClick">
    </editor>
  </div>
</template>

<script>
  import tinymce from 'tinymce/tinymce'
  import Editor from '@tinymce/tinymce-vue'
  import 'tinymce/themes/silver/theme'
  import 'tinymce/plugins/image'
  import 'tinymce/plugins/link'
  import 'tinymce/plugins/media'
  import 'tinymce/plugins/table'
  import 'tinymce/plugins/lists'
  import 'tinymce/plugins/contextmenu'
  import 'tinymce/plugins/wordcount'
  import 'tinymce/plugins/preview'
  import 'tinymce/plugins/colorpicker'
  import 'tinymce/plugins/textcolor'
  import 'tinymce/plugins/fullscreen'
  import 'tinymce/icons/default'
  import { uploadAction, getFileAccessHttpUrl } from '@/api/manage'
  import { getVmParentByName } from '@/utils/util'
  import Vue from 'vue'
  import { ACCESS_TOKEN } from '@/store/mutation-types'
  export default {
    components: {
      Editor
    },
    props: {
      value: {
        type: String,
        required: false
      },
      triggerChange: {
        type: Boolean,
        default: false,
        required: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      plugins: {
        type: [String, Array],
        default: 'lists image link media table textcolor wordcount contextmenu fullscreen'
      },
      toolbar: {
        type: [String, Array],
        default: 'undo redo |  formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | lists link unlink image media table | removeformat | fullscreen',
        branding: false
      },
      defaultHeight: {
        type: Number,
        default: 300
      },
      /**
       * 视频文件大小限制
       */
      maxVideoSize: {
        type: Number,
        default: 10 * 1024 * 1024 * 1024
      }
    },
    data() {
      const self = this
      return {
        // 初始化配置
        init: {
          language_url: '/tinymce/langs/zh_CN.js',
          language: 'zh_CN',
          skin_url: '/tinymce/skins/lightgray',
          height: this.defaultHeight,
          plugins: this.plugins,
          toolbar: this.toolbar,
          branding: false,
          menubar: false,
          toolbar_drawer: false,
          // update-begin-author:taoyan date:2022-5-6 for: issues/I4BCC3 富文本编辑器在服务器图片上传是相对路径
          convert_urls: false,
          // update-end-author:taoyan date:2022-5-6 for: issues/I4BCC3 富文本编辑器在服务器图片上传是相对路径
          images_upload_handler: (blobInfo, success) => {
            let formData = new FormData()
            formData.append('file', blobInfo.blob(), blobInfo.filename())
            formData.append('biz', 'jeditor')
            formData.append('jeditor', '1')
            uploadAction(window._CONFIG['domianURL'] + '/sys/common/upload', formData).then((res) => {
              if (res.success) {
                console.log('res.message', res)
                if (res.message == 'local') {
                  const img = 'data:image/jpeg;base64,' + blobInfo.base64()
                  success(img)
                } else {
                  let img = getFileAccessHttpUrl(res.message)
                  success(img)
                }
              }
            })
          },
          media_live_embeds: true,
          file_picker_types: 'media', // file image media
          file_picker_callback: function(cb, value, meta) {
            //当点击meidia图标上传时,判断meta.filetype == 'media'有必要，因为file_picker_callback是media(媒体)、image(图片)、file(文件)的共同入口
            if (meta.filetype == 'media'){
              //创建一个隐藏的type=file的文件选择input
              let input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.onchange = function(){
                let file = this.files[0];//只选取第一个文件。如果要选取全部，后面注意做修改
                // 检查文件大小
                if (file.size > self.maxVideoSize) {
                  self.$message.warn('文件大小超过限制（1GB），请重新选择文件。');
                  return;
                }
                let xhr, formData;
                xhr = new XMLHttpRequest();
                xhr.open('POST', window._CONFIG['domianURL'] + '/sys/common/upload');
                xhr.setRequestHeader("X-Access-Token", Vue.ls.get(ACCESS_TOKEN))
                xhr.withCredentials = false;
                xhr.upload.onprogress = function (e) {
                  // 进度(e.loaded / e.total * 100)
                  let percent=e.loaded / e.total * 100;
                  if(percent<100){
                    tinymce.activeEditor.setProgressState(true);//是否显示loading状态：1（显示）0（隐藏）
                  }else{
                    tinymce.activeEditor.setProgressState(false);
                  }
                };
                xhr.onerror = function () {
                  //根据自己的需要添加代码
                  console.log(xhr.status);
                  tinymce.activeEditor.setProgressState(false);
                  return;
                };
                xhr.onload = function () {
                  if (xhr.status < 200 || xhr.status >= 300) {
                    console.log('HTTP 错误: ' + xhr.status);
                    return;
                  }
                  let json = JSON.parse(xhr.responseText);
                  console.log('上传结果', json)
                  //假设接口返回JSON数据为{status: 0, msg: "上传成功", data: {location: "/localImgs/1546434503854.mp4"}}
                  if(json.code === 200){
                    //接口返回的文件保存地址
                    //cb()回调函数，将mediaLocation显示在弹框输入框中
                    cb(getFileAccessHttpUrl(json.message), { title: file.name });
                  }else{
                    console.log(json.message);
                    return;
                  }
                };
                formData = new FormData();
                //假设接口接收参数为file,值为选中的文件
                formData.append('file', file);
                formData.append('biz', 'jeditor')
                formData.append('jeditor', '1')
                //正式使用将下面被注释的内容恢复
                xhr.send(formData);
              }
              //触发点击
              input.click();
            }
          },
          // media_url_resolver: function (data, resolve) {
          //   console.log('media_url_resolver', data)
          //   try {
          //     let videoUri = encodeURI(data.url);
          //     let embedHtml = `<p>
          //         <span
          //             class="mce-object mce-object-video"
          //             data-mce-selected="1"
          //             data-mce-object="video"
          //             data-mce-p-width="100%"
          //             data-mce-p-height="auto"
          //             data-mce-p-controls="controls"
          //             data-mce-p-controlslist="nodownload"
          //             data-mce-p-allowfullscreen="true"
          //             data-mce-p-src=${videoUri} >
          //             <video src=${data.url} width="100%" height="auto" controls="controls" controlslist="nodownload">
          //             </video>
          //         </span>
          //     </p>
          //     <p style="text-align: left;"></p>`;
          //     resolve({ html: embedHtml });
          //   } catch (e) {
          //     resolve({ html: "" });
          //   }
          // }
        },
        myValue: this.value,
        reloading: false
      }
    },
    mounted() {
      this.initATabsChangeAutoReload()
    },
    methods: {

      reload() {
        this.reloading = true
        this.$nextTick(() => this.reloading = false)
      },

      onClick(e) {
        this.$emit('onClick', e, tinymce)
      },
      // 可以添加一些自己的自定义事件，如清空内容
      clear() {
        this.myValue = ''
      },

      /**
       * 自动判断父级是否是 <a-tabs/> 组件，然后添加事件监听，自动触发reload()
       *
       * 由于 tabs 组件切换会导致 tinymce 无法输入，
       * 只有重新加载才能使用（无论是vue版的还是jQuery版tinymce都有这个通病）
       */
      initATabsChangeAutoReload() {
        // 获取父级
        let tabs = getVmParentByName(this, 'ATabs')
        let tabPane = getVmParentByName(this, 'ATabPane')
        if (tabs && tabPane) {
          // 用户自定义的 key
          let currentKey = tabPane.$vnode.key
          // 添加事件监听
          tabs.$on('change', (key) => {
            // 切换到自己时执行reload
            if (currentKey === key) {
              this.reload()
            }
          })
          // update--begin--autor:liusq-----date:20210316------for：富文本编辑器tab父组件可能导致的赋值问题------
          this.reload()
          // update--end--autor:liusq-----date:20210316------for：富文本编辑器tab父组件可能导致的赋值问题------
        } else {
          // update--begin--autor:wangshuai-----date:20200724------for：富文本编辑器切换tab无法修改------
          let tabLayout = getVmParentByName(this, 'TabLayout')
          // update--begin--autor:liusq-----date:20210713------for：处理特殊情况excuteCallback不能使用------
          try {
            tabLayout.excuteCallback(() => {
              this.reload()
            })
          } catch (error) {
            if (tabLayout) {
              this.reload()
            }
          }
          // update--end--autor:liusq-----date:20210713------for：处理特殊情况excuteCallback不能使用------
          // update--begin--autor:wangshuai-----date:20200724------for：文本编辑器切换tab无法修改------
        }
      }

    },
    watch: {
      value(newValue) {
        this.myValue = (newValue == null ? '' : newValue)
      },
      myValue(newValue) {
        if (this.triggerChange) {
          this.$emit('change', newValue)
        } else {
          this.$emit('input', newValue)
        }
      },
      // update--begin--autor:liusq-----date:20230420------for：[issues/19]缓存路由后，页面中富文本组件会出现无法编辑的问题------
      '$route': function(newRoute) {
        if (this.$route.meta.keepAlive && this.$route.meta.componentName) {
          this.reload()
        }
      }
      // update--end--autor:liusq-----date:20230420------for：[issues/19]缓存路由后，页面中富文本组件会出现无法编辑的问题------
    }
  }

</script>
<style scoped>
</style>
