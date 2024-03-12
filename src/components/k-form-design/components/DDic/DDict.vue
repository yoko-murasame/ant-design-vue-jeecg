<template>
  <div>
    <a-select v-if="record.options.multiple" v-model:value="selectValues" :options="options" mode="multiple"
      placeholder="请选择" style="width: 100%" @change="handleChange">

    </a-select>
    <a-select v-else v-model:value="selectValues" :options="options" placeholder="请选择" style="width: 100%"
      @change="handleChange">

    </a-select>
  </div>
</template>
<script>
import { getAction } from '@/api/manage'

export default {
  name: "DDic",
  props: {
    record: {
      type: Object,
      required: true
    },
    value: {
      type: String,
      default: () => null
    }
  },
  data() {
    return {
      url: {
        dataSource: '/sys/dict/getDictItems',
      },
      options: [],
      selectValues: null
    }
  },
  created() {
    console.log("字典初始化")
    this.initDataSource()

  },
  methods: {
    // 初始化数据源
    initDataSource() {
    console.log("字典初始化")
      // 1:静态数据源，2：字典数据源，3：表单数据源

      if (this.record.options.dicDynamic >= 2) {
        if (this.record.options.dynamicKeyTable.length > 0) {
          let key = this.record.options.dynamicKeyTable
          if (this.record.options.dynamicKeyCode.length > 0 && this.record.options.dicDynamic === 3) {
            key += `,${this.record.options.dynamicKeyText},${this.record.options.dynamicKeyCode}`
          }

          getAction(`${this.url.dataSource}/${key}`)
            .then(res => {
              this.options = res.result
              // this.setValue([])

            })
        }
      }
    },
    handleChange(value) {
      this.selectValues = value
      this.changeValue()
    },
    setValue(value) {
    console.log("setValue",value)
      this.selectValues = []
      // 数据值处理
      if (value != null && value != "") {
        let values = value.split(',')
        if (values.length > 1) {
          this.selectValues = [...values]
        } else {
          this.selectValues = values
        }
      }
    },
    changeValue(){
      let val=this.selectValues.toString()
      this.$emit('change', val)
    }
  },
  watch:{
    'value': {
        immediate: true,
        handler(val) {
         this.value=val
         this.setValue(val)
        }
      },
  }

};
</script>
  