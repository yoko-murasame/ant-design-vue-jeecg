import { pluginManager } from "../../packages/utils/index";
import KCheckbox from '@comp/k-form-design/packages/components/KCheckbox/index.vue'
const Input = pluginManager.getComponent("input").component;
const InputNumber = pluginManager.getComponent("number").component;
const Radio = pluginManager.getComponent("radio").component;
const RadioButton = pluginManager.getComponent("radioButton").component;
const Rate = pluginManager.getComponent("rate").component;

import { FILE_TYPE_ALL, FILE_TYPE_TXT, FILE_TYPE_IMG, FILE_TYPE_VIDEO } from '@comp/yoko/mixins/ImageZipCompressMixin'

/**
 * 封装JUploadKnowledge的配置属性
 */
export default {
  name: 'JUploadKnowledgeProperties',
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
      type: 'JUploadKnowledge'
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

    console.log('上传类型', options.fileType, FILE_TYPE_IMG , options.fileType === FILE_TYPE_IMG)

    return (
      <div style={{ display: 'contents' }}>
        <a-form-item label={"关联知识库树型路径"} help="">
          <Input vModel={options.knowledgePath} placeholder={"关联知识库树型路径，如：目录a,目录b,目录c"} {...{ props }} />
          <kCheckbox v-model={options.showTagsDialog} label="是否开启打标签弹框" />
        </a-form-item>
        <a-form-item label={"上传时文件保存的相对路径"} help="">
          <Input vModel={options.bizPath} placeholder={"上传路径"} {...{ props, on: on }} />
        </a-form-item>
        <a-form-item label={"上传按钮的展示文本"} help="">
          <Input vModel={options.text} placeholder={"上传文件"}/>
        </a-form-item>
        <a-form-item label={"上传类型"} help="">
          <Radio buttonStyle="solid" v-model={options.fileType}>
            <RadioButton value={FILE_TYPE_ALL}>全部</RadioButton>
            <RadioButton value={FILE_TYPE_TXT}>文件</RadioButton>
            <RadioButton value={FILE_TYPE_IMG}>图片</RadioButton>
            <RadioButton value={FILE_TYPE_VIDEO}>视频</RadioButton>
          </Radio>
        </a-form-item>
        <a-form-item label={"文件数量限制"} help="">
          <InputNumber min={1} vModel={options.number} placeholder={"文件数量限制，最小为1"}/>
        </a-form-item>
        <a-form-item label={"文件后缀名限制"} help="">
          <Input vModel={options.accept} placeholder={"文件后缀名限制"}/>
        </a-form-item>
        <a-form-item label={"是否返回Url"} help="">
          <kCheckbox v-model={options.returnUrl} label="是否返回Url" />
        </a-form-item>
        {
          options.returnUrl ?
            (
              <a-form-item label={"多个url的拼接符号（默认逗号）"} help="">
                <Input vModel={options.splitChar} placeholder={"多个url的拼接符号（默认逗号）"}/>
              </a-form-item>
            ) : undefined
        }
        <a-form-item label={"自定义上传接口"} help="">
          <Input disabled={!!options.knowledgePath} vModel={options.customUploadAction} placeholder={"自定义上传接口"}/>
        </a-form-item>
        {
          options.fileType === FILE_TYPE_IMG ?
            (
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
            ) : undefined
        }
        <a-form-item label={"其他属性"} help="">
          <kCheckbox v-model={options.buttonVisible} label="是否显示上传按钮" />
          <kCheckbox v-model={options.disabled} label="禁用" />
          {/*<kCheckbox v-model={options.triggerChange} label="是否触发change事件" />*/}
        </a-form-item>
      </div>
    )
  }
}
