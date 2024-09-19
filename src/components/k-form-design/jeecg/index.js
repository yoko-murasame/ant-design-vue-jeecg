import JUpload from '@comp/jeecg/JUpload.vue'
import JUploadKnowledge from '@comp/yoko/JUploadKnowledge.vue'
import JImageUpload from '@comp/jeecg/JImageUpload.vue'
import JDictSelectTag from '@comp/dict/JDictSelectTag.vue'
import JMultiSelectTag from '@comp/dict/JMultiSelectTag.vue'
import JSearchSelectTag from '@comp/dict/JSearchSelectTag.vue'
import JSelectMultiUser from '@comp/jeecgbiz/JSelectMultiUser.vue'
import JSelectUserByDep from '@comp/jeecgbiz/JSelectUserByDep.vue'
import { FILE_TYPE_ALL } from '@comp/yoko/mixins/ImageZipCompressMixin'

import { nodeSchema } from '../packages/utils'

/**
 * Jeecg相关组件KForm配置
 * 注意两个自定义属性：
 * 1.allowClear
 * 2.mode
 * 在 KFormItem 中被逻辑覆写了，因此需要修改
 */
export const jeecgComponents = [
  {
    type: 'JUpload', // 表单类型
    label: '文件上传', // 标题文字
    icon: 'icon-upload',
    component: JUpload,
    options: {
      bizPath: 'temp/file',
      text: '点击上传',
      fileType: FILE_TYPE_ALL,
      number: 10,
      accept: '*',
      returnUrl: true,
      splitChar: ',',
      customUploadAction: '',
      doCompress: true,
      zipPercent: 0.7,
      zipEnableSize: 2,
      buttonVisible: true,
      showLabel: true,
      hidden: false, // 是否隐藏，false显示，true隐藏
      disabled: false // 是否禁用
      // triggerChange: true, // 已废弃的属性
    },
    model: '',
    key: '',
    rules: [
      {
        required: false,
        message: '必填项'
      }
    ],
    help: ''
  },
  {
    type: 'JUploadKnowledge', // 表单类型
    label: '知识库上传', // 标题文字
    icon: 'icon-upload',
    component: JUploadKnowledge,
    options: {
      knowledgePath: '', // 知识库路径
      showTagsDialog: true, // 是否开启打标签弹框
      bizPath: 'temp/file',
      text: '点击上传',
      fileType: FILE_TYPE_ALL,
      number: 10,
      accept: '*',
      returnUrl: true,
      splitChar: ',',
      customUploadAction: '',
      doCompress: true,
      zipPercent: 0.7,
      zipEnableSize: 2,
      buttonVisible: true,
      showLabel: true,
      hidden: false, // 是否隐藏，false显示，true隐藏
      disabled: false // 是否禁用
      // triggerChange: true, // 已废弃的属性
    },
    model: '',
    key: '',
    rules: [
      {
        required: false,
        message: '必填项'
      }
    ],
    help: ''
  },
  {
    type: 'JImageUpload', // 表单类型
    label: '图片上传', // 标题文字
    icon: 'icon-image',
    component: JImageUpload,
    options: {
      bizPath: 'temp/image',
      text: '点击上传',
      number: 10,
      splitChar: ',',
      customUploadAction: '',
      doCompress: true,
      zipPercent: 0.7,
      zipEnableSize: 2,
      buttonVisible: true,
      limitSize: 20,
      limitWidth: 0,
      limitHeight: 0,
      visibleWidth: '',
      visibleNumber: 20,
      urlSuffix: '',
      showLabel: true,
      hidden: false, // 是否隐藏，false显示，true隐藏
      disabled: false // 是否禁用
    },
    model: '',
    key: '',
    rules: [
      {
        required: false,
        message: '必填项'
      }
    ],
    help: ''
  },
  {
    type: 'JDictSelectTag', // 表单类型
    label: '字典单选', // 标题文字
    icon: 'icon-danxuanxuanzhong',
    component: JDictSelectTag,
    options: {
      noDefaultProp: true,
      allowClear: true,
      triggerChange: true,
      type: 'select',
      dictType: 'static', // static dynamic
      dictCode: '',
      placeholder: '请选择',
      options: [],
      showLabel: true,
      hidden: false, // 是否隐藏，false显示，true隐藏
      disabled: false // 是否禁用
    },
    model: '',
    key: '',
    rules: [
      {
        required: false,
        message: '必填项'
      }
    ],
    help: ''
  },
  {
    type: 'JMultiSelectTag', // 表单类型
    label: '字典多选', // 标题文字
    icon: 'icon-duoxuan1',
    component: JMultiSelectTag,
    options: {
      noDefaultProp: true,
      allowClear: true,
      triggerChange: true,
      type: 'select',
      dictType: 'static', // static dynamic
      dictCode: '',
      placeholder: '请选择',
      options: [],
      spliter: ',',
      showLabel: true,
      hidden: false, // 是否隐藏，false显示，true隐藏
      disabled: false // 是否禁用
    },
    model: '',
    key: '',
    rules: [
      {
        required: false,
        message: '必填项'
      }
    ],
    help: ''
  },
  {
    type: 'JSearchSelectTag', // 表单类型
    label: '字典搜索', // 标题文字
    icon: 'icon-xiala',
    component: JSearchSelectTag,
    options: {
      noDefaultProp: true,
      placeholder: '请选择',
      mode: 'default', // default multiple
      dictType: 'static', // static dynamic
      dict: '', // 这个属性不要用了
      dictCode: '', // 用这个属性，和别的字典组件统一
      async: true, // 是否异步搜索
      pageSize: 50, // 异步加载的数量
      keepInput: false,
      dictOptions: [],
      showLabel: true,
      hidden: false, // 是否隐藏，false显示，true隐藏
      disabled: false // 是否禁用
    },
    model: '',
    key: '',
    rules: [
      {
        required: false,
        message: '必填项'
      }
    ],
    help: ''
  },
  {
    type: 'JSelectMultiUser', // 表单类型
    label: '用户多选', // 标题文字
    icon: 'icon-gallery',
    component: JSelectMultiUser,
    options: {
      noDefaultProp: true,
      placeholder: '请选择',
      showLabel: true,
      hidden: false, // 是否隐藏，false显示，true隐藏
      disabled: false // 是否禁用
    },
    model: '',
    key: '',
    rules: [
      {
        required: false,
        message: '必填项'
      }
    ],
    help: ''
  },
  {
    type: 'JSelectUserByDep', // 表单类型
    label: '部门用户', // 标题文字
    icon: 'icon-gallery',
    component: JSelectUserByDep,
    options: {
      noDefaultProp: true,
      placeholder: '请选择',
      modalWidth: 1250,
      multi: true,
      backUser: false,
      store: 'username',
      text: 'realname',
      showLabel: true,
      hidden: false, // 是否隐藏，false显示，true隐藏
      disabled: false // 是否禁用
    },
    model: '',
    key: '',
    rules: [
      {
        required: false,
        message: '必填项'
      }
    ],
    help: ''
  }
]
// 新方法，直接添加到已存在的分组
nodeSchema.addSchemaToGroup(jeecgComponents)

// jeecg组件类型
// export const jeecgComponentTypes = jeecgComponents.map(e => e.type)
// 添加分组，分组去 NodeSchema 统一管理吧
// nodeSchema.addSchemaGroup({
//   title: '高级组件',
//   list: jeecgComponentTypes
// })
