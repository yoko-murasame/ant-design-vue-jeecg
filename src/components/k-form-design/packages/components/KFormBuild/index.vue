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
        :dynamicData="getDynamicData"
        :config="config"
        :formConfig="value.config"
        :validatorError="validatorError"
        :key="index"
        @change="handleChange"
        :disabled="disabled"/>

    </a-form>
  </a-config-provider>
</template>
<script>
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
    // 对应实际传入的当前表单页面的组件配置项
    value: {
      type: Object,
      required: true
    },
    dynamicData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    config: {
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
    // 对应了实际传入的表单record对象
    defaultValue: {
      type: Object,
      default: () => ({})
    }
  },
  components: {
    buildBlocks
  },
  computed: {
    getDynamicData() {
      return typeof this.dynamicData === 'object' &&
        Object.keys(this.dynamicData).length
        ? this.dynamicData
        : window.$kfb_dynamicData || {}
    },
    data() {
      return this.defaultValue
    }
  },
  methods: {
    // moment
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
          ['data', 'formConfig', 'setData', 'getData', 'setOptions',
            'hide', 'show', 'disable', 'enable', 'reset', 'formData'],
          [this.data, config, this.setData, this.getData, this.setOptions,
            this.hide, this.show, this.disable, this.enable, this.reset, formData])
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
          ['data', 'formConfig', 'setData', 'getData', 'setOptions',
            'hide', 'show', 'disable', 'enable', 'reset'],
          [this.data, config, this.setData, this.getData, this.setOptions,
            this.hide, this.show, this.disable, this.enable, this.reset])
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
            ['data', 'formConfig', 'setData', 'getData', 'setOptions',
              'hide', 'show', 'disable', 'enable', 'reset'],
            [this.data, config, this.setData, this.getData, this.setOptions,
              this.hide, this.show, this.disable, this.enable, this.reset])
        .call()
      }
    },
    /**
     * 数据初始化值钩子（在表单数据填充后加载）
     */
    handleSetData() {
      const { config } = this.value
      if (!config) {
        console.log('KFormBuild::handleSetData', 'config is undefined', this.config, this.dynamicData, this.value)
        return
      }
      const { handleSetData } = config
      if (handleSetData) {
        return createAsyncJsEnhanceFunction(
            this,
            handleSetData,
            ['data', 'formConfig', 'setData', 'getData', 'setOptions',
              'hide', 'show', 'disable', 'enable', 'reset'],
            [this.data, config, this.setData, this.getData, this.setOptions,
              this.hide, this.show, this.disable, this.enable, this.reset])
        .call()
      }
    },
    convertEmptyStringToNull(obj) {
      for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          this.convertEmptyStringToNull(obj[key]) // 递归处理嵌套对象
        } else if (obj[key] === '') {
          obj[key] = null // 将空字符串转换为 null
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
            const values = Object.assign({}, this.defaultValue, formValues)
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
    // 隐藏表单字段
    hide(fields) {
      this.setOptions(fields, 'hidden', true)
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
    }
  },
  mounted() {
    const that = this
    // 等待所有组件加载完成，再执行mounted
    lazyLoadTick.nextTick(async () => {
      console.log('KFormBuild::mounted', that.defaultValue)
      that.reset()
      try {
        await that.handleMounted()
      } catch (e) {
        that.$message.error('JS增强::handleMounted执行失败 ' + e)
        console.error('KFormBuild::handleMounted', e)
      }
      await that.setData(that.defaultValue)
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
