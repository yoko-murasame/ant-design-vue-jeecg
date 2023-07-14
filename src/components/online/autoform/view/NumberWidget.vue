<template>
  <formitem-wapper :formitem="formitem">
    <a-input-number
      :placeholder="placeholder"
      v-bind="getAttrs()"
      v-decorator="[formitem.key,formitem.fieldDecoratorOptions]"/>
  </formitem-wapper>
</template>

<script>
  import FormitemWapper from './../FormitemWapper.vue'
  import { FormItemMixin } from './../FormItenMixin'

  export default {
    name: 'NumberWidget',
    mixins: [FormItemMixin],
    components: {
      FormitemWapper
    },
    methods: {
      getAttrs() {
        let curWidgetAttr = this.widgetAttrs;
        let attr = {
          style: {
            width: '100%'
          },
          ...curWidgetAttr
        }
        if (this.formitem.onlyInteger) {
          attr['precision'] = 0
        } else {
          // update--begin--autor:lvdandan-----date:20201207------for：JT-40【online表单】数据库设置Integer类型页面可输入小数点；double、bigdecimal未根据数据库配置小数点校验
          attr['precision'] = this.formitem.formSchema.dbPointLength
          // update--begin--autor:lvdandan-----date:20201207------for：JT-40【online表单】数据库设置Integer类型页面可输入小数点；double、bigdecimal未根据数据库配置小数点校验
        }
        return attr
      }
    }

  }
</script>

<style scoped>

</style>
