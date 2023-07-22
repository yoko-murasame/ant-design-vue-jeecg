// 注册 Vue.use(myDirective)

// 注册指令示例
const myDirective = {
  install(Vue, options) {
    // console.log(options);
    // 全局注册自定义指令
    Vue.directive('my-directive', {
      bind: function(el, binding, vnode) {
        // 指令绑定时的操作

        // 删除自己
        el.parentNode.removeChild(el);

        // 防止节点未渲染报错
        vnode.context.$nextTick(function() {
          el.parentNode.removeChild(el);
        });

        // 访问传递的参数
        console.log(binding.value.param1);
        console.log(binding.value.param2);

        // 获取自定义属性的值
        var customAttribute = el.getAttribute('data-custom-attribute');
        console.log(customAttribute);

        // 获取自定义属性的值
        var customAttribute = el.dataset.customAttribute;
        console.log(customAttribute);

        // 重写属性值
        el.setAttribute('data-custom-attribute', 'new value');

        // 重写属性值
        el.dataset.customAttribute = 'new value';

        // 获取子节点
        var childNodes = el.childNodes;
        console.log(childNodes);

        // 获取子元素节点
        var children = el.children;
        console.log(children);

        // 遍历子节点
        for (var i = 0; i < childNodes.length; i++) {
          var node = childNodes[i];
          // 判断节点类型为文本节点
          if (node.nodeType === Node.TEXT_NODE) {
            // 修改文本内容
            node.textContent = 'New text';
          }
        }

        // 遍历子节点
        for (var i = 0; i < childNodes.length; i++) {
          var node = childNodes[i];
          // 判断节点类型为文本节点
          if (node.nodeType === Node.TEXT_NODE) {
            // 创建新的文本节点
            var newText = document.createTextNode('New text');
            // 替换原有的文本节点
            el.replaceChild(newText, node);
          }
        }

        // 获取 Vuex store 中的数据
        var data = vnode.context.$store.state.data;

      },
      inserted: function(el, binding, vnode) {
        // 指令插入到父节点时的操作
      },
      update: function(el, binding, vnode, oldVnode) {
        // 组件更新时的操作
      },
      unbind: function(el, binding, vnode) {
        // 指令解绑时的操作
      }
    })
  }
}

export default myDirective
