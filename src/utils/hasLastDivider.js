/**
 * 校验最后一个divider是否多余
 * @type {{install(*, *): void}}
 */
const hasLastDivider = {
  install(Vue, options) {
    Vue.directive('lastDivider', {
      inserted: (el, binding, vnode) => {
        // console.log('校验最终divider nextSibling', el.nextSibling)
        // console.log('校验最终divider nextElementSibling', el.nextElementSibling)
        if (el.nextElementSibling === null) {
          el.parentNode.removeChild(el)
        }
      }
    })
  }
}

export default hasLastDivider
