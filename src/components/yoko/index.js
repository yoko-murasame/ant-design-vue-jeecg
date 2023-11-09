// Yoko组件全局注册
import CancelButton from '@/components/yoko/CancelButton'
import DisableBlock from '@/components/yoko/DisableBlock'
import JUploadKnowledge from '@/components/yoko/JUploadKnowledge'

// 注册动态表单组件（要不流程中不会显示）
import DynamicForm from '@/components/online/autoform/index'
// 不使用最新的打包后的包 还需要 yarn remove @jeecg/antd-online-mini
// require('@jeecg/antd-online-mini')
// require('@jeecg/antd-online-mini/dist/OnlineForm.css')

// 表单验证
import { rules } from '@/utils/rules'

// 阿里云播放器
import VueAliplayerV2 from 'vue-aliplayer-v2'

/* v-viewer 图片预览 */
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'

export default {
  install(Vue) {
    // 自定义组件
    Vue.component('CancelButton', CancelButton)
    Vue.component('DisableBlock', DisableBlock)
    Vue.component('JUploadKnowledge', JUploadKnowledge)
    // 动态表单
    Vue.use(DynamicForm)
    // 表单验证
    Vue.prototype.rules = rules
    // 阿里云播放器
    Vue.use(VueAliplayerV2);
    // 图片插件
    Vue.use(Viewer)
    Viewer.setDefaults({
      Options: {
        inline: true, // 启用inline模式
        button: true, // 右上角关闭按钮
        navbar: true, // 缩略图导航
        title: true, // 显示当前图片的标题
        toolbar: true, // 显示工具栏
        tooltip: true, // 显示缩放百分比
        movable: true, // 是否允许移动
        zoomable: true, // 是否可缩放
        rotatable: true, // 是否可旋转
        scalable: true, // 是否可翻转
        transition: true, // 是否使用css3过渡
        fullscreen: true, // 是否全屏
        keyboard: true, // 是否支持键盘
        url: 'data-source' // 设置大图片的url
      }
    })
  }
}
