<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <router-view/>
    </div>
  </a-config-provider>
</template>
<script>
  import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
  import enquireScreen from '@/utils/device'

  export default {
    data () {
      return {
        locale: zhCN
      }
    },
    created () {
      let that = this
      enquireScreen(deviceType => {
        // tablet
        if (deviceType === 0) {
          that.$store.commit('TOGGLE_DEVICE', 'mobile')
          that.$store.dispatch('setSidebar', false)
        }
        // mobile
        else if (deviceType === 1) {
          that.$store.commit('TOGGLE_DEVICE', 'mobile')
          that.$store.dispatch('setSidebar', false)
        } else {
          that.$store.commit('TOGGLE_DEVICE', 'desktop')
          that.$store.dispatch('setSidebar', true)
        }
      })
    }
  }
</script>
<style>
  #app {
    height: 100%;
  }

  .dis-boxflex {
    display: flex;
    align-items: center;
  }

  .space-around {
    justify-content: space-around;
  }

  .justify-end {
    justify-content: flex-end;
  }

  .justify-between {
    justify-content: space-between;
  }

  .box-flex {
    flex: 1;
  }

  .flex-2 {
    flex: 2;
  }

  .flex-3 {
    flex: 3;
  }

  .flex-unshrink {
    flex-grow: 0;
    flex-shrink: 0;
  }

  .align-start {
    align-items: flex-start;
  }

  .align-end {
    align-items: flex-end;
  }

  .align-stretch {
    align-items: stretch;
  }

  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .line-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .line-3 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .split-text {
    display: inline-block;
    margin: 0 12px;
  }

  /*禁用效果样式调整*/
  .ant-select-disabled,
  .ant-input-number-disabled,
  .ant-input-disabled {
    background: none !important;
    cursor: not-allowed;
    color: rgba(0, 0, 0, 0.65) !important;
  }

  .ant-btn-danger {
    background: #ff4d4f !important;
  }
</style>
