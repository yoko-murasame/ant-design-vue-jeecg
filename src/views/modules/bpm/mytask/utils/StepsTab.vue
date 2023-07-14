<template>
  <a-steps v-if="dictLoad" v-model="currentTabDictValueInner" type="navigation" size="small">
    <a-step v-for="step in stepItems" :key="step.title" :status="step.status" :title="step.title" :disabled="step.disabled" />
  </a-steps>
</template>

<script>
/**
 * 动态的分布表单展示组件封装
 * @author yoko
 * 可根据jeecg系统字典自动渲染步骤
 * 支持v-model双向绑定选中tab项
 * dict传值为Boolean时，启用字典且必须传入：dictText、dictValue、dict
 * dict传值为String时，将作为jeecg的系统内字典自动加载处理
 */
import { initDictOptions } from '@comp/dict/JDictSelectUtil';

export default {
  name: 'StepsTab',
  model: {
    prop: 'currentTabDictValue',
    event: 'change'
  },
  props: {
    /**
     * 当前节点
     */
    currentState: {
      type: String,
      default: '测试2'
    },
    currentFinish: {
      type: [Boolean, String],
      default: false
    },
    /**
     * 当前选中tab
     */
    currentTabDictValue: {
      type: String,
      default: '测试2'
    },
    /**
     * 当前选中tab的字典翻译(.sync同步)
     */
    currentTabDictText: {
      type: String,
      default: ''
    },
    /**
     * 字典文本，同tab的title
     */
    dictText: {
      type: Array,
      default: () => ['测试1', '测试2', '测试3']
    },
    /**
     * 字典值
     */
    dictValue: {
      type: Array,
      default: () => ['1', '2', '3']
    },
    /**
     * 字典模式
     * Boolean时需传入 dictText dictValue
     * String时默认去加载系统字典
     */
    dict: {
      type: [Boolean, String],
      default: false
    },
    /**
     * tab改变前的钩子，一定需要触发cb()
     */
    beforeChange: {
      type: Function,
      default: (before, after, cb) => cb()
    },
    debug: {
      type: [Boolean, String],
      default: false
    }
  },
  data() {
    return {
      currentTabDictValueInner: 0,
      dictOptions: null,
      dictValueInner: [],
      dictTextInner: [],
      dictLoad: false
    }
  },
  computed: {
    transferCurrentTabDictValue() {
      if (!this.dictLoad) {
        return ''
      }
      return this.dict ? this.dictTextInner[this.dictValueInner.indexOf(this.currentTabDictValue)] : this.currentTabDictValue
    },
    transferCurrentState() {
      if (!this.dictLoad) {
        return ''
      }
      return this.dict ? this.dictTextInner[this.dictValueInner.indexOf(this.currentState)] : this.currentState
    },
    stepItems() {
      if (!this.dictLoad) {
        return []
      }
      const curIdx = this.dictTextInner.indexOf(this.transferCurrentState) || 0;
      return this.dictTextInner.map((text, idx) => {
        return {
          title: text,
          status: curIdx === idx ? this.currentFinish ? 'finish' : 'process' : curIdx < idx ? 'wait' : 'finish',
          disabled: this.debug ? false : (curIdx < idx)
        }
      })
    }
  },
  watch: {
    dict(v) {
      console.log('字典改变了', v, this.currentTabDictValue, this.currentTabDictValueInner)
      this.dictLoad = false
      this.$nextTick(() => this.initialDict())
    },
    /**
     * 需要监听转换后的字典值（当前默认tab）
     * 可以做到 切换字典时自动切换默认选中tab
     */
    transferCurrentTabDictValue: {
      immediate: true,
      handler(val) {
        if (!val) {
          return
        }
        this.currentTabDictValueInner = this.dictTextInner.indexOf(val || this.transferCurrentState) || 0;
        console.log('transferCurrentTabDictValue change', this.transferCurrentTabDictValue)
      }
    },
    /**
     * 这个方式做不到 切换字典时自动切换默认选中tab
     */
    // currentTabDictValue: {
    //   immediate: true,
    //   handler() {
    //     if (!this.dictLoad) {
    //       return
    //     }
    //     this.currentTabDictValueInner = this.dictTextInner.indexOf(this.transferCurrentTabDictValue || this.transferCurrentState) || 0;
    //     console.log('currentTabDictValue change', this.transferCurrentTabDictValue, this.transferCurrentState, this.currentTabDictValueInner)
    //   }
    // },
    /**
     * 双向绑定内部steps组件和外部值
     */
    currentTabDictValueInner(idx, old) {
      const cb = (err) => {
        if (err) {
          console.error('错误触发了 ', err)
          return
        }
        this.$emit('change', this.dict ? this.dictValueInner[idx] : this.dictTextInner[idx]);
        this.$emit('update:currentTabDictText', this.dictTextInner[idx])
        console.log('currentTabDictValueInner change', this.dictTextInner[idx], this.dictValueInner[idx])
      };
      this.beforeChange(this.dictValueInner[old], this.dictValueInner[idx], cb)
    },
    /**
     * 监听state值变化
     */
    transferCurrentState(val) {
      if (!val) {
        return
      }
      const args = {
        dictCode: this.dict,
        dictOptions: this.dictOptions,
        dictValue: this.dictValueInner,
        dictText: this.dictTextInner,
        text: this.transferCurrentState || this.dictTextInner[0],
        value: this.currentState || this.dictValueInner[0],
        index: this.dictValueInner.indexOf(this.currentState || this.dictValueInner[0])
      };
      this.$emit('stateChange', args)
      console.log('transferCurrentState change', val, args)
    }
  },
  async created() {
    await this.initialDict()
  },
  methods: {
    async initialDict() {
      if (typeof this.dict === 'string') {
        const { result } = await initDictOptions(this.dict)
        this.dictOptions = result
        this.dictValueInner = result.map(e => e.value)
        this.dictTextInner = result.map(e => e.text)
      } else {
        if (this.dict && this.dictValue.length !== this.dictText.length) {
          throw new Error('字典模式下,请确保dictValue、dictText数量一致!')
        }
        this.dictValueInner = [...this.dictValue]
        this.dictTextInner = [...this.dictText]
      }
      // 触发computed缓存刷新
      this.dictLoad = true
      console.log('字典初始化完成', this.dictValueInner, this.dictTextInner, this.dictOptions)
    }
  }
}
</script>
