<template>
  <div>
    <!--<a-button type="primary" @click="showModal">打开模态框</a-button>-->
    <a-modal v-model="visible" :title="title" @ok="handleOk" @cancel="handleCancel" width="50vw" >
      <div style="height: 70vh;">
        <!--<iframe :src="iframeSrc" frameborder="0" width="100%" height="100%"></iframe>-->
        <j-markdown-editor v-model="markdownValue" :options="options" height="70vh" ref="markdownRef" :mode="'wysiwyg'" :show-pic="false"></j-markdown-editor>
      </div>
    </a-modal>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  props: {
    title: {
      type: String,
      default: '表单设计器JS增强说明'
    },
    url: {
      type: String,
      default: '/static/表单设计器JS增强说明.md'
    }
  },
  data() {
    return {
      visible: false,
      markdownValue: '',
      options: {
        minHeight: '70vh',
        previewStyle: 'vertical',
        initialEditType: 'wysiwyg',
        useCommandShortcut: false,
        useDefaultHTMLSanitizer: false,
        usageStatistics: false,
        hideModeSwitch: false,
        toolbarItems: [
          // 'heading',
          // 'bold',
          // 'italic',
          // 'strike',
          // 'divider',
          // 'hr',
          // 'quote',
          // 'divider',
          // 'ul',
          // 'ol',
          // 'task',
          // 'indent',
          // 'outdent',
          // 'divider',
          // 'table',
          // 'link',
          // 'divider',
          // 'code',
          // 'codeblock'
        ]
      },
      iframeSrc: '' // 用于加载HTML页面的URL
    };
  },
  methods: {
    showModal() {
      this.visible = true;
      // this.iframeSrc = require('/表单设计器JS增强说明.html'); // 根据实际的HTML文件名修改路径
      // this.iframeSrc = '/表单设计器JS增强说明.html'
      axios.get(this.url).then(res => {
        this.markdownValue = res.data
      })
    },
    handleOk() {
      this.visible = false;
    },
    handleCancel() {
      this.visible = false;
    }
  }
};
</script>
