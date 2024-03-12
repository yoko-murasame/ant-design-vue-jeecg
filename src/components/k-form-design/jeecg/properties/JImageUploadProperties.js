import { pluginManager } from "../../packages/utils/index";
import KCheckbox from '@comp/k-form-design/packages/components/KCheckbox/index.vue'
const Input = pluginManager.getComponent("input").component;
const InputNumber = pluginManager.getComponent("number").component;
const Radio = pluginManager.getComponent("radio").component;
const RadioButton = pluginManager.getComponent("radioButton").component;
const Rate = pluginManager.getComponent("rate").component;

/**
 * 封装JImageUpload的配置属性
 */
export default {
  name: 'JImageUploadProperties',
  components: {
    Input,
    Radio,
    RadioButton,
    Rate,
    InputNumber,
    KCheckbox
  },
  props: {
    selectItem: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      type: 'JImageUpload'
    }
  },
  computed: {
    options() {
      return this.selectItem.options || {};
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
        <a-form-item label={"上传时文件保存的相对路径"} help="">
          <Input vModel={options.bizPath} placeholder={"上传路径"} {...{ props, on: on }} />
        </a-form-item>
        <a-form-item label={"上传按钮的展示文本"} help="">
          <Input vModel={options.text} placeholder={"上传文件"}/>
        </a-form-item>
        <a-form-item label={"文件数量限制"} help="">
          <InputNumber min={1} vModel={options.number} placeholder={"文件数量限制，最小为1"}/>
        </a-form-item>
        <a-form-item label={"上传大小限制，单位MB，0标识不限制"} help="">
          <InputNumber min={0} vModel={options.limitSize} placeholder={"上传大小限制，单位MB，0标识不限制"}/>
        </a-form-item>
        <a-form-item label={"上传宽高限制，单位像素，0标识不限制"} help="">
          宽度：<InputNumber min={0} vModel={options.limitWidth} placeholder={"上传宽度限制，单位像素，0标识不限制"}/>
          &nbsp;高度：<InputNumber min={0} vModel={options.limitHeight} placeholder={"上传高度限制，单位像素，0标识不限制"}/>
        </a-form-item>
        <a-form-item label={"自定义上传接口"} help="">
          <Input vModel={options.customUploadAction} placeholder={"自定义上传接口"}/>
        </a-form-item>
        <div style={{ display: 'contents' }}>
          <a-form-item label={"是否启用图片压缩"} help="">
            <kCheckbox v-model={options.doCompress} label="是否启用图片压缩" />
          </a-form-item>
          {
            options.doCompress ?
              (
                <div style={{ display: 'contents' }}>
                  <a-form-item label={"压缩率（0.1-1），默认0.7"} help="">
                    <InputNumber step={0.1} min={0.1} max={1} vModel={options.zipPercent} placeholder={"压缩率"}/>
                  </a-form-item>
                  <a-form-item label={"超过多大的文件启用压缩，单位MB"} help="">
                    <InputNumber min={1} vModel={options.zipEnableSize} placeholder={"超过多大的文件启用压缩"}/>
                  </a-form-item>
                </div>
              ) :undefined
          }
        </div>
        <a-form-item label={"该组件的最大宽度限制（90vh、90px)"} help="">
          <Input vModel={options.visibleWidth} placeholder={"该组件的最大宽度限制"}/>
        </a-form-item>
        <a-form-item label={"该组件的最大图片展示数量限制"} help="">
          <InputNumber min={0} vModel={options.visibleNumber} placeholder={"该组件的最大图片展示数量限制"}/>
        </a-form-item>
        <a-form-item label={"自定义拼接url后缀（oss在线压缩）"} help="">
          <Input vModel={options.urlSuffix} placeholder={"x-oss-process=image/resize,w_120"}/>
        </a-form-item>
        <a-form-item label={"其他属性"} help="">
          <kCheckbox v-model={options.disabled} label="禁用" />
          <kCheckbox v-model={options.buttonVisible} label="是否显示上传按钮" />
        </a-form-item>
      </div>
    )
  }
}
