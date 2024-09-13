<template >
  <div ref="markedContent"></div>
</template>
<script>
import Vue from 'vue/dist/vue.esm.js'
import Antd from 'ant-design-vue'
Vue.use(Antd)
export default {
  name: 'DynamicTemplate',
  props: {
    templateContent: {
      type: String,
      default: ''
    }
  },
  // inheritAttrs: true,
  data () {
    return {
      comp: null
    }
  },
  mounted () {
    // console.log('模板初始化 out', this.$attrs, this.$props, this.$data)
    this.templateContent && this.compile()
  },
  methods: {
    compile () {
      // 变量html是生成好的vue格式的HTML模板字符串，
      // 这个模板里面可以包含各种vue的指令，数据绑定等操作，
      // 比如 v-if, :bind, @click 等。
      const html = this.templateContent

      const newProps = {}
      Object.keys(this.$attrs).map(key => {
        const v = this.$attrs[key]
        if (typeof v === 'string') {
          // 字符串
          newProps[key] = {
            type: String,
            default: ''
          }
        } else if (typeof v === 'number') {
          // 数字
          newProps[key] = {
            type: Number,
            default: null
          }
        } else if (typeof v === 'boolean') {
          // 布尔值
          newProps[key] = {
            type: Boolean,
            default: false
          }
        } else if (typeof v === 'function') {
          // 函数
          newProps[key] = {
            type: Function,
            default() {}
          }
        } else if (Object.prototype.toString.call(v) === '[object Array]') {
          // 数组
          newProps[key] = {
            type: Array,
            default: null
          }
        } else if (Object.prototype.toString.call(v) === '[object Object]') {
          // 对象
          newProps[key] = {
            type: Object,
            default: null
          }
        }
      })

      // Vue.extend是vue的组件构造器，专门用来构建自定义组件的，
      // 但是不会注册，类似于js中的createElement，
      // 创建但是不会添加。
      // 在这里创建出一个子组件对象构造器。
      const Component = Vue.extend({
        // 模板文件。由于Markdown解析之后可能会有多个根节点，
        // 因此需要包裹起来。
        // 实际的内容是：
        // `<div><img src="url" @click="showInfo(`图片文字')"></div>`
        template: `<div> ${html} </div>`,
        props: newProps,
        data() {
          return {
            name: '你好呀',
            ...this.$data
          }
        },
        // inheritAttrs: true,
        // 这里面写的就是这个动态生成的新组件中的方法了，
        // 当然你也可加上data、mounted、updated、watch、computed等等。
        methods: {
          // 上面模板中将点击事件绑定到了这里，因此点击了之后就会调用这个函数。
          // 你可以写多个函数在这里，但是这里的函数的作用域只限在这个子组件中。
          showInfo (title) {
            console.log(title)
          }
          // ...this.$listeners
        },
        mounted() {
          console.log('动态Vue模板初始化', this.$props)
        }
      })

      // console.log('newProps', newProps)

      // new Component()是将上面构建的组件对象给实例化，
      // $mount()是将实例化的组件进行手动挂载，
      // 将虚拟dom生成出实际渲染的dom，
      // 这里的markedComponent是完成挂载以后的子组件
      const component = new Component({
        // 注入上文的属性到props
        propsData: {
          ...this.$attrs
        }
        // props: newProps
      }).$mount()

      // 将挂载以后的子组件dom插入到父组件中
      // markedComponent.$el就是挂载后生成的渲染dom
      this.$refs['markedContent'].appendChild(component.$el)
    }
  }
  // 本质上来讲，这个子组件不是任何组件的子组件，
  // 它是由vue直接在全局动态生成的一个匿名组件，然后将它插入到当前位置的。
  // 也正是因此，它才能够完成动态的生成和添加。
}
</script>
