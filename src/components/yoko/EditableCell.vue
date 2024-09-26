<template>
  <div class="editable-cell">
    <div v-if="editable && !disabled" class="editable-cell-input-wrapper">
      <a-input :value="text" @change="handleChange" @pressEnter="check" /><a-icon
        type="check"
        class="editable-cell-icon-check"
        @click="check"
      />
    </div>
    <div v-else class="editable-cell-text-wrapper fontGreen" :class="{ fontRed: !text }">
      <slot></slot>
      <a-icon v-if="!disabled" type="edit" class="editable-cell-icon" @click="edit" />
    </div>
  </div>
</template>
<script>
// 编辑单元格组件
export default {
  name: 'EditableCell',
  model: {
    prop: 'text',
    event: 'change'
  },
  props: {
    text: {
      type: [Number, String],
      default: 0
    },
    disabled: {
      type: [Boolean, String],
      default: false
    }
  },
  data() {
    return {
      value: this.text,
      editable: false
    }
  },
  methods: {
    handleChange(e) {
      this.value = e.target.value
      this.$emit('change', this.value)
    },
    check() {
      const that = this
      return new Promise(resolve => {
        console.log('check', that.value)
        that.editable = false
        that.$emit('ok', that.value)
        resolve(true)
      })
    },
    edit() {
      this.editable = true
    }
  }
}
</script>

<style lang="less" scoped>
 /deep/ .fontGreen {
    color: #00ac3b;
  }
  .fontRed {
    color: #ff5851;
  }
/* 可编辑单元格 */
.editable-cell {
  position: relative;
}

.editable-cell-input-wrapper,
.editable-cell-text-wrapper {
  padding-right: 24px;
}

.editable-cell-text-wrapper {
  padding: 5px 24px 5px 5px;
}

.editable-cell-icon,
.editable-cell-icon-check {
  position: absolute;
  right: 0;
  width: 20px;
  cursor: pointer;
}

.editable-cell-icon {
  line-height: 18px;
  /*display: none;*/
}

.editable-cell-icon-check {
  line-height: 28px;
}

.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}

.editable-cell-icon:hover,
.editable-cell-icon-check:hover {
  color: #108ee9;
}

.editable-add-btn {
  margin-bottom: 8px;
}
</style>
