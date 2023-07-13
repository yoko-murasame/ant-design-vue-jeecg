<template>
  <div class="logo">
    <router-link :to="routerLinkTo">

      <!-- update-begin- author:sunjianlei --- date:20190814 --- for: logo颜色根据主题颜色变化 -->
      <img v-if="navTheme === 'dark'" src="~@/assets/dark-icon.jpeg" alt="logo">
      <img v-else src="~@/assets/dark-icon.jpeg" alt="logo">
      <!-- update-begin- author:sunjianlei --- date:20190814 --- for: logo颜色根据主题颜色变化 -->

      <!--<h1 v-if="showTitle">{{ title }}</h1>-->
      <h1 v-if="showTitle" class="lg-title">{{ title }}<p class="sm-title">{{ titleSub }}</p></h1>
    </router-link>
  </div>
</template>

<script>
  import { mixin } from '@/utils/mixin.js'

  export default {
    name: 'Logo',
    mixins: [mixin],
    props: {
      title: {
        type: String,
        default: process.env.VUE_APP_LOGO_NAME_CH,
        required: false
      },
      titleSub: {
        type: String,
        default: process.env.VUE_APP_LOGO_NAME_EN,
        required: false
      },
      showTitle: {
        type: Boolean,
        default: true,
        required: false
      },
      // 点击Logo跳转地址
      routerLinkTo: {
        type: Object,
        default: () => ({ name: 'dashboard' })
      }
    }
  }
</script>
<style lang="less" scoped>
  /*缩小首页布 局顶部的高度*/
  @height: 59px;

  .sider {
    box-shadow: none !important;
    .logo {
      height: @height !important;
      line-height: @height !important;
      box-shadow: none !important;
      transition: background 300ms;

      a {
        color: white;
        &:hover {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }

    &.light .logo {
      background-color: @primary-color;
    }

    .title-div{
      width: 140px;
      height: auto;
      max-height: 60px;
      object-fit: scale-down;
    }
    .lg-title{
      overflow: hidden;
      font-size: 20px;
      line-height: 1.35;
      .sm-title{
        margin: 0;
        font-size: 12px;
        font-weight: 200;
      }
    }
  }
</style>
