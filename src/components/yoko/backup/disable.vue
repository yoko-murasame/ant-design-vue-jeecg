<template>
  <div :class="{ disableMouthCursor: disable }">
    <div :class="{ disableMouthEvent: disable }">
      <slot></slot>
    </div>
  </div>
</template>

<script>
/**
 * 禁用效果包裹组件
 * <disable :disable="true">xxxxxx</disable>
 * 中心内容鼠标事件被禁用，鼠标样式改变
 */
export default {
  name: 'Disable',
  props: {
    disable: {
      type: Boolean,
      require: true,
      default: false
    }
  }
}
</script>

<style scoped>
.disableMouthEvent {
  pointer-events: none;
}
.disableMouthCursor {
  cursor: not-allowed;
}
</style>
