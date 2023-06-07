<template>
  <j-search-select-tag
    v-bind="$attrs"
    v-on="$listeners"
    :dict-options="dictOptions"
    :value="bindValue"
    @change="onChange"
    :async="false" />
</template>
<script>
// 搜索字典扩展组件: 根据用户角色code获取字典选项
import { getAction } from '@api/manage';
import Vue from 'vue';
import { UI_CACHE_DB_DICT_DATA } from '@/store/mutation-types';

export default {
  name: 'JSearchSelectTagWithRoleCode',
  props: {
    // 角色编码
    roleCode: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: false
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  watch: {
    value: {
      handler () {
        this.bindValue = this.value
      },
      immediate: true
    }
  },
  data() {
    return {
      dictOptions: [],
      bindValue: ''
    }
  },
  created() {
    this.getDictOptions()
  },
  methods: {
    onChange(e) {
      this.bindValue = e
      this.$emit('change', e)
    },
    getDictOptions() {
      let dictItems = Vue.ls.get(UI_CACHE_DB_DICT_DATA)[this.dictCode];
      if (dictItems) {
        this.dictOptions = dictItems
        console.log('-----------load cache JSearchSelectTagWithRoleCode----------roleCode=' + this.roleCode + '---- dictItems=', dictItems)
        return
      }
      // 没有缓存就接口
      getAction('/sys/user/queryUsersByRoleCode', { roleCode: this.roleCode })
        .then(res => {
          this.dictOptions = res.result.map(e => ({ title: e.realname, value: e.username, text: e.realname }))
          Vue.ls.set(UI_CACHE_DB_DICT_DATA, { ...Vue.ls.get(UI_CACHE_DB_DICT_DATA), [this.dictCode]: this.dictOptions }, 7 * 24 * 60 * 60 * 1000)
        })
        .catch(err => this.$message.warning(err))
    }
  }
}
</script>
