<template>
  <div id="userLayout" :class="['user-layout-wrapper', device]">
    <div class="container">
      <div class="top">
        <div class="header">
          <a href="/">
            <!--<img src="~@/assets/login-icon.png" class="logo" alt="logo"/>-->
            <span class="title">{{ systemName }}</span>
          </a>
        </div>
        <div class="desc" v-html="systemDesc"></div>
      </div>

      <route-view></route-view>

      <div class="footer">
        <div class="links">
          <!--<a href="#" target="_self">建设单位：xxx</a>-->
          <!--          <a href="#" target="_self">技术支持：xxx、xxx</a>-->
          <!--          <a href="#" target="_self">技术支持：xxx</a>-->
          <a href="#" target="_self">{{ footer }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RouteView from '@/components/layouts/RouteView'
import { mixinDevice } from '@/utils/mixin.js'

export default {
  name: 'UserLayout',
  components: { RouteView },
  mixins: [mixinDevice],
  data() {
    return {
      footer: process.env.VUE_APP_FOOTER_TEXT,
      systemName: process.env.VUE_APP_PLATFORM_NAME,
      systemDesc: process.env.VUE_APP_PLATFORM_DESC
    }
  },
  mounted() {
    document.body.classList.add('userLayout')
  },
  beforeDestroy() {
    document.body.classList.remove('userLayout')
  }
}
</script>

<style lang="less" scoped>
#userLayout.user-layout-wrapper {
  height: 100%;
  background-color: #333;

  &.mobile {
    .container {
      .main {
        max-width: 368px;
        width: 98%;
      }
    }
  }

  // .container-wrapper{
  //   width: 100%;
  //   height: 100%;
  //   background: #f0f2f5 url(~@/assets/login-background.jpeg) no-repeat 100%;
  //   background-color: rgba(0, 0, 0, 0.45);
  //   background-size: 100%;
  // }

  .container::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    // background: url(xxx.jpg) no-repeat center / contain;
    // background: #f0f2f5 url(~@/assets/background.svg) no-repeat 50%;
    background: #000 url(~@/assets/login-background.jpeg) no-repeat 100%;
    background-size: 100%;
    z-index: -1;
    opacity: .6;
  }

  .container {
    width: 100%;
    min-height: 100%;
    // background: #f0f2f5 url(~@/assets/background.svg) no-repeat 50%;
    // background: #000 url(~@/assets/login-background.jpeg) no-repeat 100%;
    // background-size: 100%;
    z-index: 0;
    // padding: 110px 0 144px;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: center;
    position: relative;

    a {
      text-decoration: none;
    }

    .top {
      margin-top: 3vh;
      text-align: center;

      .header {
        height: 44px;
        line-height: 44px;

        .badge {
          position: absolute;
          display: inline-block;
          line-height: 1;
          vertical-align: middle;
          margin-left: -12px;
          margin-top: -10px;
          opacity: 0.8;
        }

        .logo {
          height: 44px;
          vertical-align: top;
          margin-right: 16px;
          border-style: none;
        }

        .title {
          font-size: 33px;
          color: rgba(0, 0, 0, 0.85);
          font-family: 'Chinese Quote', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
          'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
          'Segoe UI Symbol';
          font-weight: 600;
          position: relative;
          top: 2px;
        }
      }

      .desc {
        font-size: 2vh;
        font-weight: bold;
        letter-spacing: 2px;
        // color: rgba(0, 0, 0, 0.45);
        // color: rgba(51, 51, 51, 1);
        color: rgba(255, 255, 255, 0.9);
        margin-top: 2vh;
        margin-bottom: 2vh;
      }
    }

    .main {
      // min-width: 260px;
      // width: 368px;
      margin: 0 auto;
      width: auto;
      padding: 1vh;
      // border: 1px solid #fff;
      border-radius: 1vh;
      //background: rgba(255, 255, 255, 0.7);
      //box-shadow: 10px 10px 5px rgba(255, 255, 255, 0.7);
      background: rgba(255, 255, 255, 1);
      box-shadow: 0.3vh 0.3vh 0.3vh 0.3vh rgba(255, 255, 255, 0.7);
    }

    .footer {
      position: absolute;
      width: 100%;
      bottom: 0;
      padding: 0 16px;
      margin: 48px 0 24px;
      text-align: center;
      font-family: 'YouSheBiaoTiHei';

      .links {
        margin-bottom: 8px;
        font-size: 14px;

        a {
          // color: rgba(0, 0, 0, 0.45);
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.3s;

          &:not(:last-child) {
            margin-right: 40px;
          }
        }
      }

      .copyright {
        color: rgba(0, 0, 0, 0.45);
        font-size: 14px;
      }
    }
  }
}
</style>
