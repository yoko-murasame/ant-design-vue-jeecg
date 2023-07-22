/**
 * Vue组件中自定义指令示例
 * e.g. 这里拿了一个业务中需要根据各种条件控制节点文本和显影的自定义指令作为学习参考
 * e.g. <a-menu-item v-fiscal="record" :fiscalType="1">
 *         <a-popconfirm v-if="record.bpmStatus === '3'" title="确定发起监督抽查吗?" @confirm="() => submitFiscalReview(record.id)">
 *           <a>XX监督审查</a>
 *         </a-popconfirm>
 *         <span v-else>——</span>
 *      </a-menu-item>
 */
import { USER_AUTH } from '@/store/mutation-types'
export default {
  // 在组件中注册自定义指令
  directives: {
    'fiscal': {
      bind: function(el, binding, vnode) {
        // 指令绑定时的操作
        // console.log('fiscal', el, binding, vnode)
        // 判断建设单位审定造价
        const { value: { jsJsdwsdzj, bpmStatus, createBy } } = binding
        // 小于50w不显示，流程未完成也不显示
        if (jsJsdwsdzj < 500000 || bpmStatus !== '3') {
          // el.parentNode.removeChild(el)
          // el.remove() // 不生效
          // 父节点还没渲染
          vnode.context.$nextTick(function() {
            el.parentNode.removeChild(el)
          })
          return
        }
        /**
         * 学习技巧：获取el的自定义属性
         * 1. const fiscalType = el.getAttribute('fiscalType');
         * 2. el.dataset.customAttribute 它可以直接访问 el 元素上以 data- 开头的自定义属性比如：data-custom-attribute
         * 学习技巧：设置el的自定义属性
         * 1. el.setAttribute('data-custom-attribute', 'new value')
         * 2. el.dataset.customAttribute = 'new value' 直接修改了 el 元素上名为 data-custom-attribute 的属性值为 'new value'
         */
        const fiscalType = el.getAttribute('fiscalType');
        console.log('el.fiscalType', fiscalType)
        /**
         * 大于50w的分以下情况
         * 1.有集团按钮权限的 50w-400w | 400w-5000w 显示 集团监督抽查，大于5000w就不显示
         * 2.没有集团按钮权限的 400w-5000w | 大于5000w 显示 财政监督抽查，而且需要是数据发起人
         */
        let flag = false
        let authList = JSON.parse(sessionStorage.getItem(USER_AUTH) || '[]')
        for (let auth of authList) {
          if (auth.action === 'deal:jtjdcc') {
            flag = true
            console.log('--------v-fiscal---按钮权限放行---集团监督抽查--------')
            break
          }
        }
        if (flag) {
          if (jsJsdwsdzj <= 50000000) {
            console.log('---------集团监督抽查--------', el, el.firstChild)
            el.firstChild.textContent = '集团监督抽查'
          } else {
            vnode.context.$nextTick(function() {
              el.parentNode.removeChild(el)
            })
          }
        } else {
          // 获取store的当前用户
          const username = vnode.context.$store.getters.userInfo.username
          if (jsJsdwsdzj >= 4000000 && username === createBy) {
            console.log('---------财政监督抽查--------', el, el.firstChild)
            console.log('---------财政监督抽查发起用户--------', username)
            el.firstChild.textContent = '财政监督抽查'
          } else {
            vnode.context.$nextTick(function() {
              el.parentNode.removeChild(el)
            })
          }
        }
      }
      /**
       * 其他生命周期钩子函数...
       * inserted: function(el, binding, vnode) {} // 指令插入到父节点时的操作
       * update: function(el, binding, vnode, oldVnode) {} // 组件更新时的操作
       * unbind: function(el, binding, vnode) {} // 指令解绑时的操作
       */
    }
  }
}
