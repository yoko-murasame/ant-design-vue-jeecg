<!--
<template>
  <component :is="component" :formData="formData" v-if="component" />
</template>
<script>
  export default {
    name: 'dynamic-link',
    props: ['formData', 'path'],
    data() {
      return {
        component: null,
      }
    },
    computed: {
      loader() {
        if (!this.path) {
          return null
        }
        return () => import(`@/${this.path}`)
      },
    },
    mounted() {
      let that = this
      that.loader().then(() => {
        that.component = () => that.loader()
        console.log("表单数据",this.formData)
        })
        .catch(() => {
          //that.component = () => import('./FormModule.vue')
        })
    },
  }
</script>
-->

<template>
  <component
    v-bind="$attrs"
    ref="realForm"
    :is="comp"
    @complete="handleComplete"
    :formData="formData"
    v-if="comp"
    form-bpm></component>
</template>
<script>
export default {
  name: 'DynamicLink',
  data () {
    return {
      compName: this.path
    }
  },
  computed: {
    comp: function () {
      console.log('BPM 组件名称：', this.compName)
      console.log('BPM 组件数据：', this.formData)
      return () => import(`@/views/${this.compName}.vue`)
    }
  },
  props: ['path', 'formData'],
  methods: {
    handleComplete (data) {
      console.log('BPM 组件监听到complete：', data)
      this.$emit('complete', data)
    }
  }
}
</script>
