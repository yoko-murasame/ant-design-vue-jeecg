<template>
  <formitem-wapper :formitem="formitem">
    <j-area-linkage
      type="cascader"
      v-bind="widgetAttrs"
      v-decorator="[formitem.key,formitem.fieldDecoratorOptions]"
      :placeholder="placeholder">
    </j-area-linkage>
  </formitem-wapper>
</template>

<script>
  import FormitemWapper from './../FormitemWapper.vue'
  import { FormItemMixin } from './../FormItenMixin'

  export default {
    name: 'PcaWidget',
    mixins: [FormItemMixin],
    components: {
      FormitemWapper
    }
  }
</script>
