import { pluginManager } from '../../packages/utils/index'
import KCheckbox from '@comp/k-form-design/packages/components/KCheckbox/index.vue'
import KChangeOption from '@comp/k-form-design/packages/components/KChangeOption/index.vue'
const Input = pluginManager.getComponent('input').component
const InputNumber = pluginManager.getComponent('number').component
const Radio = pluginManager.getComponent('radio').component
const RadioButton = pluginManager.getComponent('radioButton').component
const Rate = pluginManager.getComponent('rate').component

/**
 * 封装JMultiSelectTag的配置属性
 */
export default {
  name: 'JMultiSelectTagProperties',
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
      type: 'JMultiSelectTag'
    }
  },
  computed: {
    options() {
      return this.selectItem.options || {}
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
        <a-form-item label={'组件类型(type)'} help="">
          <Radio buttonStyle="solid" v-model={options.type}>
            <RadioButton value={'select'}>下拉框</RadioButton>
            <RadioButton value={'checkbox'}>多选框</RadioButton>
          </Radio>
        </a-form-item>
        <a-form-item label={'字典配置(options|dictCode)'} help="">
          <Radio buttonStyle="solid" v-model={options.dictType}>
            <RadioButton value={'static'}>静态</RadioButton>
            <RadioButton value={'dynamic'}>动态</RadioButton>
          </Radio>
          {
            options.dictType === 'dynamic'
              ? (
                <Input vModel={options.dictCode} placeholder={'格式：dict_code 或 table_name,code_field,text_field'}/>
              )
              : (
                <KChangeOption v-model={options.options} />
              )
          }
        </a-form-item>
        <a-form-item label={'其他属性'} help="">
          分隔符：<Input vModel={options.spliter} placeholder={'多个值的分隔符，默认逗号'}/>
          <kCheckbox v-model={options.allowClear} label="可清除(allowClear)" />
          <kCheckbox v-model={options.disabled} label="禁用(disabled)" />
          <kCheckbox v-model={options.triggerChange} label="是否触发change事件" />
        </a-form-item>
      </div>
    )
  }
}
