<template>
  <a-popover trigger="contextmenu" v-model="visible" :placement="position" overlayClassName="j-input-pop">
    <!--"(node) => node.parentNode.parentNode"-->
    <div slot="title">
      <!--todo markdown帮助问价组件-->
      <span v-if="!markdownPath">{{ popTitle || title }}</span>
      <a v-else @click.stop="$refs.jsHelp.showModal()">{{ popTitle || title }}</a>
      <span style="float: right" title="关闭">
        <a-icon type="close" @click="visible=false"/>
      </span>
    </div>
    <a-input :value="inputContent" :disabled="disabled" @change="handleInputChange" :placeholder="placeholder">
      <a-icon slot="suffix" type="fullscreen" @click.stop="pop" />
    </a-input>
    <div slot="content">
      <a-textarea
        v-if="language === 'textarea'"
        ref="textarea"
        :value="inputContent"
        :disabled="disabled"
        @input="handleInputChange"
        :style="{ height: height + 'px', width: width + 'px' }"/>
      <template v-else>
        <j-code-editor
          ref="codeEditor"
          :language="language"
          :value="inputContent"
          :fullScreen="false"
          :disabled="disabled"
          @change="handleCodeChange"
          :auto-height="true"
          :min-height="height || '50vh'"
          :max-height="height || '50vh'"
          :style="{ width: '50vw' }"/>
        <js-form-enhance-help v-if="markdownPath" ref="jsHelp" :title="popTitle" :url="baseHelpUrl + markdownPath"></js-form-enhance-help>
      </template>
    </div>
  </a-popover>
</template>

<script>
  import JsFormEnhanceHelp from '@comp/yoko/kform/JsFormEnhanceHelp.vue'

  export default {
    name: 'JInputPop',
    components: { JsFormEnhanceHelp },
    props: {
      title: {
        type: String,
        default: '',
        required: false
      },
      position: {
        type: String,
        default: 'right',
        required: false
      },
      height: {
        type: [Number, String],
        default: 200,
        required: false
      },
      width: {
        type: Number,
        default: 150,
        required: false
      },
      value: {
        type: String,
        required: false
      },
      popContainer: {
        type: String,
        default: '',
        required: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      placeholder: {
        type: String,
        required: false
      },
      // 语言: textarea | vue | javascript
      language: {
        type: String,
        default: 'textarea'
      },
      // 帮助文件路径
      markdownPath: {
        type: String,
        default: ''
      },
      // pop状态的标题
      popTitle: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        visible: false,
        inputContent: '',
        baseHelpUrl: process.env.BASE_URL || '/'
      }
    },

    watch: {
      value: {
        immediate: true,
        handler: function() {
          if (this.value && this.value.length > 0) {
            this.inputContent = this.value
          }
        }
      }
    },
    model: {
      prop: 'value',
      event: 'change'
    },
    methods: {
      handleInputChange(event) {
        this.inputContent = event.target.value
        this.$emit('change', this.inputContent)
      },
      handleCodeChange(e) {
        this.inputContent = e
        this.$emit('change', this.inputContent)
      },
      pop() {
        // disabled 不弹窗
        if (this.disabled) {
          return
        }
        this.visible = true
        this.$nextTick(() => {
          if (this.language === 'textarea') {
            this.$refs.textarea.focus()
          }
        })
      },
      getPopupContainer(node) {
        if (!this.popContainer) {
          return node.parentNode
        } else {
          return document.getElementById(this.popContainer)
        }
      }
    }
  }
</script>

<style scoped>

</style>
