<template>
  <formitem-wapper :formitem="formitem">
    <a-textarea
      :placeholder="placeholder"
      v-bind="getAttrs()"
      v-decorator="[formitem.key,formitem.fieldDecoratorOptions]"/>
  </formitem-wapper>
</template>

<script>
  import FormitemWapper from './../FormitemWapper.vue'
  import { FormItemMixin } from './../FormItenMixin'

  export default {
    name: 'TextareaWidget',
    mixins: [FormItemMixin],
    components: {
      FormitemWapper
    },
    methods: {
      getAttrs() {
        let curWidgetAttr = this.widgetAttrs;
        return {
          rows: 4,
          ...curWidgetAttr
        }
      }
    }

  }
</script>

<style scoped>

</style>
