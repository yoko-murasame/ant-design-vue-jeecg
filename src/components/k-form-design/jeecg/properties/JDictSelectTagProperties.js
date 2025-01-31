import { pluginManager } from '../../packages/utils/index'
import KCheckbox from '@comp/k-form-design/packages/components/KCheckbox/index.vue'
import KChangeOption from '@comp/k-form-design/packages/components/KChangeOption/index.vue'

const Input = pluginManager.getComponent('input').component
const InputNumber = pluginManager.getComponent('number').component
const Radio = pluginManager.getComponent('radio').component
const RadioButton = pluginManager.getComponent('radioButton').component
const Rate = pluginManager.getComponent('rate').component

/**
 * 封装JDictSelectTag的配置属性
 */
export default {
  name: 'JDictSelectTagProperties',
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
      type: 'JDictSelectTag'
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
        <a-form-item label={'组件类型'} help="">
          <Radio buttonStyle="solid" v-model={options.type}>
            <RadioButton value={'select'}>下拉框</RadioButton>
            <RadioButton value={'radio'}>单选框</RadioButton>
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
                <Input vModel={options.dictCode}
                       placeholder={'格式：dict_code 或 table_name,text_field,code_field,可选的查询条件'} />
              )
              : (
                <KChangeOption v-model={options.options} />
              )
          }
        </a-form-item>
        <div>一些系统变量，通过{'#{}'}来使用：</div>
        <div>用户名：sys_user_name</div>
        <div>真实姓名：sys_user_code</div>
        <div>登陆部门：sys_org_code</div>
        <div>系统日期"yyyy-MM-dd"：sys_date</div>
        <div>系统时间"yyyy-MM-dd HH:mm"：sys_time</div>
        <a-form-item label={'其他属性'} help="">
          {/* <Input vModel={options.placeholder} placeholder={"placeholder"}/> */}
          <kCheckbox v-model={options.allowClear} label="可清除(allowClear)" />
          <kCheckbox v-model={options.disabled} label="禁用(disabled)" />
          <kCheckbox v-model={options.triggerChange} label="是否触发change事件" />
        </a-form-item>
      </div>
    )
  }
}
