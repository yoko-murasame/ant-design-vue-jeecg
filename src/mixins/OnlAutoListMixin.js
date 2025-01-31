export const HrefJump = {
  data() {
    return {
      fieldHrefSlots: [],
      hrefComponent: {
        model: {
          title: '',
          width: '100%',
          visible: false,
          destroyOnClose: true,
          style: {
            top: 0,
            left: 0,
            height: '100%',
            margin: 0,
            padding: 0
          },
          bodyStyle: { padding: '8px', height: 'calc(100vh - 108px)', overflow: 'auto', overflowX: 'hidden' },
          // 隐藏掉取消按钮
          cancelButtonProps: { style: { display: 'none' } }
        },
        on: {
          ok: () => this.hrefComponent.model.visible = false,
          cancel: () => this.hrefComponent.model.visible = false
        },
        is: null,
        params: {}
      }
    }
  },
  methods: {
    // 处理接收href参数
    handleAcceptHrefParams() {
      this.acceptHrefParams = {}
      let hrefparam = this.$route.query;
      if (hrefparam) {
        this.acceptHrefParams = { ...hrefparam }
      }
    },
    // 支持链接href跳转
    handleClickFieldHref(field, record) {
      let href = field.href
      let urlPattern = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/
      let compPattern = /\.vue(\?.*)?$/
      if (typeof href === 'string') {
        href = href.trim().replace(/\${([^}]+)?}/g, (s1, s2) => record[s2])
        if (urlPattern.test(href)) {
          window.open(href, '_blank')
        } else if (compPattern.test(href)) {
          this.openHrefCompModal(href)
        } else {
          this.$router.push(href)
        }
      }
    },
    openHrefCompModal(href) {
      // 解析 href 参数
      let index = href.indexOf('?')
      let path = href
      if (index !== -1) {
        path = href.substring(0, index)
        let paramString = href.substring(index + 1, href.length)
        let paramArray = paramString.split('&')
        let params = {}
        paramArray.forEach(paramObject => {
          let paramItem = paramObject.split('=')
          params[paramItem[0]] = paramItem[1]
        })
        this.hrefComponent.params = params
      } else {
        this.hrefComponent.params = {}
      }
      this.hrefComponent.model.visible = true
      this.hrefComponent.model.title = '操作'
      this.hrefComponent.is = () => import('@/views/' + (path.startsWith('/') ? path.slice(1) : path))
    },
    // 处理显示长度
    handleColumnShowLength(column) {
      let { showLength, customRender } = column
      if (showLength && typeof customRender !== 'function') {
        column.customRender = (text) => {
          if (text && text.length > showLength) {
            // return text.substr(0, showLength)+''
            return <a-tooltip><div slot={'title'} domProps={{ innerHTML: text }}></div><span title={text}>{text.substr(0, showLength)}...</span></a-tooltip>
          } else {
            return text;
          }
        }
      }
    },
    /** 处理列中的 href 跳转和 dict 字典，使两者可以兼容存在 */
    handleColumnHrefAndDict(column = {}, fieldHrefSlotKeysMap = {}) {
      let { customRender, hrefSlotName } = column
      // if (!hrefSlotName && (column.scopedSlots && column.scopedSlots.customRender)) {
      //   // hrefSlotName = column.scopedSlots.customRender
      // }
      // 如果 customRender 有值则代表使用了字典
      // 如果 hrefSlotName 有值则代表使用了href跳转
      // 两者可以兼容。兼容的具体思路为：先获取到字典替换的值，再添加href链接跳转
      if (customRender || hrefSlotName) {
        // console.log('渲染字典', customRender, column)
        // 由于customRender的优先级比较高，因此如果存在自定义scopedSlots，就跳过 customRender
        if (column.scopedSlots && column.scopedSlots.customRender && (this.$slots[column.scopedSlots.customRender] || this.$scopedSlots[column.scopedSlots.customRender])) {
          delete column.customRender
          return
        }
        let dictCode = customRender
        let replaceFlag = '_replace_text_'
        let dictTextFlag = '_dictText'
        column.customRender = (text, record) => {
          let value = text
          // 如果 dictCode 有值，就进行字典转换
          if (dictCode) {
            if (dictCode.startsWith(replaceFlag)) {
              let textFieldName = dictCode.replace(replaceFlag, '')
              value = record[textFieldName]
            } else if (dictCode.endsWith(dictTextFlag)) {
              value = record[dictCode]
            } else {
              value = this.$filterMultiDictText(this.dictOptions[dictCode], text)
            }
          }
          // update-begin-author:taoyan date:20201204 for: 扩展参数设置列的内容长度
          if (column.showLength) {
            if (value && value.length > column.showLength) {
              // value = value.substr(0, column.showLength) + '...'
              value = <a-tooltip><div slot={'title'} domProps={{ innerHTML: value }}></div><span title={value}>{value.substr(0, column.showLength)}...</span></a-tooltip>
            }
          }
          // update-end-author:taoyan date:20201204 for: 扩展参数设置列的内容长度

          // 如果 hrefSlotName 有值，就生成一个 a 标签，包裹住字典替换后（或原生）的值
          if (hrefSlotName) {
            let field = fieldHrefSlotKeysMap[hrefSlotName]
            if (field) {
              // 此处为 JSX 语法
              return (<a onClick={() => this.handleClickFieldHref(field, record)}>{value}</a>)
            }
          }
          return value
        }
      }
    }

  }
}
