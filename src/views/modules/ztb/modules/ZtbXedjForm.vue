<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="false">
      <a-form :form="form" slot="detail" :class="{'view-mode': viewMode}">
        <a-form-item class="step-form-item">
          <steps-tab
            ref="stepsTab"
            :debug="false"
            style="margin-bottom: 2vh"
            :dict="stateDict"
            v-decorator="['currentState', validatorRules.currentState]"
            :current-tab-dict-text.sync="currentTabName"
            :current-tab-dict-value.sync="currentTab"
            :current-finish="currentFinish"
            @update:hasPrev="e => $emit('update:hasPrev', e)"
            @update:hasNext="e => $emit('update:hasNext', e)"
            @stateChange="switchRequired"
          ></steps-tab>
        </a-form-item>
        <a-divider v-if="currentTab === '2'" class="my-divider">
          {{ `${currentTabName}${
            moment().diff(moment(form.getFieldValue('sjkgsj') || moment()), 'months') >= 6 && form.getFieldValue('currentState') !== '3'
              ? '（超过开工日期半年，此步骤必填！）' : ''}` }}
        </a-divider>
        <a-divider v-else class="my-divider">{{ currentTabName }}</a-divider>
        <disable-block :disable="formDisabled">
          <div v-show="currentTab === '1'">
            <a-row>
              <a-col :span="12">
                <a-form-item label="工程项目名称" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input v-decorator="['gcxmmc', validatorRules.gcxmmc]" placeholder="请输入工程项目名称" ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="工程合同金额" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input v-decorator="['gchtje', validatorRules.gchtje]" placeholder="请输入工程合同金额" style="width: 100%">
                    <template v-slot:addonAfter>
                      万元
                    </template>
                  </a-input>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="12">
                <a-form-item label="工程项目负责人" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input v-decorator="['gcxmfzr', validatorRules.gcxmfzr]" placeholder="请输入工程项目负责人" ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="发包方式" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <j-dict-select-tag
                    type="list"
                    v-decorator="['fbfs', validatorRules.fbfs]"
                    :trigger-change="true"
                    dictCode="ztb_xedj_fbfs"
                    placeholder="请选择发包方式"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="12">
                <a-form-item label="施工单位" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input v-decorator="['sgdw', validatorRules.sgdw]" placeholder="请输入施工单位" ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="实际开工时间" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <!--每次修改完次字段，需要关闭上方的点击，强制使用下一步去校验表单-->
                  <j-date
                    placeholder="请选择实际开工时间"
                    v-decorator="['sjkgsj', validatorRules.sjkgsj]"
                    :trigger-change="true"
                    @change="form.setFieldsValue({ currentState: '1' })"
                    style="width: 100%" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="24">
                <a-form-item label="工程内容" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-textarea
                    :auto-size="{ minRows: 3, maxRows: 5 }"
                    v-decorator="['gcnr', validatorRules.gcnr]"
                    placeholder="请输入工程内容"></a-textarea>
                </a-form-item>
              </a-col>
            </a-row>
          </div>
          <div v-show="currentTab === '2'">
            <template v-if="form.getFieldValue(dynamicKeyFieldsForGcgcdj[0]) && form.getFieldValue(dynamicKeyFieldsForGcgcdj[0]).length">
              <div v-for="(k, index) in form.getFieldValue(dynamicKeyFieldsForGcgcdj[0])" :key="k+dynamicNameSuffixesForGcgcdj[0]">
                <a-row>
                  <a-col :span="12">
                    <a-form-item :label="`合同完成进度(${index + 1})`" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                      <a-input
                        :min="0"
                        :max="100"
                        :precision="2"
                        v-decorator="[`${k}${dynamicNameSuffixesForGcgcdj[0]}`, validatorRules.htwcjd]"
                        placeholder="请输入合同完成进度"
                        @change="(e) => dynamicCalculateMultiFieldsForGcgcdj(e.target.value, k, index, dynamicNameSuffixesForGcgcdj[0])"
                        style="width: 100%" >
                        <template v-slot:addonAfter>
                          %
                        </template>
                      </a-input>
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item :label="`目前形象进度(${index + 1})`" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                      <a-input
                        :min="0"
                        :max="100"
                        :precision="2"
                        v-decorator="[`${k}${dynamicNameSuffixesForGcgcdj[1]}`, validatorRules.mqxxjd]"
                        placeholder="请输入目前形象进度"
                        @change="(e) => dynamicCalculateMultiFieldsForGcgcdj(e.target.value, k, index, dynamicNameSuffixesForGcgcdj[1])"
                        style="width: 100%" >
                        <template v-slot:addonAfter>
                          %
                        </template>
                      </a-input>
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row>
                  <a-col :span="12">
                    <a-form-item :label="`工程额支付进度(${index + 1})`" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                      <a-input
                        :min="0"
                        :max="100"
                        :precision="2"
                        v-decorator="[`${k}${dynamicNameSuffixesForGcgcdj[2]}`, validatorRules.gcezfjd]"
                        placeholder="请输入工程额支付进度"
                        @change="(e) => dynamicCalculateMultiFieldsForGcgcdj(e.target.value, k, index, dynamicNameSuffixesForGcgcdj[2])"
                        style="width: 100%" >
                        <template v-slot:addonAfter>
                          %
                        </template>
                      </a-input>
                    </a-form-item>
                  </a-col>
                  <a-col :span="24">
                    <a-form-item :label="`项目存在问题(${index + 1})`" :labelCol="labelCol" :wrapperCol="wrapperCol">
                      <a-textarea
                        :row="3"
                        v-decorator="[`${k}${dynamicNameSuffixesForGcgcdj[3]}`, validatorRules.xmczwt]"
                        @change="(e) => dynamicCalculateMultiFieldsForGcgcdj(e.target.value, k, index, dynamicNameSuffixesForGcgcdj[3])"
                        placeholder="请输入项目存在问题" >
                      </a-textarea>
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item :label="`目前现场照片(${index + 1})`" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                      <j-upload
                        bizPath="ztb/xedj"
                        :disabled="disabled"
                        :trigger-change="true"
                        file-type="image"
                        v-decorator="[`${k}${dynamicNameSuffixesForGcgcdj[4]}`, validatorRules.mqxczp]"
                        text="上传"
                        :number="10"
                        :returnUrl="true"
                        @change="(e) => dynamicCalculateMultiFieldsForGcgcdj(e, k, index, dynamicNameSuffixesForGcgcdj[4])"
                      ></j-upload>
                      <a-icon
                        style="position: absolute;top: 0.5vh;right: -1.2vw;"
                        v-if="!(formDisabled || viewMode) && form.getFieldValue(dynamicKeyFieldsForGcgcdj[0]).length > 1"
                        class="dynamic-delete-button"
                        type="minus-circle-o"
                        :disabled="false"
                        @click="() => dynamicRemoveMultiFieldsForGcgcdj(k)"
                      />
                      <a-icon
                        style="position: absolute;top: 0.5vh;right: -2.2vw;"
                        v-if="!(formDisabled || viewMode) && (index + 1 === form.getFieldValue(dynamicKeyFieldsForGcgcdj[0]).length)"
                        class="dynamic-add-button"
                        type="plus-circle-o"
                        @click="dynamicAddMultiFieldsForGcgcdj"
                      />
                    </a-form-item>
                  </a-col>
                </a-row>
              </div>
            </template>
            <template v-else>
              <a-row>
                <a-col :span="12">
                  <a-form-item
                    label="合同完成进度"
                    :labelCol="labelCol2"
                    :wrapperCol="wrapperCol2">
                    <a-button
                      v-if="!(formDisabled || viewMode)"
                      :disabled="formDisabled || viewMode"
                      type="dashed"
                      style="width: auto"
                      @click="dynamicAddMultiFieldsForGcgcdj">
                      <a-icon type="plus"/>
                      新增填写项
                    </a-button>
                    <a-input v-else v-decorator="[dynamicKeyFieldsForGcgcdj[0]]" placeholder="暂无数据" ></a-input>
                  </a-form-item>
                </a-col>
              </a-row>
            </template>
          </div>
          <div v-show="currentTab === '3'">
            <a-row>
              <a-col :span="24">
                <a-form-item label="验收时间" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <j-date placeholder="请选择验收时间" v-decorator="['yssj', validatorRules.yssj]" :trigger-change="true" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="完工验收材料" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <j-upload
                    bizPath="ztb/xedj"
                    :disabled="disabled"
                    :trigger-change="true"
                    file-type="all"
                    v-decorator="['wgyscl', validatorRules.wgyscl]"
                    text="上传附件"
                    :number="10"
                    :returnUrl="true"
                  ></j-upload>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="完工照片" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <j-upload
                    bizPath="ztb/xedj"
                    :disabled="disabled"
                    :trigger-change="true"
                    file-type="image"
                    v-decorator="['wgzp', validatorRules.wgzp]"
                    text="上传"
                    :number="10"
                    :returnUrl="true"
                  ></j-upload>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="结算资料" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <j-upload
                    bizPath="ztb/xedj"
                    :disabled="disabled"
                    :trigger-change="true"
                    file-type="all"
                    v-decorator="['jszl', validatorRules.jszl]"
                    text="上传附件"
                    :number="10"
                    :returnUrl="true"
                  ></j-upload>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="其他附件" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <j-upload
                    bizPath="ztb/xedj"
                    :disabled="disabled"
                    :trigger-change="true"
                    file-type="all"
                    v-decorator="['qtfj', validatorRules.qtfj]"
                    text="上传附件"
                    :number="10"
                    :returnUrl="true"
                  ></j-upload>
                </a-form-item>
              </a-col>
              <a-col v-if="showFlowSubmitButton" :span="24" style="text-align: center">
                <a-button @click="submitForm">保 存</a-button>
              </a-col>
            </a-row>
          </div>
        </disable-block>
      </a-form>
    </j-form-container>
  </a-spin>
</template>

<script>

import { getAction, httpAction } from '@/api/manage'
import pick from 'lodash.pick'
import { debounce, union } from 'lodash'
import moment from 'moment'
import DynamicFormGcgcdj from './DynamicFormGcgcdj'

export default {
  name: 'ZtbXedjForm',
  components: {},
  mixins: [DynamicFormGcgcdj],
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
    },
    // 展示模式
    viewMode: {
      type: [Boolean, String],
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
        currentState: {
          rules: [
            { required: false, message: '当前状态!' }
          ]
        },
        gcxmmc: {
          rules: [
            { required: true, message: '请输入项目名称!' },
            { validator: debounce(this.judgeExist, 100) }
          ]
        },
        gchtje: {
          rules: [
            { required: true, message: '请输入工程合同金额!' },
            { pattern: new RegExp('^-?\\d+\\.?\\d*$'), message: '请输入正确的金额!' }
          ]
        },
        gcxmfzr: {
          rules: [
            { required: true, message: '请输入工程项目负责人!' }
          ]
        },
        fbfs: {
          rules: [
            { required: true, message: '请选择发包方式!' }
          ]
        },
        sgdw: {
          rules: [
            { required: true, message: '请输入施工单位!' }
          ]
        },
        sjkgsj: {
          rules: [
            { required: true, message: '请选择实际开工时间!' }
          ]
        },
        gcnr: {
          rules: [
            { required: true, message: '请输入工程内容!' }
          ]
        },
        htwcjd: {
          rules: [
            { required: true, message: '请输入合同完成进度!' },
            { pattern: new RegExp('^-?\\d+\\.?\\d*$'), message: '请输入数字!' }
          ]
        },
        mqxxjd: {
          rules: [
            { required: true, message: '请输入目前形象进度!' },
            { pattern: new RegExp('^-?\\d+\\.?\\d*$'), message: '请输入数字!' }
          ]
        },
        mqxczp: {
          rules: [
            { required: true, message: '请上传现场照片!' }
          ]
        },
        xmczwt: {
          rules: [
            { required: true, message: '请输入项目存在问题!' }
          ]
        },
        gcezfjd: {
          rules: [
            { required: true, message: '请输入工程额支付进度!' },
            { pattern: new RegExp('^-?\\d+\\.?\\d*$'), message: '请输入数字!' }
          ]
        },
        yssj: {
          rules: [
            { required: true, message: '请选择验收时间!' }
          ]
        },
        wgyscl: {
          rules: [
            { required: true, message: '请上传完工验收材料!' }
          ]
        },
        wgzp: {
          rules: [
            { required: true, message: '请上传完工照片!' }
          ]
        },
        jszl: {
          rules: [
            { required: true, message: '请上传结算资料!' }
          ]
        },
        qtfj: {
          rules: [
            { required: false, message: '请上传其他附件!' }
          ]
        }
      },
      url: {
        add: '/ztb/ztbXedj/add',
        edit: '/ztb/ztbXedj/edit',
        queryById: '/ztb/ztbXedj/queryById'
      },
      // 仅控制当前tab
      currentTab: '',
      currentTabName: '',
      currentFinish: false
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
    },
    stateDict() {
      return 'ztb_xedj_state'
    },
    /**
     * 不同分步下的表单必填字段
     * @returns {string[][]}
     */
    stepsFields() {
      return [
        ['gcxmmc', 'gchtje', 'gcxmfzr', 'fbfs', 'sgdw', 'sjkgsj', 'gcnr'],
        ['htwcjd', 'mqxxjd', 'mqxczp', 'xmczwt', 'gcezfjd'],
        ['yssj', 'wgyscl', 'wgzp', 'jszl']
      ]
    }
  },
  created () {
    // 如果是流程中表单，则需要加载流程表单data
    this.showFlowData();
  },
  methods: {
    moment,
    /**
     * 当前节点完成状态
     * 触发点：
     * 1.下一步前校验表单-阻塞操作
     * 2.表单首次渲染-更新填写状态（表单必填项全填后设置成✔）
     */
    async updateCurrentState() {
      await this.$nextTick()
      return new Promise((resolve) => {
        // 通过校验当前必填去判断是否节点完成
        this.form.validateFieldsAndScroll({ force: true }, (err, values) => {
          console.log('validate', err, values)
          if (!err) {
            this.currentFinish = true
            resolve(true)
          } else {
            this.currentFinish = false
            this.currentTab = this.form.getFieldValue('currentState')
            resolve(false)
          }
        })
      })
    },
    async prev() {
      // const flag = await this.updateCurrentState()
      // flag && this.$refs.stepsTab.prev()
      this.$refs.stepsTab.prev()
    },
    async next() {
      const flag = await this.updateCurrentState()
      flag && this.$refs.stepsTab.next()
      // 从切换到下一步后，需要将填写完成状态设置回去
      this.currentFinish = false
    },
    /**
     * 切换不同状态下的必填表单项
     * @param state
     */
    switchRequired({ index }) {
      console.log('switchRequired', index)
      Object.keys(this.validatorRules).forEach(field => (this.validatorRules[field].rules[0].required = false))
      this.stepsFields.reduce((pre, cur, idx) => {
        if (idx <= index) {
          // 工程过程登记的特殊情况
          if (idx === 1) {
            // 完工登记的情况下，未超过半年的项目，取消必填
            const sjkgsj = this.form.getFieldValue('sjkgsj')
            if (!sjkgsj || (moment().diff(moment(sjkgsj), 'months') < 6) || this.form.getFieldValue('currentState') === '3') {
              return pre
            }
          }
          return union(pre, cur)
        }
        return pre
      }, []).forEach(field => (this.validatorRules[field].rules[0].required = true))
    },
    judgeExist(rule, value, cb) {
      const that = this
      // 排除编辑时指向自己
      if (value === that.model.gcxmmc || !value) {
        cb()
        return
      }
      // 请求接口验证
      getAction('/ztb/ztbXedj/list', { gcxmmc: value })
        .then(res => {
          if (res.success && !res.result.total) {
            cb()
          } else {
            const exist = res.result.records.filter(item => item.gcxmmc === value).length
            exist && cb(new Error('项目名称已重复'))
            !exist && cb()
          }
        })
    },
    /**
     * 初始化各种值
     * @param record
     */
    installValue(record) {
      // 控制分步tab组件，这里的默认值1为字典的实际值
      record.currentState = record.currentState || '1'
      this.currentTab = record.currentState
      // 初始化动态表单
      this.dynamicInitMultiFieldsForGcgcdj()
    },
    add () {
      this.edit({ currentState: '1' });
    },
    edit (record) {
      this.form.resetFields();
      this.model = Object.assign({}, record);
      this.visible = true;
      this.installValue(record)
      this.$nextTick(() => {
        this.renderForm()
        // 第一次新增时，不触发填写状态更新
        record.id && this.updateCurrentState()
      })
    },
    renderForm() {
      this.$nextTick(() => {
        this.form.setFieldsValue(pick(this.model, 'currentState', 'gcxmmc', 'gchtje', 'gcxmfzr', 'fbfs', 'sgdw', 'sjkgsj', 'gcnr', 'htwcjd', 'mqxxjd', 'mqxczp', 'xmczwt', 'gcezfjd', 'yssj', 'wgyscl', 'wgzp', 'jszl', 'qtfj'))
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
    /**
     * 1 暂存 忽略校验
     * 2 保存 校验必填
     * 3 提交 校验必填&自动发起流程
     * @param type
     */
    submitForm (type = 2) {
      const that = this;
      // 触发表单验证
      return new Promise((resolve, reject) => {
        that.form.validateFieldsAndScroll({ force: true }, (err, values) => {
          if (!err || type === 1) {
            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            if (!that.model.id) {
              httpurl += that.url.add;
              method = 'post';
            } else {
              httpurl += that.url.edit;
              method = 'put';
            }
            let formData = Object.assign(that.model, values);
            console.log('表单提交数据', formData);
            httpAction(httpurl, formData, method).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                if (type === 3) {
                  that.$emit('autoSubmitProcess', res.result);
                }
                that.$emit('ok');
                resolve(true)
              } else {
                that.$message.warning(res.message);
                reject()
              }
            }).finally(() => {
              that.confirmLoading = false;
            });
          } else {
            this.currentTab = this.form.getFieldValue('currentState')
            reject()
          }
        })
      })
    },
    popupCallback(row) {
      this.form.setFieldsValue(pick(row, 'currentState', 'gcxmmc', 'gchtje', 'gcxmfzr', 'fbfs', 'sgdw', 'sjkgsj', 'gcnr', 'htwcjd', 'mqxxjd', 'mqxczp', 'xmczwt', 'gcezfjd', 'yssj', 'wgyscl', 'wgzp', 'jszl', 'qtfj'))
    }
  }
}
</script>
<style lang="less" scoped>
@import '~@assets/less/common.less';
@import '~@assets/less/form-common.less';
/deep/ .my-divider.ant-divider-horizontal.ant-divider-with-text-center {
  color: #000000;
  margin: 0 0 1vh;
  text-align: left;
  font-weight: bold;
  .ant-divider-inner-text {
    display: inline-block;
    padding: 0 0.5vw;
    font-size: 1.5vh;
  }
  &::before, &::after {
    border-top: 0.2vh solid rgba(0, 0, 0, 5%);
  }
  &::before {
    width: 0;
  }
  &::after {
    width: 90%;
  }
}
.step-form-item.ant-form-item {
  margin-bottom: 0vh;
}
</style>
