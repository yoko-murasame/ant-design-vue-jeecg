import { pluginManager } from "../../packages/utils/index";
import KCheckbox from '@comp/k-form-design/packages/components/KCheckbox/index.vue'
import KChangeOption from '@comp/k-form-design/packages/components/KChangeOption/index.vue'
const Input = pluginManager.getComponent("input").component;
const InputNumber = pluginManager.getComponent("number").component;
const Radio = pluginManager.getComponent("radio").component;
const RadioButton = pluginManager.getComponent("radioButton").component;
const Rate = pluginManager.getComponent("rate").component;

/**
 * 封装JSearchSelectTag的配置属性
 */
export default {
  name: 'JSearchSelectTagProperties',
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
      type: 'JSearchSelectTag'
    }
  },
  computed: {
    options() {
      return this.selectItem.options || {};
    },
    disableAsync() {
      if (this.options.dict && this.options.dict.split(',').length === 1) {
        return true
      }
      return false
    }
  },
  watch: {
    // 切换动态字典需要清除静态的配置项，要不组件会继续读取静态配置
    'selectItem.options.dictType': {
      immediate: true,
      handler(val) {
        if (val === 'dynamic') {
          this.options.dictOptions = []
        } else {
          // 静态数据时，需要清除async属性
          this.options.async = false
        }
      }
    },
    // 系统字典、表字典时，对async的控制，防止报错
    'selectItem.options.dict': {
      immediate: true,
      handler(val) {
        if (val) {
          const arr = val.split(',')
          if (arr.length === 1) {
            this.options.async = false
            console.info('检测到系统字典类型，自动关闭async')
          } else if (arr.length === 3 || arr.length === 4) {
            this.options.async = true
            console.info('检测到关联表字典类型，自动开启async')
          }
        }
      }
    }
  },
  render() {
    const options = this.options
    const disableAsync = this.disableAsync
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

    // 静态数据时，需要清除async属性
    if (options.dictType === 'static') {
      options.async = false
    }

    return (
      <div style={{ display: 'contents' }}>
        <a-form-item label={"组件模式"} help="">
          <Radio buttonStyle="solid" v-model={options.mode}>
            <RadioButton value={"default"}>单选</RadioButton>
            <RadioButton value={"multiple"}>多选</RadioButton>
            <RadioButton value={"tags"}>标签(保存输入的多选)</RadioButton>
            {/* <RadioButton value={"combobox"}>组合</RadioButton> */}
          </Radio>
        </a-form-item>
        <a-form-item label={"字典配置"} help="">
          <Radio buttonStyle="solid" v-model={options.dictType}>
            <RadioButton value={"static"}>静态</RadioButton>
            <RadioButton value={"dynamic"}>动态</RadioButton>
          </Radio>
          {
            options.dictType === 'dynamic' ?
              (
                <div style={{ display: 'contents' }}>
                  <br/>字典配置：
                  <Input vModel={options.dict} placeholder={"格式：dict_code 或 table_name,text_field,code_field"}/>
                  <div>系统字典的格式：dict_code，<b>务必注意使用系统字典时勿开启异步</b></div>
                  <div>关联表字典的格式：表名,文本字段,值字段</div>
                  <div>带条件搜索的格式：表名,文本字段,值字段,其他字段='条件可用%模糊搜索'</div>
                  <kCheckbox disabled={disableAsync} v-model={options.async} label="是否异步（建议开启，防止数据量太大）" />
                  {
                    options.async ?
                      (
                        <div style={{ display: 'contents' }}>
                          <br/>异步搜索每页数量：
                          <InputNumber step={1} min={1} max={1000} vModel={options.pageSize} placeholder={"异步搜索每页数量"}/>
                        </div>
                      ) : undefined
                  }
                </div>
              ):
              (
                <KChangeOption v-model={options.dictOptions} />
              )
          }
        </a-form-item>
        <a-form-item label={"其他属性"} help="">
          <kCheckbox v-model={options.keepInput} label="保留搜索结果的输入" />
          <kCheckbox v-model={options.disabled} label="禁用" />
        </a-form-item>
      </div>
    )
  }
}
