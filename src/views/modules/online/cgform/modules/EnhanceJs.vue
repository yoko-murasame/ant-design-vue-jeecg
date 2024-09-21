<template>
  <a-modal
    title="JS增强"
    :width="modalWidth"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @cancel="handleCancel"
    wrapClassName="ant-modal-cust-warp"
    style="top:5%;height: 95%;">

    <div style="height:32px;line-height:30px;margin-bottom: 0px">
      <!--请务必使用foo(row,keys,rows){console.log(this)}形式编写方法,多个方法必须用逗号隔开!this指向当前对象-->
      <!--<a target="blank" href="https://www.kancloud.cn/zhangdaiscott/jeecg-boot/2044101">默认钩子文档</a>-->
      <a @click.stop="$refs.jsHelp.showModal()">查看JS增强帮助</a>
    </div>

    <a-form style="height: 100%;">
      <j-code-editor
        ref="codeEditor"
        v-model="cgJs"
        language="javascript"
        :fullScreen="true"
        :lineNumbers="true"
        @input="handleCodeChange"
        :min-height="240"
        :language-change="false"></j-code-editor>
      <a-select
        :class="{'valid-error-cust':validError,'js-type-select':true}"
        size="small"
        v-model="cgJsType"
        placeholder="请选择增强类型"
        @change="handleChangeType"
        :getPopupContainer="node => node.parentNode">
        <a-select-option disabled value="form">form</a-select-option>
        <a-select-option value="list">list</a-select-option>
      </a-select>
    </a-form>

    <template slot="footer">
      <a-button key="back" @click="handleCancel">关闭</a-button>
      <a-button key="submit" type="primary" @click="handleSubmit">确定</a-button>
      <a-button v-if="showHistory" type="link" style="float: left" @click="handleWatchHistory">查看历史版本</a-button>
      <div v-if="aiTestMode" style="display: inline-block;float:left">
        <a-button @click="genEnhanceJsData(tableName, cgJsType, 'codeEditor')">生成测试数据</a-button>
      </div>
    </template>

    <enhance-history ref="historyModal"></enhance-history>
    <js-form-enhance-help ref="jsHelp" title="Online列表JS增强说明" url="/static/online列表JS增强说明.md"></js-form-enhance-help>
  </a-modal>
</template>

<script>
  import { postAction, getAction, putAction } from '@/api/manage'
  import EnhanceHistory from './EnhanceHistory'
  import { AiTestOnlineMixin } from '@/views/modules/aitest/onlinetest.mixins'
  import JsFormEnhanceHelp from '@comp/yoko/kform/JsFormEnhanceHelp.vue'

  export default {
    name: 'EnhanceJs',
    components: { EnhanceHistory, JsFormEnhanceHelp },
    mixins: [AiTestOnlineMixin],
    data() {
      return {
        modalWidth: 800,
        visible: false,
        confirmLoading: false,
        form: this.$form.createForm(this),
        labelCol: {
          xs: { span: 24 },
          sm: { span: 4 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        },
        url: '/online/cgform/head/enhanceJs/',
        model: {},
        cgJsType: [],
        cgJs: '',
        code: '',
        validError: false,
        showHistory: false,
        codeChange: false,
        tableName: ''
      }
    },
    methods: {
      handleSubmit() {
        if (!this.cgJsType || this.cgJsType.length == 0) {
          this.$message.warning('请选择增强类型！')
          this.validError = true
          return false
        }
        this.validError = false
        let formData = {
          cgJs: this.$refs.codeEditor.getCodeContent(),
          cgJsType: this.cgJsType
        }
        let promiseForm;
        if (!this.model.id) {
          promiseForm = postAction(this.url + this.code, formData)
        } else {
          let updateFormData = Object.assign({}, this.model, formData)
          promiseForm = putAction(this.url + this.code, updateFormData)
        }
        promiseForm.then(res => {
          this.confirmLoading = false;
          if (res.success) {
            this.addLocalRecord(formData);
            this.visible = false
            this.$message.success(res.message)
          } else {
            this.$message.warning(res.message)
          }
        })
      },
      handleCancel() {
        this.visible = false
      },
      show(row) {
        let code = row.id

        this.cgJs = ''
        this.validError = false
        this.codeChange = false
        this.code = code
        this.tableName = row.tableName
        let arr = this.$store.getters.enhanceJs(code)
        console.log('enhance js show ', arr)
        if (arr && arr.length > 0) {
          this.cgJsType = arr[arr.length - 1].type
          this.showHistory = true
        } else {
          this.showHistory = false
        }
        this.visible = true
        if (!this.cgJsType || this.cgJsType.length == 0) {
          this.handleChangeType('list')
        } else {
          this.handleChangeType(this.cgJsType)
        }
        /* this.$nextTick(() => {
          this.$refs.codeEditor.setCodeContent('')
        }); */
      },
      handleChangeType(val) {
        const that = this
        that.cgJsType = val
        getAction(that.url + that.code, { type: val }).then((res) => {
          if (res.success) {
            that.model = res.result
            that.$nextTick(() => {
              that.cgJs = that.model.cgJs

              this.$refs.codeEditor.setCodeContent(that.cgJs)
            });
          } else {
            that.model = {}
            that.$nextTick(() => {
              that.cgJs = ''
              this.$refs.codeEditor.setCodeContent(that.cgJs)
            });
          }
        })
      },
      addLocalRecord(formData) {
        if (this.codeChange === true) {
          let record = {
            code: this.code,
            str: formData.cgJs,
            type: formData.cgJsType,
            date: new Date().getTime()
          }
          this.$store.dispatch('addEhanceRecord', record);
        }
      },
      handleWatchHistory() {
        this.$refs.historyModal.show(this.code, this.cgJsType)
      },
      handleCodeChange(value) {
        if (this.cgJs != value) {
          this.codeChange = true
          // this.cgJs = value
        }
      }
    }
  }

</script>

<style lang="less" scoped>
  .js-type-select{
    position:absolute;
    z-index:10;
    right:58px;
    top:100px;
    max-width:146px;
  }
  /deep/ .ant-modal-body {
    padding: 6px;
  }
</style>
