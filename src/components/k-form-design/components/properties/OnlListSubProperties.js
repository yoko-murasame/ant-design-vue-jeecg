import { pluginManager } from '../../packages/utils/index'
import KCheckbox from '@comp/k-form-design/packages/components/KCheckbox/index.vue'
import KChangeOption from '@comp/k-form-design/packages/components/KChangeOption/index.vue'

const Input = pluginManager.getComponent('input').component
const InputNumber = pluginManager.getComponent('number').component
const Radio = pluginManager.getComponent('radio').component
const RadioButton = pluginManager.getComponent('radioButton').component
const Rate = pluginManager.getComponent('rate').component

/**
 * 封装OnlListSub的配置属性
 */
export default {
  name: 'OnlListSubProperties',
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
      type: 'OnlListSub'
    }
  },
  computed: {
    options() {
      return this.selectItem.options || {}
    }
  },
  watch: {
  },
  render() {
    const options = this.options

    // 如果不是当前组件，不显示属性配置
    if (this.type !== this.selectItem.type) {
      return (<div style={{ display: 'contents' }}></div>)
    }

    return (
      <div style={{ display: 'contents' }}>
        <a-form-item label={'Online表单编码'} help="">
          <Input vModel={options.onlineCode} placeholder={'Online表单编码'}/>
        </a-form-item>
        <a-form-item label={'主表主键字段名'} help="">
          <Input vModel={options.mainIdField} placeholder={'主表主键字段名'}/>
        </a-form-item>
        <a-form-item label={'子表外键字段名'} help="">
          <Input vModel={options.relIdField} placeholder={'子表外键字段名'}/>
        </a-form-item>
        <a-form-item label={'其他属性'} help="">
          <kCheckbox v-model={options.cardMode} label="卡片模式"/>
        </a-form-item>
      </div>
    )
  }
}
