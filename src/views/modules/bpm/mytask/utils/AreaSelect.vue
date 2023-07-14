<template>
  <a-cascader
    :placeholder="placeholder"
    :options="dictOptions"
    :fieldNames="fieldNames"
    v-model="innerCode"
    @change="onChange"></a-cascader>
</template>

<script>
import { getAction } from '@api/manage'
import Vue from 'vue'

/**
 * 封装区域、街道组件
 * @author yoko
 * 使用：
 * 1.import AreaSelect from '@views/modules/bpm/mytask/utils/AreaSelect'
 * 2.父子联动-父亲, 注意areaCode是一个状态值需要传给儿子
 *               <area-select
 *                 v-decorator="['ssqy', validatorRules.ssqy]"
 *                 type="street"
 *                 parent-code="3303"
 *                 placeholder="请选择"
 *                 @change="e => areaCode=e"></area-select>
 * 3.父子联动-儿子, 注意areaCode来自父组件改变
 *               <area-select
 *                 v-decorator="['ssjd', validatorRules.ssjd]"
 *                 type="street"
 *                 :parent-code="areaCode"
 *                 placeholder="请选择"></area-select>
 * 4.双向绑定方式
 * <area-select type="street" parent-code="3303" placeholder="请选择" v-model="queryParam.ssqy"></area-select>
 * <area-select type="street" :parent-code="queryParam.ssqy" placeholder="请选择" v-model="queryParam.ssjd"></area-select>
 */
export default {
  name: 'AreaSelect',
  model: {
    // 想要被v-decorator识别必须叫 value, 然后监听value的改变
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: String
    },
    // area、street
    type: {
      type: String,
      default: 'street'
    },
    parentCode: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    debug: {
      type: [String, Boolean],
      default: false
    }
  },
  created() {
    this.init()
  },
  watch: {
    parentCode: {
      handler(val) {
        if (val && this.type === 'street') {
          this.initStreet()
        }
      }
    },
    value: {
      immediate: true,
      async handler() {
        if (!this.dictOptions.length) {
          await this.init()
        }
        if (this.type === 'street') {
          if (this.value && this.parentCode) {
            this.innerCode = [this.value]
          } else {
            this.innerCode = null
          }
        }
        if (this.type === 'area') {
          // 初始化值
          const parent = this.dictOptions.filter(e => this.value.indexOf(e.regionCode === 0))[0] || { regionCode: '3303' }
          this.innerCode = [parent.regionCode, this.value]
        }
        this.debug && console.log('code', this.value, this.parentCode, this.innerCode)
      }
    }
  },
  data() {
    return {
      innerCode: null,
      dictOptions: [],
      url: {
        getArea: '/om/sz/dict/areaList',
        getStreet: '/om/sz/dict/childList/'
      },
      fieldNames: { label: 'regionName', value: 'regionCode', children: 'children' }
    }
  },
  methods: {
    async init() {
      if (this.type === 'area') {
        await this.initArea()
      }
      if (this.type === 'street') {
        await this.initStreet()
      }
    },
    onChange(e) {
      this.$emit('change', e[e.length - 1])
    },
    async initArea() {
      const dictOptions = Vue.ls.get('sz_area') || []
      if (dictOptions.length === 0) {
        const { result, success, message } = await getAction(this.url.getArea)
        !success && this.$message.error(message)
        success && Vue.ls.set('sz_area', dictOptions)
        this.dictOptions = result
      } else {
        this.dictOptions = dictOptions
      }
    },
    async initStreet() {
      if (!this.parentCode) {
        this.debug && console.error('请传入parentCode')
        return
      }
      const { result, success, message } = await getAction(this.url.getStreet + this.parentCode)
      !success && this.$message.error(message)
      this.dictOptions = result.map(e => !e.children ? delete e.children && e : e)
    }
  }
}
</script>
