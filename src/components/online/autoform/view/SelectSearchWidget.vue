<template>
  <formitem-wapper :formitem="formitem">
    <j-search-select-tag
      async
      v-bind="widgetAttrs"
      v-decorator="[formitem.key,formitem.fieldDecoratorOptions]"
      :dict="getDictInfo"
      :dict-code="getDictInfo"
      :trigger-change="true"
      :popContainer="popContainerString"
      :placeholder="placeholder">
    </j-search-select-tag>

  </formitem-wapper>
</template>

<script>
import FormitemWapper from './../FormitemWapper.vue'
import { FormItemMixin } from './../FormItenMixin'

export default {
    name: 'SelectSearchWidget',
    mixins: [FormItemMixin],
    components: {
      FormitemWapper
    },
    computed: {
      // update-start -- author:sunjianlei -- date:20200115 -- for: 下拉搜索表字典参数配置有误时会导致页面崩溃，换成计算属性就没事
      getDictInfo() {
        // 直接支持配置表字典到code字段
        if (!this.formitem.dictCode) {
          this.$message.warning('表字典搜索组件参数接收有误,请检查字典配置!');
          return
        }
        if ((!this.formitem.dictTable && this.formitem.dictText) || (this.formitem.dictTable && !this.formitem.dictText)) {
          this.$message.warning('表字典搜索组件参数接收有误,请检查字典配置!');
          return
        }

        let tableName = ''
        let sql = ''
        if (this.formitem.dictTable.indexOf('where') > 0) {
          let arr = this.formitem.dictTable.split('where')
          sql = ',' + encodeURIComponent(arr[1])
          tableName = arr[0].trim()
        } else {
          tableName = this.formitem.dictTable
        }
        // 直接支持配置表字典到code字段
        if (tableName) {
          return tableName + ',' + this.formitem.dictText + ',' + this.formitem.dictCode + sql
        } else {
          return this.formitem.dictCode
        }
      }
      // update-end -- author:sunjianlei -- date:20200115 -- for: 下拉搜索表字典参数配置有误时会导致页面崩溃，换成计算属性就没事
    }
  }
</script>
