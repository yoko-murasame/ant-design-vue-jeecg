<template>
  <div :class="{ disableMouthCursor: innerDisable, contents: !innerDisable }">
    <div :class="{ disableMouthEvent: innerDisable, contents: !innerDisable }">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { USER_AUTH } from '@/store/mutation-types';

/**
 * 禁用效果包裹组件
 * <disable-block :disable="true" permission="admin:button">xxxxxx</disable-block>
 * 中心内容鼠标事件被禁用，鼠标样式改变
 */
export default {
  name: 'DisableBlock',
  props: {
    disable: {
      type: Boolean,
      require: true,
      default: false
    },
    // 需要放行的按钮权限, 多个用逗号分隔
    permission: {
      type: String,
      require: false,
      default: ''
    }
  },
  data () {
    return {
      innerDisable: false
    }
  },
  watch: {
    disable: {
      handler (val) {
        this.innerDisable = val
        this.checkPermissions()
      },
      immediate: true
    }
  },
  methods: {
    checkPermissions() {
      if (!this.permission || !this.disable) {
        return
      }
      const permissions = this.permission.split(',')
      let authList = JSON.parse(sessionStorage.getItem(USER_AUTH) || '[]');
      for (let auth of authList) {
        if (permissions.includes(auth.action)) {
          this.innerDisable = false
          console.log('--------DisableBlock--按钮权限放行--------')
          break
        }
      }
    }
  }
}
</script>

<style scoped lang="less">
.disableMouthEvent {
  display: contents;
  pointer-events: none;
}
.disableMouthCursor {
  // display: contents; // 会导致没有禁用鼠标样式
  cursor: not-allowed;
}
.contents {
  display: contents;
}
</style>
