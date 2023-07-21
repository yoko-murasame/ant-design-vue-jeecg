<template>
  <formitem-wapper :formitem="formitem">
    <a-upload
      name="file"
      :accept="acceptType"
      :multiple="true"
      :action="customUploadAction || uploadAction"
      :data="{'isup':1}"
      :headers="headers"
      v-decorator="[formitem.key, {valuePropName: 'fileList',getValueFromEvent: normFile,rules:formitem.rules}]"
      :beforeUpload="beforeUpload"
      :transform-file="transformFile"
      @change="handleChange"
      @preview="handlePreview"
      v-bind="getAttrs()">
      <div v-if="btn_status===false">
        <a-icon type="plus" />
        <div class="ant-upload-text">{{ text }}</div>
      </div>
    </a-upload>
    <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </formitem-wapper>
</template>

<script>
  import Vue from 'vue'
  import { ACCESS_TOKEN } from '@/store/mutation-types'
  import { FormItemMixin } from './../FormItenMixin'
  import FormitemWapper from './../FormitemWapper.vue'
  import { removeArrayElement } from '@/utils/util.js'
  import ImageZipCompressMixin from '@/components/yoko/mixins/ImageZipCompressMixin'
  import { getFileAccessHttpUrl } from '@api/manage'

  export default {
    name: 'ImageWidget',
    mixins: [FormItemMixin, ImageZipCompressMixin],
    components: {
      FormitemWapper
    },
    props: {
      text: {
        type: String,
        required: false,
        default: '点击上传'
      },
      bizPath: {
        type: String,
        required: false,
        default: 'temp'
      }
    },
    created() {
      // update--begin--autor:lvdandan-----date:20200925------for:扩展参数控制上传附件的单个还是多个
      if (this.formitem.formSchema.fieldExtendJson) {
        let json = JSON.parse(this.formitem.formSchema.fieldExtendJson);
        this.number = json.uploadnum ? json.uploadnum : 0;
      }
      // update--begin--autor:lvdandan-----date:20200925------for:扩展参数控制上传附件的单个还是多个
      const token = Vue.ls.get(ACCESS_TOKEN);
      this.headers = { 'X-Access-Token': token }
      if (this.widgetAttrs) {
        if (!this.widgetAttrs.disabled) {
          this.btn_status = false
        } else {
          this.btn_status = true
        }
      }
    },
    data() {
      return {
        uploadAction: window._CONFIG['domianURL'] + '/sys/common/upload',
        headers: {},
        btn_status: false,
        previewVisible: false,
        previewImage: '',
        uploadGoOn: true,
        number: 0
      }
    },
    methods: {
      beforeUpload(file) {
        this.uploadGoOn = true
        var fileType = file.type;
        if (fileType.indexOf('image') < 0) {
          this.$message.warning('请上传图片');
          this.uploadGoOn = false
        }
        // TODO 验证文件大小
        return this.uploadGoOn
      },
      handleChange(info) {
        // update--begin--autor:lvdandan-----date:20200925------for:扩展参数控制上传附件的单个还是多个
        // 限制上传一个文件，再次上传后，替换已上传文件
        if (this.number > 0) {
          info.fileList = info.fileList.slice(-this.number);
        }
        // update--begin--autor:lvdandan-----date:20200925------for:扩展参数控制上传附件的单个还是多个
        console.log('文件列表改变')
        if (!info.file.status && this.uploadGoOn === false) {
          info.fileList.pop();
        }
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          // update-begin-autor:taoyan date:20201130 for:文件上传失败从列表中移除
          if (info.file.response.success === false) {
            this.$message.error(info.file.response.message);
            removeArrayElement(info.fileList, 'uid', info.file['uid'])
          } else {
            info.fileList = info.fileList.map((file) => {
              if (file.response) {
                let reUrl = file.response.message
                file.url = getFileAccessHttpUrl(reUrl)
              }
              return file
            })
          }
          // update-end-autor:taoyan date:20201130 for:文件上传失败从列表中移除
          // let url = info.file.response.message
          // this.$message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
          this.$message.error(`${info.file.name} file upload failed.`);
        } else if (info.file.status === 'removed') {
          this.handleDelete(info.file)
        }
        this.fileList = info.fileList
      },
      handleDelete(file) {
        // 如有需要新增 删除逻辑
        console.log(file)
      },
      normFile(e) {
        if (Array.isArray(e)) {
          return e;
        }
        return e && e.fileList;
      },
      getAttrs() {
        let curWidgetAttr = this.widgetAttrs;
        return {
          listType: 'picture-card',
          ...curWidgetAttr
        }
      },
      handleCancel() {
        this.previewVisible = false;
      }
    }
  }
</script>

<style>

</style>
