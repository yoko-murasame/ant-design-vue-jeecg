<template>
  <formitem-wapper :formitem="formitem">
    <j-time
      :placeholder="placeholder"
      v-bind="getAttrs()"
      v-decorator="[formitem.key,formitem.fieldDecoratorOptions]"
      :getCalendarContainer="getModalAsContainer">
    </j-time>
  </formitem-wapper>
</template>

<script>
  import { FormItemMixin } from './../FormItenMixin'
  import FormitemWapper from './../FormitemWapper.vue'

  export default {
    name: 'TimeWidget',
    mixins: [FormItemMixin],
    components: {
      FormitemWapper
    },
    methods: {
      getAttrs() {
        let curWidgetAttr = this.widgetAttrs;
        if (!curWidgetAttr) {
          return {
            style: {
              width: '100%'
            }
          }
        } else {
          return {
            style: {
              width: '100%'
            },
            readOnly: !(!curWidgetAttr.disabled),
            ...curWidgetAttr
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>
