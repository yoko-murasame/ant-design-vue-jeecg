import KChangeOption from '@comp/k-form-design/packages/components/KChangeOption/index.vue'
import KCheckbox from '@comp/k-form-design/packages/components/KCheckbox/index.vue'
import { pluginManager } from '../../packages/utils/index'

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
  watch: {},
  render() {
    const options = this.options

    // 如果不是当前组件，不显示属性配置
    if (this.type !== this.selectItem.type) {
      return (<div style={{ display: 'contents' }}></div>)
    }

    return (
      <div style={{ display: 'contents' }}>
        <a-form-item label={'关联Online子表表单'} help="">
          {/* <Input vModel={options.onlineCode} placeholder={'关联Online表单'}/> */}
          <jSearchSelectTag
            placeholder={'关联Online子表表单'}
            vModel={options.onlineCode}
            dict="onl_cgform_head,table_txt,id"/>
        </a-form-item>
        <a-form-item label={'online子表外键字段'} help="">
          {/* <Input vModel={options.relIdField} placeholder={'子表外键字段名'}/> */}
          <jSearchSelectTag
            disabled={!options.onlineCode}
            placeholder={'online子表外键字段'}
            vModel={options.relIdField}
            dict={"onl_cgform_field,db_field_txt,db_field_name,cgform_head_id='" + options.onlineCode + "'"}/>
        </a-form-item>
        <a-form-item label={'online主表主键字段名'} help="">
          <Input vModel={options.mainIdField} placeholder={'online主表主键字段名'}/>
        </a-form-item>
        <a-form-item label={'其他属性'} help="">
          <kCheckbox v-model={options.cardMode} label="卡片模式"/>
          <kCheckbox v-model={options.bordered} label="边框"/>
        </a-form-item>
        <a-form-item label={'圆角值'} help="">
          <Input vModel={options.borderRadius} placeholder={'圆角值'}/>
        </a-form-item>
        <a-form-item label={'卡片样式设置'} help="">
          <Input vModel={options.cardStyle} placeholder={'卡片样式设置'}/>
        </a-form-item>
      </div>
    )
  }
}
