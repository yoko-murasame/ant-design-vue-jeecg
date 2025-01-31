<template>

  <a-select
    v-if="async"
    showSearch
    labelInValue
    :disabled="disabled"
    :getPopupContainer="getParentContainer"
    @search="loadData"
    :placeholder="placeholder"
    v-model="selectedAsyncValue"
    style="width: 100%"
    :filterOption="false"
    @change="handleAsyncChange"
    allowClear
    :notFoundContent="loading ? undefined : null"
    :mode="mode"
  >
    <a-spin v-if="loading" slot="notFoundContent" size="small"/>
    <a-select-option v-for="d in options" :key="d.value" :value="d.value">{{ d.text }}</a-select-option>
  </a-select>

  <a-select
    v-else
    :getPopupContainer="getParentContainer"
    showSearch
    :disabled="disabled"
    :placeholder="placeholder"
    optionFilterProp="children"
    style="width: 100%"
    @change="handleChange"
    :filterOption="filterOption"
    v-model="selectedValue"
    allowClear
    :notFoundContent="loading ? undefined : null"
    :mode="mode">
    <a-spin v-if="loading" slot="notFoundContent" size="small"/>
    <a-select-option v-for="d in options" :key="d.value" :value="d.value">{{ d.text }}</a-select-option>
  </a-select>

</template>

<script>
import { ajaxGetDictItems, getDictItemsFromCache } from '@/api/api'
import { uniqWith } from 'lodash'
import debounce from 'lodash/debounce'
import { getAction } from '../../api/manage'

export default {
    name: 'JSearchSelectTag',
    props: {
      disabled: Boolean,
      value: [String, Number],
      dictOptions: Array,
      async: Boolean,
      // 是否保留输入值
      keepInput: {
        type: [Boolean, String],
        default: false,
        required: false
      },
      placeholder: {
        type: String,
        default: '请选择',
        required: false
      },
      dict: {
        type: String,
        default: '',
        required: false
      },
      dictCode: {
        type: String,
        default: '',
        required: false
      },
      popContainer: {
        type: String,
        default: '',
        required: false
      },
      pageSize: {
        type: Number,
        default: 10,
        required: false
      },
      getPopupContainer: {
        type: Function,
        default: null
      },
      mode: {
        type: String,
        default: ''
      }
    },
    data() {
      this.initDictData = debounce(this.initDictData, 200)
      this.loadData = debounce(this.loadData, 200)// 消抖
      this.lastLoad = 0
      return {
        loading: false,
        selectedValue: undefined, // [],
        selectedAsyncValue: undefined, // [],
        options: []
      }
    },
    created() {
      // this.initDictData()
    },
    watch: {
      'value': {
        immediate: true,
        handler(val) {
          if (!val) {
            this.selectedValue = undefined // []
            this.selectedAsyncValue = undefined // []
            // if (val == 0) {
            //   this.initSelectValue()
            // } else {
            //   this.selectedValue = undefined // []
            //   this.selectedAsyncValue = undefined // []
            // }
          } else {
            this.initSelectValue()
          }
        }
      },
      'dict': {
        immediate: true,
        handler(val) {
          val && this.initDictData()
        }
      },
      'dictCode': {
        immediate: true,
        handler(val) {
          val && this.initDictData()
        }
      },
      'dictOptions': {
        deep: true,
        immediate: true,
        handler(val) {
          if (val && val.length > 0) {
            this.options = [...val]
          }
        }
      }
    },
    methods: {
      initSelectValue() {
        const realDict = this.dictCode || this.dict
        if (this.async) {
          if (!this.selectedAsyncValue || !this.selectedAsyncValue.key || this.selectedAsyncValue.key !== this.value) {
            console.log('这才请求后台')
            // update-begin-author:taoyan date:20220112 for: 方法initSelectValue 根据下拉框实际值查询下拉框的显示的文本 因后台接口只处理3个参数，所以将过滤条件去掉
            // TODO 隐患 查询效率问题 还是应该在后台作筛选
            let itemDictStr = realDict
            let arr = itemDictStr.split(',')
            if (arr && arr.length === 4) {
              // 删除最后一个元素
              arr.pop()
              itemDictStr = arr.join(',')
            }
            // update-end-author:taoyan date:20220112 for: 方法initSelectValue 根据下拉框实际值查询下拉框的显示的文本 因后台接口只处理3个参数，所以将过滤条件去掉
            getAction(`/sys/dict/loadDictItem/${itemDictStr}`, { key: this.value }).then(res => {
              if (res.success) {
                // update-begin---author:wangshuai ---date:20221115  for：[issues/4213]JSearchSelectTag改造支持多选------------
                // 判断是否多选
                if (this.mode === 'multiple') {
                  if (this.keepInput) {
                    let itemArray = []
                    let valueArray = this.value.split(',')
                    for (let i = 0; i < valueArray.length; i++) {
                      itemArray.push({
                        key: valueArray[i],
                        label: res.result[i] || valueArray[i]
                      })
                    }
                    this.selectedAsyncValue = uniqWith(itemArray, (a, b) => (a.key !== '' && a.key === b.key))
                  } else {
                    if (res.result && res.result.length > 0) {
                      let itemArray = []
                      let valueArray = this.value.split(',')
                      for (let i = 0; i < res.result.length; i++) {
                        itemArray.push({
                          key: valueArray[i],
                          label: res.result[i]
                        })
                      }
                      this.selectedAsyncValue = itemArray
                    } else {
                      this.selectedAsyncValue = undefined // []
                      this.selectedValue = undefined // []
                    }
                  }
                } else if (this.mode === 'tags') {
                  // 标签模式一定需要保留输入
                  let itemArray = []
                  let valueArray = this.value.split(',')
                  for (let i = 0; i < valueArray.length; i++) {
                    itemArray.push({
                      key: valueArray[i],
                      label: res.result[i] || valueArray[i]
                    })
                  }
                  this.selectedAsyncValue = uniqWith(itemArray, (a, b) => (a.key !== '' && a.key === b.key))
                } else {
                  let obj = {
                    key: this.value,
                    label: res.result
                  }
                  this.selectedAsyncValue = { ...obj }
                }
                // update-end---author:wangshuai ---date:20221115  for：[issues/4213]JSearchSelectTag改造支持多选--------------
              }
            })
          }
        } else {
          // update-begin---author:wangshuai ---date:20221115  for：[issues/4213]JSearchSelectTag改造支持多选------------
          // 判断是否为多选
          if (this.mode === 'multiple') {
            if (this.value) {
              this.selectedValue = this.value.split(',')
            } else {
              this.selectedValue = undefined // []
            }
          } else if (this.mode === 'tags') {
            if (this.value) {
              this.selectedValue = this.value.split(',')
            } else {
              this.selectedValue = undefined // []
            }
          } else {
            this.selectedValue = this.value.toString()
          }
          // update-end---author:wangshuai ---date:20221115  for：[issues/4213]JSearchSelectTag改造支持多选------------
        }
      },
      loadData(value) {
        console.log('数据加载', value)
        this.lastLoad += 1
        const currentLoad = this.lastLoad
        this.options = []
        this.loading = true
        // 字典code格式：table,text,code
        let realDict = this.dictCode || this.dict
        // 非正确长度校验
        const dictArr = realDict.split(',')
        if (![1, 3, 4].includes(dictArr.length)) {
          console.warn('字典配置格式错误，请检查字典项配置')
          return
        }
        // 搜索条件统一放入header
        let headers = { 'X-FILTER-SQL': '' }
        if (dictArr.length === 4) {
          headers['X-FILTER-SQL'] = dictArr.pop()
          realDict = dictArr.join(',')
        }
        getAction(`/sys/dict/loadDict/${realDict}`, { keyword: value, pageSize: this.pageSize }, headers).then(res => {
          this.loading = false
          if (res.success) {
            if (currentLoad !== this.lastLoad) {
              return
            }
            // 是否保留输入值
            if (this.mode === 'multiple') {
              if (this.keepInput) {
                const options = value.split(',').map(item => ({ text: item, title: item, value: item }))
                // res.result的值需要拆分成列表
                const allValues = res.result.reduce((pre, cur) => {
                  if (cur === null) {
                    return pre
                  }
                  const values = cur.value.split(',')
                  const texts = cur.text && cur.text.split(',') || []
                  const titles = cur.title && cur.title.split(',') || []
                  for (let i = 0; i < values.length; i++) {
                    values[i] && pre.push({ text: texts[i], title: titles[i], value: values[i] })
                  }
                  return pre
                }, [])
                this.options = uniqWith([...options, ...allValues], (a, b) => (a.value !== '' && a.value === b.value))
              } else {
                this.options = res.result
              }
            } else if (this.mode === 'tags') {
              // 标签模式一定需要保留输入
              const options = value.split(',').map(item => ({ text: item, title: item, value: item }))
              // res.result的值需要拆分成列表
              const allValues = res.result.reduce((pre, cur) => {
                if (cur === null) {
                  return pre
                }
                const values = cur.value.split(',')
                const texts = cur.text && cur.text.split(',') || []
                const titles = cur.title && cur.title.split(',') || []
                for (let i = 0; i < values.length; i++) {
                  values[i] && pre.push({ text: texts[i], title: titles[i], value: values[i] })
                }
                return pre
              }, [])
              this.options = uniqWith([...options, ...allValues], (a, b) => (a.value !== '' && a.value === b.value))
            } else {
              if (this.keepInput) {
                this.options = [{ text: value, title: value, value: value }, ...res.result]
              } else {
                this.options = res.result
              }
            }
            console.log('我是第一个', res)
          } else {
            this.$message.warning(res.message)
          }
        })
      },
      initDictData() {
        let realDict = this.dictCode || this.dict
        if (!this.async) {
          // 如果字典项集合有数据
          if (this.dictOptions && this.dictOptions.length > 0) {
            this.options = [...this.dictOptions]
          } else {
            // 根据字典Code, 初始化字典数组
            let dictStr = ''
            if (realDict) {
                let arr = realDict.split(',')
                if (arr[0].indexOf('where') > 0) {
                  let tbInfo = arr[0].split('where')
                  dictStr = tbInfo[0].trim() + ',' + arr[1] + ',' + arr[2] + ',' + encodeURIComponent(tbInfo[1])
                } else {
                  dictStr = realDict
                }
                if (realDict.indexOf(',') === -1) {
                  // 优先从缓存中读取字典配置
                  if (getDictItemsFromCache(realDict)) {
                    this.options = getDictItemsFromCache(realDict)
                    return
                  }
                }
                ajaxGetDictItems(dictStr, null).then((res) => {
                  if (res.success) {
                    this.options = res.result
                  }
                })
            }
          }
        } else {
          if (!realDict) {
            console.error('搜索组件未配置字典项')
          } else {
            // 异步一开始也加载一点数据
            this.loading = true
            // 非正确长度校验
            const dictArr = realDict.split(',')
            if (![1, 3, 4].includes(dictArr.length)) {
              console.warn('字典配置格式错误，请检查字典项配置')
              return
            }
            // 搜索条件统一放入header
            let headers = { 'X-FILTER-SQL': '' }
            if (dictArr.length === 4) {
              headers['X-FILTER-SQL'] = dictArr.pop()
              realDict = dictArr.join(',')
            }
            getAction(`/sys/dict/loadDict/${realDict}`, { pageSize: this.pageSize, keyword: '' }, headers).then(res => {
              this.loading = false
              if (res.success) {
                if (this.mode === 'multiple' || this.mode === 'tags') {
                  // 标签模式，每个项都得分离
                  const allValues = this.options = res.result.reduce((pre, cur) => {
                    if (cur === null) {
                      return pre
                    }
                    const values = cur.value.split(',')
                    const texts = cur.text && cur.text.split(',') || []
                    const titles = cur.title && cur.title.split(',') || []
                    const labels = cur.label && cur.label.split(',') || []
                    for (let i = 0; i < values.length; i++) {
                      values[i] && pre.push({ text: texts[i], title: titles[i], value: values[i], label: labels[i] })
                    }
                    return pre
                  }, [])
                  this.options = uniqWith(allValues, (a, b) => (a.value !== '' && a.value === b.value))
                } else {
                  this.options = uniqWith(res.result, (a, b) => (a.value !== '' && a.value === b.value))
                }
              } else {
                this.$message.warning(res.message)
              }
            })
          }
        }
      },
      filterOption(input, option) {
        return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      },
      handleChange (selectedValue) {
        console.log('selectedValue', selectedValue)
        this.selectedValue = selectedValue
        this.callback()
      },
      handleAsyncChange(selectedObj) {
        // update-begin-author:scott date:20201222 for:【搜索】搜索查询组件，删除条件，默认下拉还是上次的缓存数据，不好 JT-191
        if (selectedObj) {
          this.selectedAsyncValue = selectedObj
          // update-begin---author:wangshuai ---date:20221115  for：[issues/4213]JSearchSelectTag改造支持多选------------
          if (this.mode === 'multiple') {
            let keyArray = []
            for (let i = 0; i < selectedObj.length; i++) {
              keyArray.push(selectedObj[i].key)
            }
            this.selectedValue = keyArray
          } else if (this.mode === 'tags') {
            let keyArray = []
            for (let i = 0; i < selectedObj.length; i++) {
              keyArray.push(selectedObj[i].key)
            }
            this.selectedValue = keyArray
          } else {
            this.selectedValue = selectedObj.key
          }
          // update-end---author:wangshuai ---date:20221115  for：[issues/4213]JSearchSelectTag改造支持多选------------
        } else {
          this.selectedAsyncValue = null
          this.selectedValue = null
          this.options = null
          this.loadData('')
        }
        this.callback()
        // update-end-author:scott date:20201222 for:【搜索】搜索查询组件，删除条件，默认下拉还是上次的缓存数据，不好 JT-191
      },
      callback() {
        // update-begin---author:wangshuai ---date:20221115  for：[issues/4213]JSearchSelectTag改造支持多选------------
        if (this.mode === 'multiple') {
          this.$emit('change', this.selectedValue.join(','))
        } else if (this.mode === 'tags') {
          this.$emit('change', this.selectedValue.join(','))
        } else {
          this.$emit('change', this.selectedValue)
        }
        // update-end---author:wangshuai ---date:20221115  for：[issues/4213]JSearchSelectTag改造支持多选------------
      },
      setCurrentDictOptions(dictOptions) {
        this.options = dictOptions
      },
      getCurrentDictOptions() {
        return this.options
      },
      getParentContainer(node) {
        if (typeof this.getPopupContainer === 'function') {
          return this.getPopupContainer(node)
        } else if (!this.popContainer) {
          return node.parentNode
        } else {
          return document.querySelector(this.popContainer)
        }
      }

    },
    model: {
      prop: 'value',
      event: 'change'
    }
  }
</script>

<style scoped>

</style>
