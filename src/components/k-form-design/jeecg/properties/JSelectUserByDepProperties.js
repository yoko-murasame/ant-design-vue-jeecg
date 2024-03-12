import { pluginManager } from "../../packages/utils/index";
import KCheckbox from '@comp/k-form-design/packages/components/KCheckbox/index.vue'
import KChangeOption from '@comp/k-form-design/packages/components/KChangeOption/index.vue'
const Input = pluginManager.getComponent("input").component;
const InputNumber = pluginManager.getComponent("number").component;
const Radio = pluginManager.getComponent("radio").component;
const RadioButton = pluginManager.getComponent("radioButton").component;
const Rate = pluginManager.getComponent("rate").component;

/**
 * 封装JMultiSelectTag的配置属性
 */
export default {
  name: 'JSelectUserByDepProperties',
  components: {
    Input,
    Radio,
    RadioButton,
    Rate,
    InputNumber,
    KCheckbox,
    KChangeOption
  },
  props: {
    selectItem: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      type: 'JSelectUserByDep'
    }
  },
  computed: {
    options() {
      return this.selectItem.options || {};
    }
  },
  watch: {
    // 切换动态字典需要清除静态的配置项，要不组件会继续读取静态配置
    'selectItem.options.dictType': {
      immediate: true,
      handler(val) {
        if (val === 'dynamic') {
          this.options.options = []
        }
      }
    }
  },
  render() {
    const options = this.options
    // 可选的将自定义props绑定到子组件
    const props = {
      selectItem: this.selectItem
    }
    // 可选的将自定义事件绑定子组件
    const on = {
      select: obj => {
        console.log('select', obj)
        this.$emit('select', obj)
      },
      click: obj => {
        console.log('click', obj)
        this.$emit('click', obj)
      }
    }

    // 如果不是当前组件，不显示属性配置
    if (this.type !== this.selectItem.type) {
      return (<div style={{ display: 'contents' }}></div>)
    }

    return (
      <div style={{ display: 'contents' }}>
        <a-form-item label={"宽度"} help="">
          <InputNumber step={1} min={1} max={3000} vModel={options.modalWidth} placeholder={"组件宽度"}/>
        </a-form-item>
        <a-form-item label={"文本字段"} help="">
          <Input vModel={options.text} placeholder={"显示的文本字段名称"}/>
        </a-form-item>
        <a-form-item label={"存储字段"} help="">
          <Input vModel={options.store} placeholder={"存储的字段名称"}/>
        </a-form-item>
        <a-form-item label={"配置属性"} help="">
          <kCheckbox v-model={options.multi} label="多选" />
          <kCheckbox v-model={options.backUser} label="@back钩子" />
        </a-form-item>
      </div>
    )
  }
}
