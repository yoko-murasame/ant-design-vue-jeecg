<template>
  <formitem-wapper :formitem="formitem">
    <j-date
      :placeholder="placeholder"
      v-bind="getAttrs()"
      :trigger-change="true"
      :show-time="true"
      date-format="YYYY-MM-DD HH:mm:ss"
      :getCalendarContainer="getModalAsContainer"
      v-decorator="[formitem.key,formitem.fieldDecoratorOptions]">
    </j-date>
  </formitem-wapper>
</template>

<script>
  import FormitemWapper from './../FormitemWapper.vue'
  import { FormItemMixin } from './../FormItenMixin'

  export default {
    name: 'DatetimeWidget',
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
