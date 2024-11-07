<template>
  <a-config-provider :locale="locale">
    <a-form
      v-bind="$attrs"
      selfUpdate
      v-if="typeof value.list !== 'undefined' && typeof value.config !== 'undefined'
      "
      class="k-form-build-9136076486841527"
      :layout="value.config.layout"
      :hideRequiredMark="value.config.hideRequiredMark"
      :form="form"
      @submit="handleSubmit"
      :style="value.config.customStyle" >

      <buildBlocks
        ref="buildBlocks"
        @handleReset="reset"
        v-for="(record, index) in value.list"
        :record="record"
        :formData="formData"
        :dynamicData="getDynamicData"
        :config="compConfig"
        :formConfig="value.config"
        :validatorError="validatorError"
        :key="index"
        @change="handleChange"
        @myInput="handleMyInput"
        @beforeOnlListSubReady="handleBeforeOnlListSubReady"
        :disabled="disabled"/>

    </a-form>
  </a-config-provider>
</template>
<script>
import Vue from 'vue'

/*
 * author kcz
 * date 2019-11-20
 * description 将json数据构建成表单
 */
import buildBlocks from './buildBlocks'
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
import { lazyLoadTick } from '../../utils/index'
import { createAsyncJsEnhanceFunction } from '@comp/yoko/kform/CustomMethods'

export default {
  name: 'KFormBuild',
  data() {
    return {
      locale: zhCN,
      form: this.$form.createForm(this),
      validatorError: {},
      defaultDynamicData: {}
    }
  },
  // props: ["value", "dynamicData"],
  props: {
    // 当前表单完整配置项
    value: {
      type: Object,
      required: true
    },
    // 动态字典配置数据
    dynamicData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 传递给表单组件的config项，看了下代码没啥作用
    compConfig: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: Boolean,
      default: false
    },
    outputString: {
      type: Boolean,
      default: false
    },
    // 转换空字符串到null值
    emptyStringToNull: {
      type: Boolean,
      default: true
    },
    // 表单数据
    formData: {
      type: Object,
      default: () => ({})
    },
    // 来自流程或者online列表上文的默认数据
    newFormData: {
      type: Object,
      default: () => ({})
    },
    // 父列表组件
    parent: {
      type: Object,
      default: null
    }
  },
  components: {
    buildBlocks
  },
  computed: {
    // 动态字典配置数据
    getDynamicData() {
      return typeof this.dynamicData === 'object' &&
        Object.keys(this.dynamicData).length
        ? this.dynamicData
        : window.$kfb_dynamicData || {}
    },
    // 表单数据
    data() {
      return this.formData
    }
  },
  methods: {
    // moment
    /**
     * 获取自定义函数的参数名称
     * @returns {string[]}
     */
    getCustomArgsName() {
      return ['data', 'formConfig', 'setData', 'getData',
        'setOptions', 'changeDict',
        'setRules', 'openRequired', 'closeRequired',
        'parent',
        'hide', 'show', 'disable', 'enable', 'reset', 'formData', 'newFormData', 'formMeta']
    },
    /**
     * 获取自定义函数的参数对象
     * @param formData
     * @returns {(default.computed.formData|*|(function(*): Promise<unknown>)|(function(*, boolean=): Promise<unknown>)|default.methods.setOptions)[]}
     */
    getCustomArgsObj(formData = {}) {
      return [this.data, this.value.config, this.setData, this.getData,
        this.setOptions, this.changeDict,
        this.setRules, this.openRequired, this.closeRequired,
        this.parent,
        this.hide, this.show, this.disable, this.enable, this.reset, formData, this.newFormData, this.value]
    },
    /**
     * JS增强-为表单Form注册自定义函数
     */
    registerCustomFunction() {
      const { config } = this.value
      if (!config) {
        console.log('KFormBuild::registerCustomFunction', 'config is undefined', this.value)
        return
      }
      const { customFunctionStr } = config
      try {
        if (customFunctionStr) {
          const vm = this
          // eslint-disable-next-line no-eval
          const CustomFunStr = eval(`(function () {return { ${customFunctionStr} }})`)
          const FunObj = new CustomFunStr()
          // 依次注册到Vue
          Object.keys(FunObj).forEach(key => {
            const func = FunObj[key]
            // 函数形式直接注册
            if (typeof func === 'function') {
              console.log('初始化自定义函数', key)
              this[key] = func.bind(vm)
            }
          })
        }
      } catch (e) {
        console.error('初始化自定义函数失败', e)
        Vue.prototype.$message.error('初始化自定义函数失败，请检查js自定义函数配置是否正确！和Vue2写法相同！')
      }
    },
    /**
     * 模态框关闭前前钩子，这里交给外部modal组件触发
     */
    beforeModalClose() {
      const { config } = this.value
      if (!config) {
        console.log('KFormBuild::beforeModalClose', 'config is undefined', this.value)
        return
      }
      const { beforeModalClose } = config
      if (beforeModalClose) {
        return createAsyncJsEnhanceFunction(
          this,
          beforeModalClose,
          this.getCustomArgsName(),
          this.getCustomArgsObj())
        .call()
      }
    },
    /**
     * 数据提交后钩子（提交后）
     */
    afterSubmit(formData) {
      const { config } = this.value
      if (!config) {
        console.log('KFormBuild::afterSubmit', 'config is undefined', this.value)
        return
      }
      const { afterSubmit } = config
      if (afterSubmit) {
        return createAsyncJsEnhanceFunction(
          this,
          afterSubmit,
          this.getCustomArgsName(),
          this.getCustomArgsObj(formData))
        .call()
      }
    },
    /**
     * 数据提交前钩子（提交前）
     */
    beforeSubmit() {
      const { config } = this.value
      if (!config) {
        console.log('KFormBuild::beforeSubmit', 'config is undefined', this.value)
        return
      }
      const { beforeSubmit } = config
      if (beforeSubmit) {
        return createAsyncJsEnhanceFunction(
          this,
          beforeSubmit,
          this.getCustomArgsName(),
          this.getCustomArgsObj())
        .call()
      }
    },
    /**
     * mounted钩子（在表单数据填充前加载）
     */
    handleMounted() {
      const { config } = this.value
      if (!config) {
        console.log('KFormBuild::handleMounted', 'config is undefined', this.value)
        return
      }
      const { handleMounted } = config
      if (handleMounted) {
        return createAsyncJsEnhanceFunction(
          this,
          handleMounted,
          this.getCustomArgsName(),
          this.getCustomArgsObj())
        .call()
      }
    },
    /**
     * 数据初始化值钩子（在表单数据填充后加载）
     */
    handleSetData() {
      const { config } = this.value
      if (!config) {
        console.log('KFormBuild::handleSetData', 'config is undefined', this.formData, this.value)
        return
      }
      const { handleSetData } = config
      if (handleSetData) {
        return createAsyncJsEnhanceFunction(
          this,
          handleSetData,
          this.getCustomArgsName(),
          this.getCustomArgsObj())
        .call()
      }
    },
    convertEmptyStringToNull(obj) {
      for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          // 递归处理嵌套对象
          this.convertEmptyStringToNull(obj[key])
        } else if (obj[key] === '') {
          // 将空字符串转换为 null
          obj[key] = null
          // console.log('处理空字符串到null', key, obj[key])
        }
      }
    },
    async handleSubmit(e) {
      const that = this
      return new Promise(async (resolve, reject) => {
        // 提交按钮触发，并触发submit函数，返回getData函数
        e && e.preventDefault()
        try { await that.beforeSubmit() } catch (ex) {
          console.error('KFormBuild::beforeSubmit', ex)
          if (typeof ex === 'string') {
            that.$message.error(ex)
          } else {
            that.$message.error('表单未完成！')
          }
          reject(ex)
          return
        }
        let formData = null
        try { formData = await that.getData() } catch (ex) {
          reject(ex)
          return
        }
        // 保存后回调中带主键过来
        const callback = async (id) => {
          try { await that.afterSubmit({ ...formData, id }) } catch (ex) {
            console.error('KFormBuild::afterSubmit', ex)
            if (typeof ex === 'string') {
              that.$message.error(ex)
            } else {
              that.$message.error('数据保存后回调JS增强函数异常！')
            }
            throw ex
          }
        }
        that.$emit('submit', that.getData)
        resolve({ formData, callback })
      })
    },

    reset() {
      // 重置表单
      this.form.resetFields()
    },
    getData(fields, throwEx = true) {
      // 提交函数，提供父级组件调用
      if (throwEx === undefined) {
        throwEx = true
      }
      return new Promise((resolve, reject) => {
        try {
          this.form.validateFields(fields, (err, formValues) => {
            if (err && throwEx) {
              reject(err)
              /**
               * @author: lizhichao<meteoroc@outlook.com>
               * @Description: 多容器校验时，提供error返回给多容器进行判断。
               */
              this.validatorError = err
              return
            }
            // 需要预先合并一些不在表单设计器里的隐藏字段的值，要不都保存丢失了
            const values = Object.assign({}, this.formData, formValues)
            console.log('获取数据', values)
            this.validatorError = {}
            this.$refs.buildBlocks.forEach(item => {
              if (!item.validationSubform()) {
                reject(err)
              }
            })
            // 空字符转换成null，防止date等组件，空字符串保存导致后端报错
            if (this.emptyStringToNull) {
              this.convertEmptyStringToNull(values)
            }
            if (this.outputString) {
              // 需要所有value转成字符串
              for (const key in values) {
                const type = typeof values[key]
                if (type === 'string' || type === 'undefined') {
                  continue
                } else if (type === 'object') {
                  values[key] = `k-form-design#${type}#${JSON.stringify(
                    values[key]
                  )}`
                } else {
                  values[key] = `k-form-design#${type}#${String(values[key])}`
                }
              }
              resolve(values)
            } else {
              resolve(values)
            }
          })
        } catch (err) {
          reject(err)
        }
      })
    },
    setData(json) {
      // console.log('setData', JSON.parse(JSON.stringify(json)))
      return new Promise((resolve, reject) => {
        try {
          if (this.outputString) {
            // debugger
            // 将非string数据还原
            for (const key in json) {
              if (!json[key].startsWith('k-form-design#')) {
                continue
              }
              const array = json[key].split('#')
              if (array[1] === 'object') {
                json[key] = JSON.parse(array[2])
              } else if (array[1] === 'number') {
                json[key] = Number(array[2])
              } else if (array[1] === 'boolean') {
                json[key] = Boolean(array[2])
              }
            }
            this.form.setFieldsValue(json)
          } else {
            this.form.setFieldsValue(json)
          }
          resolve(true)
        } catch (err) {
          console.error(err)
          reject(err)
        }
        // });
      })
    },
    // 批量设置v-decorator的所有rules中的属性
    setRules(fields, key, value) {
      fields = new Set(fields)
      // 递归遍历控件树
      const traverse = array => {
        array.forEach(element => {
          if (fields.has(element.model)) {
            // 设置所有rules的属性
            element.rules && element.rules.forEach(rule => this.$set(rule, key, value))
          }
          if (element.type === 'grid' || element.type === 'tabs') {
            // 栅格布局 and 标签页
            element.columns.forEach(item => {
              traverse(item.list)
            })
          } else if (element.type === 'card' || element.type === 'batch' || element.type === 'subtable') {
            // 卡片布局 and  动态表格
            traverse(element.list)
          } else if (element.type === 'table') {
            // 表格布局
            element.trs.forEach(item => {
              item.tds.forEach(val => {
                traverse(val.list)
              })
            })
          }
        })
      }
      traverse(this.value.list)
    },
    // 开启必填
    openRequired(fields) {
      this.setRules(fields, 'required', true)
    },
    // 关闭必填
    closeRequired(fields) {
      this.setRules(fields, 'required', false)
    },
    // 批量设置某个option的值
    setOptions(fields, optionName, value) {
      fields = new Set(fields)
      // 递归遍历控件树
      const traverse = array => {
        array.forEach(element => {
          if (fields.has(element.model)) {
            this.$set(element.options, optionName, value)
          }
          if (element.type === 'grid' || element.type === 'tabs') {
            // 栅格布局 and 标签页
            element.columns.forEach(item => {
              traverse(item.list)
            })
          } else if (element.type === 'card' || element.type === 'batch' || element.type === 'subtable') {
            // 卡片布局 and  动态表格
            traverse(element.list)
          } else if (element.type === 'table') {
            // 表格布局
            element.trs.forEach(item => {
              item.tds.forEach(val => {
                traverse(val.list)
              })
            })
          }
        })
      }
      traverse(this.value.list)
    },
    // 变更字典值
    changeDict(fields, dictCode = '', dictOptions = []) {
      dictCode && this.setOptions(fields, 'dictCode', dictCode)
      dictOptions && this.setOptions(fields, 'dictOptions', dictOptions)
    },
    // 隐藏表单字段
    hide(fields) {
      // 设置v-show隐藏
      this.setOptions(fields, 'hidden', true)
      // 设置取消必填
      this.closeRequired(fields)
    },
    // 显示表单字段
    show(fields) {
      this.setOptions(fields, 'hidden', false)
    },
    // 禁用表单字段
    disable(fields) {
      this.setOptions(fields, 'disabled', true)
    },
    // 启用表单字段
    enable(fields) {
      this.setOptions(fields, 'disabled', false)
    },
    handleChange(value, key) {
      // 触发change事件
      this.$emit('change', value, key)
    },
    handleMyInput(value, key) {
      // console.log('KFormBuild::handleMyInput', value, key)
      // 触发input事件
      this.$emit('myInput', value, key)
    },
    // online子表组件的初始化前事件
    handleBeforeOnlListSubReady(e) {
      this.$emit('beforeOnlListSubReady', e)
    }
  },
  mounted() {
    const that = this
    // 等待所有组件加载完成，再执行mounted
    lazyLoadTick.nextTick(async () => {
      console.log('KFormBuild::mounted', that.formData)
      that.reset()
      try {
        await that.handleMounted()
      } catch (e) {
        that.$message.error('JS增强::handleMounted执行失败 ' + e)
        console.error('KFormBuild::handleMounted', e)
      }
      // 空字符转换成null，防止date等组件，空字符串保存导致后端报错
      if (that.emptyStringToNull) {
        that.convertEmptyStringToNull(that.formData)
      }
      await that.setData(that.formData)
      try {
        await that.handleSetData()
      } catch (e) {
        that.$message.error('JS增强::handleSetData执行失败 ' + e)
        console.error('KFormBuild::handleSetData', e)
      }
    })
  },
  created() {
    lazyLoadTick.reset()
    // 注册自定义函数
    this.registerCustomFunction()
  },
  watch: {
  }
}
</script>

<style scoped>
.jeecg-form-container-disabled {
  cursor: not-allowed;
}

.jeecg-form-container-disabled fieldset[disabled] {
  -ms-pointer-events: none;
  pointer-events: none;
}

.jeecg-form-container-disabled .ant-select {
  -ms-pointer-events: none;
  pointer-events: none;
}

.jeecg-form-container-disabled .ant-upload-select {
  display: none
}

.jeecg-form-container-disabled .ant-upload-list {
  cursor: grabbing
}

.jeecg-form-container-disabled fieldset[disabled] .ant-upload-list,
.jeecg-form-container-disabled fieldset[disabled] iframe {
  -ms-pointer-events: auto !important;
  pointer-events: auto !important;
}

.jeecg-form-container-disabled .ant-upload-list-item-actions .anticon-delete,
.jeecg-form-container-disabled .ant-upload-list-item .anticon-close {
  display: none;
}
</style>
