<template>
  <formitem-wapper :formitem="formitem">
    <j-multi-select-tag
      v-bind="widgetAttrs"
      v-decorator="[formitem.key,formitem.fieldDecoratorOptions]"
      :trigger-change="true"
      :placeholder="placeholder"
      :popContainer="popContainerString"
      :options="formitem.listSource">
    </j-multi-select-tag>
  </formitem-wapper>
</template>

<script>
  import { FormItemMixin } from './../FormItenMixin'
  import FormitemWapper from './../FormitemWapper.vue'

  export default {
    name: 'SelectMultiWidget',
    mixins: [FormItemMixin],
    components: {
      FormitemWapper
    }
  }
</script>

<style scoped>

</style>
