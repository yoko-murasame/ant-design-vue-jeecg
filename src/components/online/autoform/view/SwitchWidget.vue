<template>
  <formitem-wapper :formitem="formitem">
    <j-switch v-decorator="[formitem.key]" v-bind="widgetAttrs" :options="formitem.switchOptions"></j-switch>
  </formitem-wapper>
</template>

<script>
  import FormitemWapper from './../FormitemWapper.vue'
  import { FormItemMixin } from './../FormItenMixin'

  export default {
    name: 'SwitchWidget',
    mixins: [FormItemMixin],
    components: {
      FormitemWapper
    }

  }
</script>

<style scoped>

</style>
