<template>
  <div class="footer">
    <!-- <div class="links">
      <a href="http://www.jeecg.com" target="_blank">JEECG 首页</a>
      <a href="https://github.com/zhangdaiscott/jeecg-boot" target="_blank">
        <a-icon type="github"/>
      </a>
      <a href="https://ant.design/">Ant Design</a>
      <a href="https://vuecomponent.github.io/ant-design-vue/docs/vue/introduce-cn/">Vue Antd</a>
    </div>
    <div class="copyright">
      Copyright
      <a-icon type="copyright"/>
      2019 <span>JEECG开源社区 出品</span>
    </div> -->
    <div class="copyright">
      Copyright
      <a-icon type="copyright"/>
      <!--2020<span v-if="showNowYear"> - {{ year }} </span><span>DM工作室</span>-->
      <span v-if="showNowYear"> {{ year }} </span><span>{{ logoNameCH || logoNameEN }}</span>
    </div>
    <div class="copyright">
      <span v-html="footer"></span>
    </div>
    <div class="copyright" v-show="showBeiAn">
      网站备案信息
      <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank" style="margin-left: 1em;">xICP备xxxx号</a>
      <a target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=" style="margin-left: 1em;">
        <img src="@/assets/beian.png" style="" alt=""/>
        <div style="display: inline-block;height:20px;line-height:20px;margin: 0 0 0 5px; color:#939393">X公网安备 xxxx号</div>
      </a>
    </div>
    <div style="width:50%;margin:0 auto; padding:0 0;"></div>
  </div>
</template>

<script>
export default {
  name: 'LayoutFooter',
  data () {
    return {
      // 当前年
      year: '',
      // 默认隐藏
      showNowYear: false,
      showBeiAn: true,
      footer: process.env.VUE_APP_FOOTER_TEXT,
      logoNameCH: process.env.VUE_APP_LOGO_NAME_CH,
      logoNameEN: process.env.VUE_APP_LOGO_NAME_EN
    }
  },

  computed: {
  },
  mounted() {
    // 调用获取年
    this.getCurrentYear()
  },
  methods: {
    // 版权 获取当前年
    getCurrentYear() {
      let date = new Date()
      let y = date.getFullYear()
      this.year = y
      this.showNowYear = y > 2020
    }
  }
}
</script>

<style lang="less" scoped>
.footer {
  padding: 0 16px;
  margin: 8px 0;
  text-align: center;

  .links {
    margin-bottom: 8px;

    a {
      color: rgba(0, 0, 0, .45);

      &:hover {
        color: rgba(0, 0, 0, .65);
      }

      &:not(:last-child) {
        margin-right: 40px;
      }
    }
  }
  .copyright {
    color: rgba(0, 0, 0, .45);
    font-size: 14px;
  }
}
</style>
