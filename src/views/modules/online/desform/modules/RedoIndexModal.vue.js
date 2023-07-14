import { axios } from '@/utils/request'

export default {
  name: 'RedoIndexModal',
  data() {
    return {
      loading: false,
      visible: false,
      modes: [
        // 快速
        {
          url: '/desform/redoAllIndex',
          title: '快速重置索引',
          content: '确定要开始快速重置索引吗？'
        },
        // 强制
        {
          url: '/desform/redoAllIndexForce',
          title: '强制重置索引',
          content: <div><p>确定要开始强制重置索引吗？</p><p style="color:red;">强制重置索引会删除并重建所有索引，耗时较长</p></div>
        }
      ],
      modeIndex: null,
      selections: '',
      // 是否开启分页
      enabledPage: false,
      // 分页大小
      pageSize: 1000
    }
  },
  computed: {
    mode() {
      if (typeof this.modeIndex === 'number') {
        return this.modes[this.modeIndex]
      } else {
        return {}
      }
    }
  },
  methods: {

    open(modeIndex, selections) {
      this.visible = true
      this.modeIndex = modeIndex
      this.selections = selections
    },

    forceClose() {
      this.loading = false
      this.close()
    },

    close() {
      if (this.loading) {
        this.$message.warn('请等待结束...')
      } else {
        this.visible = false
      }
    },

    async handleRedoIndex() {
      let params = {}
      // 重置选中
      if (this.selections) {
        params['selections'] = this.selections
      }
      // 分页重置
      if (this.enabledPage) {
        params['pageSize'] = this.pageSize
      }
      this.loading = true
      const hideLoading = this.$message.loading(`重置索引中...`, 0)
      try {
        // 发送重置索引请求
        const { success, message } = await axios({
          url: this.mode.url,
          data: params,
          method: 'put',
          timeout: 600000
        })
        // 判断返回结果
        if (success) {
          this.forceClose()
          this.$message.success('重置成功！')
        } else {
          throw message
        }
      } catch (e) {
        let content = e
        if (typeof e !== 'string') {
          console.error(e)
          content = e.message
        }
        if (/timeout of \d+ms exceeded/.test(content)) {
          content = '重置索引时间过长，已进入后台执行，请在后台查看日志结果！'
          this.$warning({ title: '重置索引超时', content })
        } else {
          this.$error({ title: '重置索引失败', content })
        }
      }
      hideLoading()
      this.loading = false
    }

  },
  render() {
    let { visible, loading, mode: { title, content }, handleRedoIndex, close } = this
    return (
      <j-modal title={title} visible={visible} confirmLoading={loading} onOk={handleRedoIndex} onCancel={close}>
        <a-spin spinning={loading}>
          {/* 解析JSX语法 */}
          <div>{content}</div>
          <a-divider/>
          {/* 分页重置配置 */}
          <a-form layout="inline">
            <a-form-item label="分页重置">
              <a-switch checkedChildren="开启" unCheckedChildren="关闭" vModel={this.enabledPage}/>
            </a-form-item>
            <a-form-item vShow={this.enabledPage} label="每页大小">
              <a-input-number vModel={this.pageSize} disabled={!this.enabledPage} min={10}/>
              <span style="margin-left: 10px;">条</span>
            </a-form-item>
          </a-form>
        </a-spin>
      </j-modal>
    )
  }
}
