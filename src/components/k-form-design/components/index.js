import DDict from './DDic/DDict.vue'
import SkyMap from './skyMap/JSelectMap.vue'
import DSubtable from './DSubTable/DSubtable.vue'

import JSelectMultiUser from '../../jeecgbiz/JSelectMultiUser.vue'
import JSelectDepart from '../../jeecgbiz/JSelectDepart.vue'
import JSelectRole from '../../jeecgbiz/JSelectRole.vue'
import JSelectPosition from '../../jeecgbiz/JSelectPosition.vue'

import { nodeSchema } from '../packages/utils'

import { MODE_POINT } from '@/components/k-form-design/components/skyMap/mapLoction'

nodeSchema.addSchemas([
  {
    type: "dic", // 表单类型
    label: "字典查询", // 标题文字
    icon: "icon-gallery",
    component: DDict,
    options: {
      defaultValue: undefined,
      multiple: false,
      disabled: false,
      width: "100%",
      clearable: true,
      placeholder: "请选择",
      showSearch: false,
      showLabel: true,
      dic: true,
      dicDynamic: 1,
      dicOptions: [
        {
          value: "1",
          label: "选项1"
        },
        {
          value: "2",
          label: "选项2"
        },
        {
          value: "3",
          label: "选项3"
        }
      ],
      dynamicKeyTable: "",
      dynamicKeyCode: "",
      dynamicKeyText: ""
    },
    model: "",
    key: "",
    rules: [
      {
        required: false,
        message: "必填项"
      }
    ]
  },
  {
    type: "subtable", // 表单类型
    label: "子表", // 标题文字
    icon: "icon-gallery",
    component: DSubtable,
    list: [],
    options: {
      subtable: true,
      subtableCode: "",
      showType: "list", //list:列表，form：表单
      scrollY: 0,
      minLimit: 1,
      disabled: false,
      hidden: false, // 是否隐藏，false显示，true隐藏
      showLabel: false,
      hideSequence: false,
      width: "100%",
      showFileds:{}
    },
    model: "",
    key: "",
    rules: [
      {
        required: false,
        message: "必填项"
      }
    ],
    help: ""
  },
  {
    type: "skyMap", // 表单类型
    label: "天地图", // 标题文字
    icon: "icon-gallery",
    component: SkyMap,
    model: "",
    options: {
      mapUrl: "/map.html#/", // 新的多页应用-地图选点服务，已集成进基座，不需要再额外部署
      precision: 4, // 精度
      mode: MODE_POINT, // 选择模式
      lnglatSplitChar: ",", // 经纬度分隔符，和iframe页程序协商好，目前不开放表单配置
      lnglatArrSplitChar: ";" // 坐标数组分隔符，和iframe页程序协商好，目前不开放表单配置
    }
  },
  {
    type: "j-select-multi-user", // 表单类型
    label: "用户多选", // 标题文字
    icon: "icon-gallery",
    component: JSelectMultiUser,
    options: {
    },
  },
  {
    type: "select-dep", // 表单类型
    label: "部门选择", // 标题文字
    icon: "icon-gallery",
    component: JSelectDepart,
    options: {
    }

  },
  {
    type: "select-role", // 表单类型
    label: "角色选择", // 标题文字
    icon: "icon-gallery",
    component: JSelectRole,
    options: {
    }

  },
  {
    type: "select-positon", // 表单类型
    label: "岗位选择", // 标题文字
    icon: "icon-gallery",
    component: JSelectPosition,
    options: {
    }

  }
]);

// 添加分组
nodeSchema.addSchemaGroup({
  title: "自定义组件",
  list: ["dic", "subtable", "skyMap", "j-select-multi-user", "select-dep", "select-role", "select-positon"]
});