import { pluginManager } from '../../packages/utils/index'
import KCheckbox from '@comp/k-form-design/packages/components/KCheckbox/index.vue'
import KChangeOption from '@comp/k-form-design/packages/components/KChangeOption/index.vue'
import { MODE_LINE, MODE_POINT, MODE_POLYGON } from '@comp/k-form-design/components/skyMap/mapLoction'

const Input = pluginManager.getComponent("input").component;
const InputNumber = pluginManager.getComponent("number").component;
const Radio = pluginManager.getComponent("radio").component;
const RadioButton = pluginManager.getComponent("radioButton").component;
const Rate = pluginManager.getComponent("rate").component;

/**
 * 封装JDictSelectTag的配置属性
 */
export default {
  name: 'JSelectMapProperties',
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
      type: 'skyMap'
    }
  },
  computed: {
    options() {
      return this.selectItem.options || {};
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
        <a-form-item label={"组件模式"} help="">
          <Radio buttonStyle="solid" v-model={options.mode}>
            <RadioButton value={MODE_POINT}>点模式</RadioButton>
            <RadioButton value={MODE_LINE}>线模式</RadioButton>
            <RadioButton value={MODE_POLYGON}>面模式</RadioButton>
          </Radio>
        </a-form-item>
        <a-form-item label={"地图程序iframe地址"} help="">
          <Input vModel={options.mapUrl} placeholder={"地图程序iframe地址（基座已集成，无需额外部署）"} />
        </a-form-item>
        <a-form-item label={"格式化精度"} help="">
          <InputNumber min={0} vModel={options.precision} placeholder={"经纬度格式化精度，最小为0"} />
        </a-form-item>
        <a-form-item label={"其他属性"} help="">
          {/*<Input vModel={options.placeholder} placeholder={"placeholder"}/>*/}
          <kCheckbox v-model={options.allowClear} label="可清除" />
          <kCheckbox v-model={options.disabled} label="禁用" />
          <kCheckbox v-model={options.triggerChange} label="是否触发change事件" />
        </a-form-item>
      </div>
    )
  }
}
