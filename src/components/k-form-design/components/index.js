// import DDict from './DDic/DDict.vue'
import SkyMap from './skyMap/JSelectMap.vue'
import DSubtable from './DSubTable/DSubtable.vue'

import JSelectMultiUser from '../../jeecgbiz/JSelectMultiUser.vue'
import JSelectDepart from '../../jeecgbiz/JSelectDepart.vue'
import JSelectRole from '../../jeecgbiz/JSelectRole.vue'
import JSelectPosition from '../../jeecgbiz/JSelectPosition.vue'

import { nodeSchema } from '../packages/utils'

import { MODE_POINT } from '@/components/k-form-design/components/skyMap/mapLoction'

/**
 * 自定义组件KForm配置
 */
export const customComponents = [
  // @depreciated 使用Jeecg的字典增强组件
  // {
  //   type: 'dic', // 表单类型
  //   label: '字典查询', // 标题文字
  //   icon: 'icon-gallery',
  //   component: DDict,
  //   options: {
  //     defaultValue: undefined,
  //     multiple: false,
  //     disabled: false,
  //     width: '100%',
  //     clearable: true,
  //     placeholder: '请选择',
  //     showSearch: false,
  //     showLabel: true,
  //     dic: true,
  //     dicDynamic: 1,
  //     dicOptions: [
  //       {
  //         value: '1',
  //         label: '选项1'
  //       },
  //       {
  //         value: '2',
  //         label: '选项2'
  //       },
  //       {
  //         value: '3',
  //         label: '选项3'
  //       }
  //     ],
  //     dynamicKeyTable: '',
  //     dynamicKeyCode: '',
  //     dynamicKeyText: ''
  //   },
  //   model: '',
  //   key: '',
  //   rules: [
  //     {
  //       required: false,
  //       message: '必填项'
  //     }
  //   ]
  // },
  // TODO 开发新子表组件
  {
    type: 'subtable', // 表单类型
    label: '子表', // 标题文字
    icon: 'icon-gallery',
    component: DSubtable,
    list: [],
    options: {
      subtable: true,
      subtableCode: '',
      showType: 'list', // list:列表，form：表单
      scrollY: 0,
      minLimit: 1,
      disabled: false,
      hidden: false, // 是否隐藏，false显示，true隐藏
      showLabel: false,
      hideSequence: false,
      width: '100%',
      showFileds: {}
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
    type: 'skyMap', // 表单类型
    label: '天地图', // 标题文字
    icon: 'icon-gallery',
    component: SkyMap,
    model: '',
    options: {
      mapUrl: (process.env.BASE_URL || '/') + 'map.html#/', // 新的多页应用-地图选点服务，已集成进基座，不需要再额外部署
      precision: 6, // 精度
      mode: MODE_POINT, // 选择模式
      lnglatSplitChar: ',', // 经纬度分隔符，和iframe页程序协商好，目前不开放表单配置
      lnglatArrSplitChar: ';', // 坐标数组分隔符，和iframe页程序协商好，目前不开放表单配置
      hidden: false // 是否隐藏，false显示，true隐藏
    }
  },
  // 重复了，放jeecg那边
  // {
  //   type: 'j-select-multi-user', // 表单类型
  //   label: '用户多选', // 标题文字
  //   icon: 'icon-gallery',
  //   component: JSelectMultiUser,
  //   options: {
  //     showLabel: true,
  //     hidden: false, // 是否隐藏，false显示，true隐藏
  //     disabled: false // 是否禁用
  //   }
  // },
  {
    type: 'select-dep', // 表单类型
    label: '部门选择', // 标题文字
    icon: 'icon-gallery',
    component: JSelectDepart,
    options: {
      showLabel: true,
      hidden: false, // 是否隐藏，false显示，true隐藏
      disabled: false // 是否禁用
    }

  },
  {
    type: 'select-role', // 表单类型
    label: '角色选择', // 标题文字
    icon: 'icon-gallery',
    component: JSelectRole,
    options: {
      showLabel: true,
      hidden: false, // 是否隐藏，false显示，true隐藏
      disabled: false // 是否禁用
    }
  },
  {
    type: 'select-positon', // 表单类型
    label: '岗位选择', // 标题文字
    icon: 'icon-gallery',
    component: JSelectPosition,
    options: {
      showLabel: true,
      hidden: false, // 是否隐藏，false显示，true隐藏
      disabled: false // 是否禁用
    }
  }
]
// 新方法，直接添加到已存在的分组
nodeSchema.addSchemaToGroup(customComponents)

// 自定义组件types
// export const customComponentTypes = customComponents.map(e => e.type)
// 添加分组，分组去 NodeSchema 统一管理吧
// nodeSchema.addSchemaGroup({
//   title: '自定义组件',
//   list: list.map(e => e.type)
// })
