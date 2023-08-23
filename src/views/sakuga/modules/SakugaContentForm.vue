<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form :form="form" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-item label="内容描述" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-textarea v-decorator="['content', validatorRules.content]" rows="10" placeholder="请输入内容描述" />
            </a-form-item>
          </a-col>
          <!--<a-col :span="12">-->
          <!--  <a-form-item label="片段标题" :labelCol="labelCol2" :wrapperCol="wrapperCol2">-->
          <!--    <a-input v-decorator="['title', validatorRules.title]" placeholder="请输入片段标题" ></a-input>-->
          <!--  </a-form-item>-->
          <!--</a-col>-->
          <!--<a-col :span="12">-->
          <!--  <a-form-item label="标签" :labelCol="labelCol2" :wrapperCol="wrapperCol2">-->
          <!--    <j-multi-select-tag type="list_multi" v-decorator="['tags']" :trigger-change="true" dictCode="sakuga_content_tags" placeholder="请选择标签" />-->
          <!--  </a-form-item>-->
          <!--</a-col>-->
          <a-col :span="24">
            <a-form-item label="图片(限制200)" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <!--<j-image-upload isMultiple biz-path="picture" v-decorator="['picture']" ></j-image-upload>-->
              <j-upload
                file-type="image"
                accept=".jpg, .jpeg, .png, .gif, .bmp, .svg, .tiff, .webp"
                v-decorator="['picture', validatorRules.picture]"
                :trigger-change="true"
                :number="200"
                :buttonVisible="true"
                bizPath="picture"
              ></j-upload>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="视频(限制10)" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <j-upload
                v-decorator="['video', validatorRules.video]"
                file-type="video"
                accept=".mp4, .webm, .ogg, .avi, .mov, .flv, .wmv, .mkv"
                :trigger-change="true"
                :number="10"
                :buttonVisible="true"
                text="点击上传(上传后点击列表可直接播放)"
                @showVideo="showVideo"
                bizPath="video"
                @change="showVideo"
              ></j-upload>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="" :labelCol="{md: {span: 0}}" :wrapperCol="{md: {span: 24}}">
              <template v-if="videoUrl">
                <vue-aliplayer-v2
                  v-if="videoUrl"
                  :source="videoUrl"
                  ref="VueAliplayerV2"
                  :options="{ autoplay: false, height: '20vh' }"/>
                <a-button type="primary" @click="downloadVideo()">点我下载</a-button>
              </template>
              <span v-else>暂无视频</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="动画名称" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-input v-decorator="['animeName']" placeholder="请输入动画名称" ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="作监" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-input v-decorator="['author']" placeholder="请输入作监" ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="动画公司" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-input v-decorator="['company']" placeholder="请输入动画公司" ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="其他附件(限制10)" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-upload
                v-decorator="['file']"
                file-type="all"
                accept="*"
                :trigger-change="true"
                :number="10"
                :buttonVisible="true"
                text="上传其他附件(如压缩包)"
                bizPath="zip"
              ></j-upload>
            </a-form-item>
          </a-col>
          <a-col v-if="showFlowSubmitButton" :span="24" style="text-align: center">
            <a-button @click="submitForm">保 存</a-button>
          </a-col>
        </a-row>
      </a-form>
    </j-form-container>
  </a-spin>
</template>

<script>

import { httpAction, getAction } from '@/api/manage'
import pick from 'lodash.pick'

export default {
  name: 'SakugaContentForm',
  components: {},
  props: {
    // 流程表单data
    formData: {
      type: Object,
      default: () => {},
      required: false
    },
    // 表单模式：true流程表单 false普通表单
    formBpm: {
      type: Boolean,
      default: false,
      required: false
    },
    // 表单禁用
    disabled: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  data () {
    return {
      form: this.$form.createForm(this),
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 }
      },
      labelCol2: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol2: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      confirmLoading: false,
      validatorRules: {
        title: {
          rules: [
            { required: false, message: '请输入片段标题!' }
          ]
        },
        content: {
          rules: [
            { required: true, message: '请输入内容描述!' }
          ]
        },
        picture: {
          rules: [
            { required: false, message: '请上传图片!' }
          ]
        },
        video: {
          rules: [
            { required: false, message: '请上传视频!' }
          ]
        }
      },
      url: {
        add: '/sakuga/sakugaContent/add',
        edit: '/sakuga/sakugaContent/edit',
        queryById: '/sakuga/sakugaContent/queryById'
      },
      videoUrl: ''
    }
  },
  computed: {
    formDisabled() {
      if (this.formBpm === true) {
        if (this.formData.disabled === false) {
          return false
        }
        return true
      }
      return this.disabled
    },
    showFlowSubmitButton() {
      if (this.formBpm === true) {
        if (this.formData.disabled === false) {
          return true
        }
      }
      return false
    }
  },
  created () {
    // 如果是流程中表单，则需要加载流程表单data
    this.showFlowData();
  },
  methods: {
    getFileAccessHttpUrl(avatar, subStr) {
      if (!subStr) subStr = 'http'
      try {
        if (avatar && avatar.startsWith(subStr)) {
          return avatar;
        } else {
          if (avatar &&　avatar.length > 0 && avatar.indexOf('[') == -1) {
            return window._CONFIG['staticDomainURL'] + '/' + avatar;
          }
        }
      } catch (err) {

      }
    },
    downloadVideo(url) {
      url = this.getFileAccessHttpUrl(url)
      window.open(url || this.videoUrl)
    },
    showVideo(url, list) {
      console.log('change', url, list)
      this.videoUrl = this.getFileAccessHttpUrl(url)
      this.videoUrl && this.$nextTick(() => this.$refs.VueAliplayerV2.play())
    },
    add () {
      this.edit({});
    },
    edit (record) {
      this.form.resetFields();
      this.model = Object.assign({}, record);
      this.visible = true;
      if (record.video) {
        this.videoUrl = this.getFileAccessHttpUrl(record.video.split(',')[0])
      }
      this.$nextTick(() => {
        this.form.setFieldsValue(pick(this.model, 'title', 'animeName', 'author', 'company', 'content', 'tags', 'picture', 'video', 'file'))
      })
    },
    // 渲染流程表单数据
    showFlowData() {
      if (this.formBpm === true) {
        let params = { id: this.formData.dataId };
        getAction(this.url.queryById, params).then((res) => {
          if (res.success) {
            this.edit(res.result);
          }
        });
      }
    },
    submitForm () {
      const that = this;
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          that.confirmLoading = true;
          let httpurl = '';
          let method = '';
          if (!this.model.id) {
            httpurl += this.url.add;
            method = 'post';
          } else {
            httpurl += this.url.edit;
            method = 'put';
          }
          let formData = Object.assign(this.model, values);
          console.log('表单提交数据', formData)
          httpAction(httpurl, formData, method).then((res) => {
            if (res.success) {
              that.$message.success(res.message);
              that.$emit('ok');
            } else {
              that.$message.warning(res.message);
            }
          }).finally(() => {
            that.confirmLoading = false;
          })
        }
      })
    },
    popupCallback(row) {
      this.form.setFieldsValue(pick(row, 'title', 'animeName', 'author', 'company', 'content', 'tags', 'picture', 'video', 'file'))
    }
  }
}
</script>
<style lang="less" scoped>
// 优化表单禁用效果
/deep/ .view-mode {
  .ant-form-item-control {
    cursor: not-allowed !important;
  }
  .ant-form-item-label {
    pointer-events: none !important;
    label {
      //color: rgba(51, 59, 59, 0.5) !important;
      color: rgba(0, 0, 0, 0.5) !important;
    }
  }
  input,
  .ant-calendar-picker,
  .ant-select,
  .ant-select-selection {
    border: none !important;
    pointer-events: none !important;
    cursor: not-allowed !important;
  }
}

/deep/ .ant-form-item {
  margin-bottom: 1vh;
}

// 表单form-item对齐长label
/deep/ .ant-form-item-label {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  line-height: 20px;
  margin-top: .8vh;
  margin-left: 1.5vh;
  margin-right: 1vh;
  padding-left: 0;
  label {
    //这是关键
    white-space: normal;
    text-align: left;
    //color: #909399;
    //color: rgba(51, 59, 59, 0.5);
    width: auto;
    // padding-right: 32px;
    font-size: 1.4vh;
    &:after {
      content: none !important; //解决上面的样式label后面会有空格
    }
  }
  // 绝对定位必填*号
  overflow: visible;
  label {
    overflow: visible;
  }
  .ant-form-item-required {
    position: relative;
    &::before {
      display: inline-block;
      margin-right: 4px;
      color: #f5222d;
      font-size: 14px;
      font-family: SimSun, sans-serif;
      line-height: 1;
      content: '*';
      position: absolute;
      left: -12px;
      top: 3px;
    }
  }
}

.fixThirdLine {
  /deep/ .ant-form-item-label {
    height: 60px !important;
  }
}

.fix-three-column-long-label {
  /deep/ .ant-form-item-label {
    height: auto !important;
    line-height: 16px;
  }
}

.header {
  text-align: center;
  font-size: 2vh;
  font-weight: bold;
  margin-bottom: 1vh;
}
</style>
