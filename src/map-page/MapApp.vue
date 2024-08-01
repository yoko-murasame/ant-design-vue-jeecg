<template>
  <a-config-provider :locale="locale">
    <div id="mapApp">
      <router-view/>
    </div>
  </a-config-provider>
</template>
<script>
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'

export default {
    data () {
      return {
        locale: zhCN
      }
    },
    created () {
    }
  }
</script>
<style lang="less" scoped>
@import '~@/map-page/less/App.less';
@import '~@/map-page/less/Cesium.less';
</style>
