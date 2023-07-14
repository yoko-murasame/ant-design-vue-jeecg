<template>
  <div id="viewFile"></div>
</template>
<script>
  export default {
    props: ['wpsUrl', 'token'],
    data() {
      return {
        // 是否开启简易模式
        simpleMode: false
      }
    },
    mounted() {
      console.log('我进来了')
      this.openWps(this.wpsUrl, this.token)
    },
    methods: {
      openWps(url, token) {
        console.log(url)
        let _this = this
        const wps = _this.wps.config({
          mode: _this.simpleMode ? 'simple' : 'normal',
          mount: document.querySelector('#app'),
          wpsUrl: url
        })
        wps.setToken({ 'token': token })
        console.log('我已到了这一步')
        let app = wps.Application
        console.log(JSON.stringify(app), '我已经到了最后一步')
      }
    }
  }
</script>
<style>
  #wps-iframe {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 99;
  }
</style>
